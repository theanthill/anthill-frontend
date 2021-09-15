import { BigNumber, Contract, ethers, Overrides } from 'ethers';
import { decimalToBalance, balanceToDecimal } from './ether-utils';
import { TransactionResponse } from '@ethersproject/providers';

import { Configuration } from './config';

import ERC20 from './ERC20';
import { Bank, BankInfo, TokenStat, TreasuryAllocationTime } from './types';
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

  chainId: number;

  constructor(cfg: Configuration, liquidityProvider: ILiquidityProvider) {
    const ERC20Tokens = {
      AntToken: 'ANT',
      AntShare: 'ANTS',
      AntBond: 'ANTB',
      MockUSDC: 'USDC',
      MockETH: 'ETH',
    };

    const { deployments } = cfg;
    const provider = getDefaultProvider();

    this.chainId = parseInt(cfg.deployments.chainId);
    this.priceDecimals = cfg.priceDecimals;

    // loads contracts from deployments
    this.contracts = {};
    for (const [name, deployment] of Object.entries(deployments.contracts)) {
      if (deployment.address) {
        this.contracts[name] = new Contract(deployment.address, deployment.abi, provider);
      }
    }

    this.tokens = {};
    for (const [tokenName, symbol] of Object.entries(ERC20Tokens)) {
      const token = deployments.contracts[tokenName];
      this.tokens[tokenName] = this.tokens[symbol] = new ERC20(token.address, provider, symbol);
    }

    this.config = cfg;
    this.provider = provider;
    this.liquidityProvider = liquidityProvider;
  }

  /**
   * @param provider From an unlocked wallet. (e.g. Metamask)
   * @param account An address of unlocked wallet account.
   */
  unlockWallet(provider: any, account: string) {
    const newProvider = new ethers.providers.Web3Provider(provider, this.chainId);

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
      this.tokens.USDC,
      this.priceDecimals,
    );
    const antTokenTargetPrice = await this.getAntTokenTargetPrice();

    return tokenPairPrice[0] / antTokenTargetPrice;
  }

  async _getAntTokenPriceRatioLatest(): Promise<number> {
    const tokenPairPrice = await this.liquidityProvider.getPairPriceLatest(
      this.tokens.ANT,
      this.tokens.USDC,
      this.priceDecimals,
    );
    const antTokenTargetPrice = await this.getAntTokenTargetPrice();

    return tokenPairPrice[0] / antTokenTargetPrice;
  }

  /**
   * @returns Price in USDC from last seigniorage, price in USDC from PancakeSwap and
   *          current total supply
   */
  async getAntTokenStat(): Promise<TokenStat> {
    const estimatedPriceEpoch = await this._getAntTokenPriceRatioTWAP();
    const estimatedPriceRealTime = await this._getAntTokenPriceRatioLatest();

    return {
      priceInUSDCLastEpoch: estimatedPriceEpoch.toFixed(this.priceDecimals),
      priceInUSDCRealTime: estimatedPriceRealTime.toFixed(this.priceDecimals),
      totalSupply: await this.tokens.ANT.displayedTotalSupply(),
    };
  }

  /**
   * @returns Ant Bond price in USDC and total supply
   */
  async getAntBondStat(): Promise<TokenStat> {
    const antTokenPriceEpoch = await this._getAntTokenPriceRatioTWAP();
    const antTokenPriceRealTime = await this._getAntTokenPriceRatioLatest();
    const antBondPriceEpoch = 1.0 / antTokenPriceEpoch;
    const antBondPriceRealTime = 1.0 / antTokenPriceRealTime;

    return {
      priceInUSDCLastEpoch: antBondPriceEpoch.toFixed(this.priceDecimals),
      priceInUSDCRealTime: antBondPriceRealTime.toFixed(this.priceDecimals),
      totalSupply: await this.tokens.ANTB.displayedTotalSupply(),
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

  async _getLiquidityPositions(bank: Bank) {
    const stakingHelper = this.contracts[bank.providerHelperName];
    const balance = await stakingHelper.balanceOf(this.myAccount);

    let tokenIds = [];
    for (let i = 0; i < balance; ++i) {
      tokenIds.push(await stakingHelper.tokenOfOwnerByIndex(this.myAccount, i));
    }
    return tokenIds;
  }

  async getUserTotalLiquidity(bank: Bank): Promise<BigNumber> {
    const positions = await this._getLiquidityPositions(bank);

    const [amount0, amount1] = await this.liquidityProvider.getUserLiquidity(
      bank.token0,
      bank.token1,
      positions,
    );

    return amount0.add(amount1);
  }

  async getUserLiquidityAmounts(bank: Bank): Promise<[BigNumber, BigNumber]> {
    const positions = await this._getLiquidityPositions(bank);

    return this.liquidityProvider.getUserLiquidity(bank.token0, bank.token1, positions);
  }

  async getBankTotalLiquidity(bank: Bank): Promise<Array<BigNumber>> {
    return this.liquidityProvider.getTotalLiquidity(
      this.tokens[bank.token0Name],
      this.tokens[bank.token1Name],
    );
  }

  /* TODO */
  async getBankTotalSupply(bank: Bank): Promise<BigNumber> {
    const stakingHelper = this.contracts[bank.providerHelperName];
    return stakingHelper.getTotalStakedLiquidity();
  }

  async earnedFromBank(bank: Bank): Promise<BigNumber> {
    const stakingPool = this.contracts[bank.contract];
    const positions = await this._getLiquidityPositions(bank);

    let totalReward = BigNumber.from(0);
    for (let i = 0; i < positions.length; ++i) {
      const reward = await stakingPool.callStatic.getRewardInfo(positions[i]);
      totalReward = totalReward.add(reward);
    }

    return totalReward;
  }

  async getBankRewardRate(bank: Bank): Promise<BigNumber> {
    const stakingPool = this.contracts[bank.contract];
    return stakingPool.getRewardRate();
  }

  async addLiquidityAndStake(
    bank: Bank,
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

  async removeLiquidityAndExit(bank: Bank, deadline: number) {
    const stakingHelper = this.contracts[bank.providerHelperName];

    const positions = await this._getLiquidityPositions(bank);

    for (let i = 0; i < positions.length; ++i) {
      await stakingHelper.withdrawAndRemoveLiquidity(positions[i], deadline);
    }
  }

  /* ======================= Boardroom ====================== */

  async fetchBoardroomVersionOfUser(): Promise<string> {
    return 'latest';
  }

  boardroomByVersion(version: string): Contract {
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
    const { MockStdReference } = this.contracts;
    return MockStdReference.setTestRate(amount);
  }

  async getTokenPriceInUSDC(tokenName: string): Promise<BigNumber> {
    if (tokenName === this.tokens.ANT.symbol) {
      const tokenPrice = await this._getAntTokenPriceRatioLatest();
      return decimalToBalance(tokenPrice);
    }

    const { MockStdReference } = this.contracts;
    const priceData = await MockStdReference.getReferenceData(tokenName, 'USDC');

    return priceData.rate;
  }

  async allocateSeigniorage(): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    return await Treasury.allocateSeigniorage();
  }

  /* ================ Liquidity Pools ================== */

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
