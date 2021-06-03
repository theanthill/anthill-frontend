import { useContext } from 'react'
import { ThemeContext } from 'styled-components'

import { BigNumber, Contract, ethers, Overrides } from 'ethers';
import { decimalToBalance } from './ether-utils';
import { TransactionResponse } from '@ethersproject/providers';

// [workerant] ADD BACK for real deploy
//import { Fetcher, Route, Token } from '@pancakeswap-libs/sdk';
import { Pair, TokenAmount, ChainId } from '@pancakeswap-libs/sdk';
import { Fetcher, Route, Token } from '@theanthill/pancakeswap-sdk-v1';
import { abi as IPancakeRouter02ABI } from '@theanthill/pancake-swap-periphery/build/IPancakeRouter02.json'
import IUniswapV2PairABI from './IUniswapV2Pair.abi.json';

import { Configuration } from './config';
import ERC20 from './ERC20';
import { ContractName, TokenStat, TreasuryAllocationTime } from './types';
import { getDefaultProvider } from '../utils/provider';

/**
 * An API module of The Anthill contracts.
 * All contract-interacting domain logic should be defined in here.
 */
export class AntToken {
  myAccount: string;
  provider: ethers.providers.Web3Provider;
  signer?: ethers.Signer;
  config: Configuration;
  contracts: { [name: string]: Contract };
  internalTokens: { [name: string]: ERC20 };
  externalTokens: { [name: string]: ERC20 };
  tokens: { [name: string]: ERC20 };
  boardroomVersionOfUser?: string;
  priceDecimals: number;

  ANTBUSD: Contract;
  PancakeRouter: Contract;
  ANT: ERC20;
  ANTS: ERC20;
  ANTB: ERC20;

  ANTBUSDPair: Pair;

  ChainId: Number;

  constructor(cfg: Configuration) {
    const { deployments, externalTokens } = cfg;
    const provider = getDefaultProvider();

    this.ChainId = cfg.chainId;
    this.priceDecimals = cfg.priceDecimals;

    // loads contracts from deployments
    this.contracts = {};
    for (const [name, deployment] of Object.entries(deployments)) {
      this.contracts[name] = new Contract(deployment.address, deployment.abi, provider);
    }

    this.externalTokens = {};
    this.tokens = {};
    for (const symbol of Object.keys(externalTokens)) {
      const token = externalTokens[symbol];
      this.tokens[symbol] = this.externalTokens[symbol] = new ERC20(token.address, provider, symbol, token.decimals);
    }
    
    this.internalTokens = {};

    this.ANT = new ERC20(deployments.AntToken.address, provider, 'ANT');
    this.tokens['ANT'] = this.internalTokens['ANT'] = this.ANT;
    this.ANTS = new ERC20(deployments.AntShare.address, provider, 'ANTS');
    this.tokens['ANTS'] = this.internalTokens['ANTS'] = this.ANTS;
    this.ANTB = new ERC20(deployments.AntBond.address, provider, 'ANTB');
    this.tokens['ANTB'] = this.internalTokens['ANTB'] = this.ANTB;

    this.PancakeRouter = new Contract(this.externalTokens['PancakeRouter'].address, IPancakeRouter02ABI, provider);

    // PancakeSwap V2 Pair
    this.ANTBUSD = new Contract(
      externalTokens['ANT-BUSD'].address,
      IUniswapV2PairABI,
      provider,
    );

    this.config = cfg;
    this.provider = provider;
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
    const tokens = [this.ANT, this.ANTS, this.ANTB, ...Object.values(this.externalTokens)];
    for (const token of tokens) {
      token.connect(this.signer);
    }
    this.ANTBUSD = this.ANTBUSD.connect(this.signer);
    this.PancakeRouter = this.PancakeRouter.connect(this.signer);

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

  /**
   * @returns Ant Token (ANT) stats from Uniswap.
   * It may differ from the ANT price used on Treasury (which is calculated in TWAP)
   */
  async getAntTokenStatFromPancakeSwap(): Promise<TokenStat> {
    const supply = await this.ANT.displayedTotalSupply();
    const antTokenPrice = Number(await this.getTokenPriceFromPancakeSwap(this.ANT))
    const realAntTokenPrice = Number(await this.getRealAntTokenPrice()) / 10**18

    return {
      // [workerant] TODO: review this
      //priceInBUSD: String((antTokenPrice / realAntTokenPrice).toFixed(priceDecimals)),
      priceInBUSD: String((realAntTokenPrice).toFixed(this.priceDecimals)),
      totalSupply: supply,
    };
  }

  /**
   * @returns Estimated Ant Token (ANT) price data,
   * calculated by 1-day Time-Weight Averaged Price (TWAP).
   */
  async getAntTokenStatInEstimatedTWAP(): Promise<TokenStat> {
    const { Oracle } = this.contracts;

    const estimatedAntTokenPrice = await Oracle.price1Current();
    const realAntTokenPrice = await this.getRealAntTokenPrice()
    const totalSupply = await this.ANT.displayedTotalSupply();

    return {
      priceInBUSD: String((Number(estimatedAntTokenPrice) / Number(realAntTokenPrice)).toFixed(this.priceDecimals)),
      totalSupply,
    };
  }

  async getAntTokenPriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getAntTokenPrice();
  }

  async getRealAntTokenPrice(): Promise<BigNumber> {
    const { Oracle } = this.contracts;
    return Oracle.antTokenPriceOne();
  }

  async getAntBondStat(): Promise<TokenStat> {
    const realAntTokenPrice = Number(await this.getRealAntTokenPrice());
    const antTokenPrice = Number(await this.getAntTokenPriceInLastTWAP());

    const antBondPrice = 1 / (antTokenPrice / realAntTokenPrice)

    return {
      priceInBUSD: String(antBondPrice.toFixed(this.priceDecimals)),
      totalSupply: await this.ANTB.displayedTotalSupply(),
    };
  }

  async getAntShareStat(): Promise<TokenStat> {
    return {
      priceInBUSD: '0',
      totalSupply: await this.ANTS.displayedTotalSupply(),
    };
  }

  async getTokenPriceFromPancakeSwap(tokenContract: ERC20): Promise<string> {
    await this.provider.ready;

    const { chainId } = this.config;
    const { BUSD } = this.config.externalTokens;

    const busd = new Token(chainId, BUSD.address, BUSD.decimals);
    const token = new Token(chainId, tokenContract.address, 18);

    try {
      const busdToToken = await Fetcher.fetchPairData(busd, token, this.provider, this.ChainId == ChainId.MAINNET);
      const priceInBUSD = new Route([busdToToken], token);
      return priceInBUSD.midPrice.toSignificant(3);
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  /**
   * Buy Ant Bonds with Ant Token.
   * @param amount amount of Ant Token to purchase Ant Bonds with.
   */
  async buyAntBonds(amount: string | number, targetPrice: string | number): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    return await Treasury.buyAntBonds(decimalToBalance(amount), targetPrice);
  }

  /**
   * Redeem Ant Bonds for Ant Token.
   * @param amount amount of Ant Bonds to redeem.
   */
  async redeemAntBonds(amount: string): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    return await Treasury.redeemAntBonds(decimalToBalance(amount));
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
    const { Boardroom } = this.contracts;
    // const balance1 = await Boardroom.getAntShareOf(this.myAccount);
    // if (balance1.gt(0)) {
    //   console.log(
    //     `👀 The user is using Boardroom v1. (Staked ${getDisplayBalance(balance1)} ANTS)`,
    //   );
    //   return 'v1';
    // }
    // const balance2 = await Boardroom2.balanceOf(this.myAccount);
    // if (balance2.gt(0)) {
    //   console.log(
    //     `👀 The user is using Boardroom v2. (Staked ${getDisplayBalance(balance2)} ANTS)`,
    //   );
    //   return 'v2';
    // }
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

  async allocateSeigniorage(): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    return await Treasury.allocateSeigniorage();
  }

  // Liquidity
  async getANTBUSDLiquidity(alreadyStakedAmount: BigNumber): Promise<Array<BigNumber>>
  {
    const { chainId } = this.config;
    const { BUSD } = this.config.externalTokens;

    const ant = new Token(chainId, this.ANT.address, this.ANT.decimal);
    const busd = new Token(chainId, BUSD.address, BUSD.decimals);

    const ANTBUSDPair = await Fetcher.fetchPairData(ant , busd, this.provider, this.ChainId == ChainId.MAINNET);
    
    let ANTBUSDLiquidity =  await this.ANTBUSD.balanceOf(this.myAccount);
    ANTBUSDLiquidity = ANTBUSDLiquidity.add(alreadyStakedAmount);

    const ANTBUSDTotalSupply = await this.ANTBUSD.totalSupply();
    
    const liquidityAmount = new TokenAmount(ANTBUSDPair.liquidityToken, ANTBUSDLiquidity);
    const totalSupplyAmount = new TokenAmount(ANTBUSDPair.liquidityToken, ANTBUSDTotalSupply);

    const token0Amount = ANTBUSDPair.getLiquidityValue(ANTBUSDPair.token0, totalSupplyAmount, liquidityAmount, false);
    const token1Amount = ANTBUSDPair.getLiquidityValue(ANTBUSDPair.token1, totalSupplyAmount, liquidityAmount, false);

    const token0AmountBN = BigNumber.from(token0Amount.raw.toString());
    const token1AmountBN = BigNumber.from(token1Amount.raw.toString());

    return [token0AmountBN, token1AmountBN];
  }

  // Faucet
  async getFreeTokens() : Promise<TransactionResponse> 
  {
    const {TokenFaucet} = this.contracts;
    return await TokenFaucet.refill();
  }
}
