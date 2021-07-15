import { BigNumber, Contract, ethers, Overrides } from 'ethers';
import { decimalToBalance, balanceToDecimal } from './ether-utils';
import { TransactionResponse } from '@ethersproject/providers';
import { Configuration } from './config';
import { bankDefinitions } from '../config'

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

    this.contracts['PancakeRouter'] = liquidityProvider.getRouterContract();

    // PancakeSwap V2 Pairs
    for(const bank of Object.keys(bankDefinitions))
    {
      if (bankDefinitions[bank].chainIds.length>0 && !bankDefinitions[bank].chainIds.includes(this.ChainId))
      {
        continue;
      }
      console.log("Bank: " + bankDefinitions[bank].contract);

      const pairName = bankDefinitions[bank].depositTokenName;
      this.contracts[pairName] = new Contract(
        externalTokens[pairName].address,
        liquidityProvider.getPairABI(),
        provider,
      );  
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
    
    this.contracts.PancakeRouter = this.contracts.PancakeRouter.connect(this.signer);

    // PancakeSwap V2 Pairs
    for(const bank of Object.keys(bankDefinitions))
    {
      if (bankDefinitions[bank].chainIds.length>0 && !bankDefinitions[bank].chainIds.includes(this.ChainId))
      {
        continue;
      }
      const pairName = bankDefinitions[bank].depositTokenName;
      this.contracts[pairName] = this.contracts[pairName].connect(this.signer);
    }  

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

  /* =========== Price functions ============== */
  
  /**
   * @returns Ant Token price from last seigniorage update
   */
  async getTokenPriceEpoch(tokenContract: ERC20): Promise<number> {
    const { Oracle } = this.contracts;
    return balanceToDecimal(await Oracle.priceTWAP(tokenContract.address));
  }
  
  /**
   * @returns Get exchange rate for bonds in BN format
   */
  async getAntBondExchangeRate(): Promise<BigNumber> {
    const { Oracle } = this.contracts;
    return await Oracle.priceTWAP(this.tokens.ANT.address);
  }

  /**
   * 
   * @param tokenContract ERC20 token for which to get the price against BUSD
   * 
   * @returns The price of the requested token as given by PancakeSwap in real time
   */
  async getTokenPriceRealTime(tokenContract: ERC20): Promise<number> {
    return this.liquidityProvider.getTokenPriceRealTime(this.tokens.BUSD, tokenContract);
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
  async getAntTokenCalculatedPriceEpoch(): Promise<number> {
    const antTokenCurrentPrice = await this.getTokenPriceEpoch(this.tokens.ANT);
    const antTokenTargetPrice = await this.getAntTokenTargetPrice();

    return antTokenCurrentPrice / antTokenTargetPrice;
  }

  async getAntTokenCalculatedPriceRealTime(): Promise<number> {
    const antTokenCurrentPrice = await this.getTokenPriceRealTime(this.tokens.ANT);
    const antTokenTargetPrice = await this.getAntTokenTargetPrice();

    return antTokenCurrentPrice / antTokenTargetPrice;
  }

  /**
   * @returns Price in BUSD from last seigniorage, price in BUSD from PancakeSwap and
   *          current total supply
   */
  async getAntTokenStat(): Promise<TokenStat> {
    const estimatedPriceEpoch = await this.getAntTokenCalculatedPriceEpoch();
    const estimatedPriceRalTime = await this.getAntTokenCalculatedPriceRealTime();

    return {
      priceInBUSDLastEpoch: estimatedPriceEpoch.toFixed(this.priceDecimals),
      priceInBUSDRealTime: estimatedPriceRalTime.toFixed(this.priceDecimals),
      totalSupply: await this.tokens.ANT.displayedTotalSupply(),
    };
  }

  /**
   * @returns Ant Bond price in BUSD and total supply
   */
  async getAntBondStat(): Promise<TokenStat> {
    const antTokenPriceEpoch = await this.getAntTokenCalculatedPriceEpoch();
    const antTokenPriceRealTime = await this.getAntTokenCalculatedPriceRealTime();
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

  /* ================================================ */

  /**
   * Buy Ant Bonds with Ant Token.
   * @param amount amount of Ant Token to purchase Ant Bonds with.
   */
  async buyAntBonds(amount: string | number, targetPrice: BigNumber): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const bondsAmount = decimalToBalance(amount);
    return await Treasury.buyAntBonds(bondsAmount, targetPrice);
  }

  /**
   * Redeem Ant Bonds for Ant Token.
   * @param amount amount of Ant Bonds to redeem.
   */
  async redeemAntBonds(amount: string | number, targetPrice: BigNumber): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const redeemAmount = decimalToBalance(amount);
    return await Treasury.redeemAntBonds(redeemAmount, targetPrice);
  }

  async earnedFromBank(poolName: ContractName, account = this.myAccount): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      return await pool.earned(account);
    } catch (err) {
      console.error(`Failed to call earned() on pool ${pool.address}: ${err.stack}`);
      return BigNumber.from(0);
    }
  }

  async getBankRewardRate(poolName: ContractName): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      return await pool.rewardRate();
    } catch (err) {
      console.error(`Failed to call earned() on pool ${pool.address}: ${err.stack}`);
      return BigNumber.from(0);
    }
  }

  async getBankTotalSupply(poolName: ContractName): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      return await pool.totalSupply();
    } catch (err) {
      console.error(`Failed to call earned() on pool ${pool.address}: ${err.stack}`);
      return BigNumber.from(0); 
    }
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
   * Transfers earned token reward from given pool to my account.
   */
  async harvest(poolName: ContractName): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    const gas = await pool.estimateGas.getMyReward();
    return await pool.getMyReward(this.gasOptions(gas));
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
      throw new Error("you're using old Boardroom. please withdraw and deposit the ANTS again.");
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

  async getTokenPriceInBUSD(tokenName: string): Promise<BigNumber> {
    const { MockStdReference } = this.contracts;
    const priceData = await MockStdReference.getReferenceData(tokenName, "BUSD");
    
    return priceData.rate;
  }

  async allocateSeigniorage(): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    return await Treasury.allocateSeigniorage();
  }

  // Liquidity
  async getUserStakedLiquidity(bank: BankInfo): Promise<Array<BigNumber>>
  {
    const stakedLiquidity = await this.stakedBalanceOnBank(bank.contract, this.myAccount);
    let pairLiquidity =  await this.contracts[bank.depositTokenName].balanceOf(this.myAccount); 
    pairLiquidity = pairLiquidity.add(stakedLiquidity);

    return this.getUserLiquidity(bank, pairLiquidity);
  }

  async getUserLiquidity(bank: BankInfo, pairLiquidity: BigNumber): Promise<Array<BigNumber>>
  {
    const totalSupply = await this.contracts[bank.depositTokenName].totalSupply();

    return this.liquidityProvider.getLiquidity(this.tokens[bank.token0Name],
                                               this.tokens[bank.token1Name],
                                               pairLiquidity, totalSupply);
  }

  async getLockedLiquidity(bank: BankInfo): Promise<Array<BigNumber>>
  {
    const stakedLiquidity = await this.getBankTotalSupply(bank.contract);
    const totalSupply = await this.contracts[bank.depositTokenName].totalSupply();

    return this.liquidityProvider.getLiquidity(this.tokens[bank.token0Name],
                                               this.tokens[bank.token1Name],
                                               stakedLiquidity, totalSupply);
  }

  async getTotalLiquidity(bank: Bank): Promise<Array<BigNumber>>
  {
    return this.liquidityProvider.getTotalLiquidity(this.tokens[bank.token0Name], this.tokens[bank.token1Name]);
  }

  async getPairPrice(bank: BankInfo): Promise<[number, number]>
  {
    return this.liquidityProvider.getPairPrice(this.tokens[bank.token0Name], this.tokens[bank.token1Name]);
  }

  // Faucet
  async getFreeTokens() : Promise<TransactionResponse> 
  {
    const {TokenFaucet} = this.contracts;
    return await TokenFaucet.refill();
  }
}
