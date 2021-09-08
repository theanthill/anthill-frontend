import { BigNumber, Contract, ethers, Overrides } from 'ethers';
import { decimalToBalance, balanceToDecimal } from './ether-utils';
import { TransactionResponse } from '@ethersproject/providers';
import { Configuration } from './config';

import ERC20 from './ERC20';
import { Bank, BankInfo, ContractName, TokenStat, TreasuryAllocationTime } from './types';
import { getDefaultProvider } from '../utils/provider';
import { ILiquidityProvider } from './ILiquidityProvider';

/**
 * An API module of The Anthill contracts.
 * All contract-interacting domain logic should be defined in here.
 */
export class AntToken {
  myAccount: string;
  provider: ethers.providers.Web3Provider;
  liquidityProvider: ILiquidityProvider;
  signer?: ethers.Signer;
  config: Configuration;
  contracts: { [name: string]: Contract };
  internalTokens: { [name: string]: ERC20 };
  externalTokens: { [name: string]: ERC20 };
  tokens: { [name: string]: ERC20 };
  boardroomVersionOfUser?: string;
  priceDecimals: number;

  ANTBUSD: Contract;
  ANTBNB: Contract;
  PancakeRouter: Contract;

  ChainId: number;

  constructor(cfg: Configuration, liquidityProvider: ILiquidityProvider) {
    const { deployments, externalTokens } = cfg;
    const provider = getDefaultProvider();

    this.ChainId = cfg.chainId;
    this.priceDecimals = cfg.priceDecimals;

    // loads contracts from deployments
    this.contracts = {};
    for (const [name, deployment] of Object.entries(deployments)) {
      this.contracts[name] = new Contract(deployment.address, deployment.abi, provider);
    }

    this.tokens = {};
    for (const symbol of Object.keys(externalTokens)) {
      const token = externalTokens[symbol];
      this.tokens[symbol] = new ERC20(token.address, provider, symbol, token.decimals);
    }

    this.tokens['ANT'] = new ERC20(deployments.AntToken.address, provider, 'ANT');
    this.tokens['ANTS'] = new ERC20(deployments.AntShare.address, provider, 'ANTS');
    this.tokens['ANTB'] = new ERC20(deployments.AntBond.address, provider, 'ANTB');

    this.config = cfg;
    this.provider = provider;
    this.liquidityProvider = liquidityProvider;
  }

  /**
   * @param provider From an unlocked wallet. (e.g. Metamask)
   * @param account An address of unlocked wallet account.
   */
  unlockWallet(provider: any, account: string) {
    const newProvider = new ethers.providers.Web3Provider(provider, this.config.chainId);

    this.signer = newProvider.getSigner(0);
    this.myAccount = account;
    for (const [name, contract] of Object.entries(this.contracts)) {
      this.contracts[name] = contract.connect(this.signer);
    }
    const tokens = [...Object.values(this.tokens)];
    for (const token of tokens) {
      token.connect(this.signer);
    }

    this.liquidityProvider.unlockWallet(this.signer);

    console.log(`🔓 Wallet is unlocked. Welcome, ${account}!`);
    this.fetchBoardroomVersionOfUser()
      .then((version) => (this.boardroomVersionOfUser = version))
      .catch((err) => {
        console.error(`Failed to fetch boardroom version: ${err.stack}`);
        this.boardroomVersionOfUser = 'latest';
      });
  }

  get isUnlocked(): boolean {
    return !!this.myAccount;
  }

  gasOptions(gas: BigNumber): Overrides {
    const multiplied = Math.floor(gas.toNumber() * this.config.gasLimitMultiplier);
    console.log(`⛽️ Gas multiplied: ${gas} -> ${multiplied}`);
    return {
      gasLimit: BigNumber.from(multiplied),
    };
  }

  /* =========== Stats ============== */

  /**
   * @returns Get exchange rate for bonds in BN format
   */
  async getAntBondExchangeRate(): Promise<BigNumber> {
    const price = await this._getAntTokenPriceRatioTWAP();
    const units = BigNumber.from(10).pow(18);
    return BigNumber.from(price * 1000)
      .mul(units)
      .div(1000);
  }

  /**
   * @returns Ant Token current target price
   */
  async getAntTokenTargetPrice(): Promise<number> {
    const { Oracle } = this.contracts;
    const price = await Oracle.priceDollar();
    return balanceToDecimal(price);
  }

  /**
   * @returns
   */
  async _getAntTokenPriceRatioTWAP(): Promise<number> {
    const tokenPairPrice = await this.liquidityProvider.getPairPriceTWAP(
      this.tokens.ANT,
      this.tokens.BUSD,
      this.priceDecimals,
    );
    const antTokenTargetPrice = await this.getAntTokenTargetPrice();

    return tokenPairPrice[0] / antTokenTargetPrice;
  }

  async _getAntTokenPriceRatioLatest(): Promise<number> {
    const tokenPairPrice = await this.liquidityProvider.getPairPriceLatest(
      this.tokens.ANT,
      this.tokens.BUSD,
      this.priceDecimals,
    );
    const antTokenTargetPrice = await this.getAntTokenTargetPrice();

    return tokenPairPrice[0] / antTokenTargetPrice;
  }

  /**
   * @returns Price in BUSD from last seigniorage, price in BUSD from PancakeSwap and
   *          current total supply
   */
  async getAntTokenStat(): Promise<TokenStat> {
    const estimatedPriceEpoch = await this._getAntTokenPriceRatioTWAP();
    const estimatedPriceRealTime = await this._getAntTokenPriceRatioLatest();

    return {
      priceInBUSDLastEpoch: estimatedPriceEpoch.toFixed(this.priceDecimals),
      priceInBUSDRealTime: estimatedPriceRealTime.toFixed(this.priceDecimals),
      totalSupply: await this.tokens.ANT.displayedTotalSupply(),
    };
  }

  /**
   * @returns Ant Bond price in BUSD and total supply
   */
  async getAntBondStat(): Promise<TokenStat> {
    const antTokenPriceEpoch = await this._getAntTokenPriceRatioTWAP();
    const antTokenPriceRealTime = await this._getAntTokenPriceRatioLatest();
    const antBondPriceEpoch = 1.0 / antTokenPriceEpoch;
    const antBondPriceRealTime = 1.0 / antTokenPriceRealTime;

    return {
      priceInBUSDLastEpoch: antBondPriceEpoch.toFixed(this.priceDecimals),
      priceInBUSDRealTime: antBondPriceRealTime.toFixed(this.priceDecimals),
      totalSupply: await this.tokens.ANTB.displayedTotalSupply(),
    };
  }

  /**
   * @returns Ant Bond total supply (there is no price for the share)
   */
  async getAntShareStat(): Promise<TokenStat> {
    return {
      priceInBUSDLastEpoch: '0',
      priceInBUSDRealTime: '0',
      totalSupply: await this.tokens.ANTS.displayedTotalSupply(),
    };
  }

  /* ================== Bonds ======================== */

  /**
   * Buy Ant Bonds with Ant Token.
   * @param amount amount of Ant Token to purchase Ant Bonds with.
   */
  async buyAntBonds(
    amount: string | number,
    targetPrice: BigNumber,
  ): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const bondsAmount = decimalToBalance(amount);
    return await Treasury.buyAntBonds(bondsAmount, targetPrice);
  }

  /**
   * Redeem Ant Bonds for Ant Token.
   * @param amount amount of Ant Bonds to redeem.
   */
  async redeemAntBonds(
    amount: string | number,
    targetPrice: BigNumber,
  ): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const redeemAmount = decimalToBalance(amount);
    return await Treasury.redeemAntBonds(redeemAmount, targetPrice);
  }

  /* ==================== Staking pools ======================= */

  /* USED */
  async _getLiquidityPositions(bank: BankInfo) {
    const stakingHelper = this.contracts[bank.providerHelperName];
    const balance = await stakingHelper.balanceOf(this.myAccount);

    let tokenIds = [];
    for (let i = 0; i < balance; ++i) {
      tokenIds.push(await stakingHelper.tokenOfOwnerByIndex(this.myAccount, i));
    }
    return tokenIds;
  }

  /* USED */
  async getUserStakedLiquidity(bank: BankInfo): Promise<BigNumber> {
    const positions = await this._getLiquidityPositions(bank);
    return this.liquidityProvider.getUserLiquidity(positions);
  }

  /* USED */
  async getUserTotalLiquidity(bank: BankInfo): Promise<BigNumber> {
    const positions = await this._getLiquidityPositions(bank);
    return this.liquidityProvider.getUserLiquidity(positions);
  }

  /* USED */
  async getUserLockedLiquidity(bank: BankInfo): Promise<Array<BigNumber>> {
    // TODO
    return this.liquidityProvider.getAccountLiquidity(
      this.tokens[bank.token0Name],
      this.tokens[bank.token1Name],
      this.myAccount,
    );
  }

  /* USED */
  async getTotalLiquidity(bank: Bank): Promise<Array<BigNumber>> {
    return this.liquidityProvider.getTotalLiquidity(
      this.tokens[bank.token0Name],
      this.tokens[bank.token1Name],
    );
  }

  /* USED */
  async earnedFromBank(bank: BankInfo): Promise<BigNumber> {
    const stakingPool = this.contracts[bank.contract];
    const positions = await this._getLiquidityPositions(bank);

    let totalReward = BigNumber.from(0);
    for (let i = 0; i < positions.length; ++i) {
      const reward = await stakingPool.getRewardInfo(positions[i]);
      totalReward = totalReward.add(reward);
    }

    return totalReward;
  }

  /* USED */
  async getBankRewardRate(bank: BankInfo): Promise<BigNumber> {
    const stakingPool = this.contracts[bank.contract];
    return stakingPool.getRewardRate();
  }

  async getBankTotalSupply(bank: BankInfo): Promise<BigNumber> {
    const stakingPool = this.contracts[bank.contract];
    return stakingPool.getTotalStakedLiquidity();
  }

  async stakedBalanceOnBank(
    poolName: ContractName,
    account = this.myAccount,
  ): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      return await pool.balanceOf(account);
    } catch (err) {
      console.error(`Failed to call balanceOf() on pool ${pool.address}: ${err.stack}`);
      return BigNumber.from(0);
    }
  }

  /* USED */
  async addLiquidityAndStake(
    bank: BankInfo,
    amount0Desired: BigNumber,
    amount1Desired: BigNumber,
    amount0Min: BigNumber,
    amount1Min: BigNumber,
    deadline: number,
  ) {
    const stakingHelper = this.contracts[bank.providerHelperName];
    return stakingHelper.addLiquidityAndStake(
      amount0Desired,
      amount1Desired,
      amount0Min,
      amount1Min,
      deadline,
    );
  }

  /* USED */
  async exitAndRemoveLiquidity(bank: BankInfo, deadline: number) {
    const stakingHelper = this.contracts[bank.providerHelperName];

    const positions = await this._getLiquidityPositions(bank);

    for (let i = 0; i < positions.length; ++i) {
      await stakingHelper.withdrawAndRemoveLiquidity(positions[i], deadline);
    }
  }

  /**
   * Deposits token to given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 BUSD * 10^18)
   * @returns {string} Transaction hash
   */
  async stake(poolName: ContractName, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    const gas = await pool.estimateGas.stake(amount);
    return await pool.stake(amount, this.gasOptions(gas));
  }

  /**
   * Withdraws token from given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 BUSD * 10^18)
   * @returns {string} Transaction hash
   */
  async unstake(poolName: ContractName, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    const gas = await pool.estimateGas.withdraw(amount);
    return await pool.withdraw(amount, this.gasOptions(gas));
  }

  /**
   * Harvests and withdraws deposited tokens from the pool.
   */
  async settleWithdraw(providerHelperName: ContractName): Promise<TransactionResponse> {
    const liquidityHelper = this.contracts[providerHelperName];
    const deadline = Math.floor(new Date().getTime() / 1000) + 1800;
    var gas = await liquidityHelper.estimateGas.exit(deadline);
    return await liquidityHelper.exit(deadline, this.gasOptions(gas));
  }

  /* ======================= Boardroom ====================== */

  async fetchBoardroomVersionOfUser(): Promise<string> {
    return 'latest';
  }

  boardroomByVersion(version: string): Contract {
    // if (version === 'v1') {
    //   return this.contracts.Boardroom1;
    // }
    // if (version === 'v2') {
    //   return this.contracts.Boardroom2;
    // }
    return this.contracts.Boardroom;
  }

  currentBoardroom(): Contract {
    if (!this.boardroomVersionOfUser) {
      throw new Error('you must unlock the wallet to continue.');
    }
    return this.boardroomByVersion(this.boardroomVersionOfUser);
  }

  isOldBoardroomMember(): boolean {
    return this.boardroomVersionOfUser !== 'latest';
  }

  async stakeAntShareToBoardroom(amount: string): Promise<TransactionResponse> {
    if (this.isOldBoardroomMember()) {
      throw new Error(
        "you're using old Boardroom. please withdraw and deposit the ANTS again.",
      );
    }
    const Boardroom = this.currentBoardroom();
    return await Boardroom.stake(decimalToBalance(amount));
  }

  async getStakedAntSharesOnBoardroom(): Promise<BigNumber> {
    const Boardroom = this.currentBoardroom();
    if (this.boardroomVersionOfUser === 'v1') {
      return await Boardroom.getAntShareOf(this.myAccount);
    }
    return await Boardroom.balanceOf(this.myAccount);
  }

  async getEarningsOnBoardroom(): Promise<BigNumber> {
    const Boardroom = this.currentBoardroom();
    if (this.boardroomVersionOfUser === 'v1') {
      return await Boardroom.getAntTokenEarningsOf(this.myAccount);
    }
    return await Boardroom.earned(this.myAccount);
  }

  async withdrawAntShareFromBoardroom(amount: string): Promise<TransactionResponse> {
    const Boardroom = this.currentBoardroom();
    return await Boardroom.withdraw(decimalToBalance(amount));
  }

  async harvestAntTokenFromBoardroom(): Promise<TransactionResponse> {
    const Boardroom = this.currentBoardroom();
    if (this.boardroomVersionOfUser === 'v1') {
      return await Boardroom.claimDividends();
    }
    return await Boardroom.claimReward();
  }

  async exitFromBoardroom(): Promise<TransactionResponse> {
    const Boardroom = this.currentBoardroom();
    return await Boardroom.exit();
  }

  async getTreasuryNextAllocationTime(): Promise<TreasuryAllocationTime> {
    const { Treasury } = this.contracts;
    const nextEpochTimestamp: BigNumber = await Treasury.nextEpochPoint();
    const period: BigNumber = await Treasury.getPeriod();

    const nextAllocation = new Date(nextEpochTimestamp.mul(1000).toNumber());
    const prevAllocation = new Date(nextAllocation.getTime() - period.toNumber() * 1000);
    return { prevAllocation, nextAllocation };
  }

  async changeDollarPrice(amount: BigNumber): Promise<TransactionResponse> {
    const { BandOracle } = this.contracts;
    return BandOracle.setTestRate(amount);
  }

  async getTokenPriceInBUSD(tokenName: string): Promise<BigNumber> {
    if (tokenName === this.tokens.ANT.symbol) {
      const tokenPrice = await this._getAntTokenPriceRatioLatest();
      return decimalToBalance(tokenPrice);
    }

    const { BandOracle } = this.contracts;
    const priceData = await BandOracle.getReferenceData(tokenName, 'BUSD');

    return priceData.rate;
  }

  async allocateSeigniorage(): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    return await Treasury.allocateSeigniorage();
  }

  /* ================ Liquidity Pools ================== */
  async getPoolLiquidity(bank: Bank): Promise<BigNumber> {
    return this.liquidityProvider.getPoolLiquidity(
      this.tokens[bank.token0Name],
      this.tokens[bank.token1Name],
    );
  }

  async getPoolSqrtPriceX96(bank: Bank): Promise<BigNumber> {
    return this.liquidityProvider.getPoolSqrtPriceX96(
      this.tokens[bank.token0Name],
      this.tokens[bank.token1Name],
    );
  }

  async getPoolCurrentTick(bank: Bank): Promise<number> {
    return this.liquidityProvider.getPoolCurrentTick(
      this.tokens[bank.token0Name],
      this.tokens[bank.token1Name],
    );
  }

  /* USED */
  async getPairPrice(bank: BankInfo): Promise<[number, number]> {
    return this.liquidityProvider.getPairPriceLatest(
      this.tokens[bank.token0Name],
      this.tokens[bank.token1Name],
      this.priceDecimals,
    );
  }

  async quoteExactInput(
    bank: BankInfo,
    token0In: boolean,
    amount: BigNumber,
  ): Promise<BigNumber> {
    return token0In
      ? this.liquidityProvider.quoteExactInput(
          this.tokens[bank.token0Name],
          this.tokens[bank.token1Name],
          amount,
        )
      : this.liquidityProvider.quoteExactInput(
          this.tokens[bank.token1Name],
          this.tokens[bank.token0Name],
          amount,
        );
  }

  async swapExactInput(
    bank: BankInfo,
    token0In: boolean,
    amountIn: BigNumber,
    amountOutMin: BigNumber,
  ): Promise<TransactionResponse> {
    return token0In
      ? this.liquidityProvider.swapExactInput(
          this.tokens[bank.token0Name],
          this.tokens[bank.token1Name],
          amountIn,
          amountOutMin,
          this.myAccount,
        )
      : this.liquidityProvider.swapExactInput(
          this.tokens[bank.token1Name],
          this.tokens[bank.token0Name],
          amountIn,
          amountOutMin,
          this.myAccount,
        );
  }

  // Faucet
  async getFreeTokens(): Promise<TransactionResponse> {
    const { TokenFaucet } = this.contracts;
    return await TokenFaucet.refill();
  }
}
