import { BigNumber, Contract, ethers } from 'ethers';
import { TokenAmount, ChainId } from '@uniswap/sdk';
import { Fetcher, Route, Token } from '@uniswap/sdk';

import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as IUniswapV2Pair } from '@uniswap/v2-periphery/build/IUniswapV2Pair.json';

import ERC20 from './ERC20';
import { getDefaultProvider } from '../utils/provider';
import { Configuration } from './config';

import {ILiquidityProvider} from './ILiquidityProvider'

/**
 * An API module of The Anthill contracts.
 * All contract-interacting domain logic should be defined in here.
 */
export class LiquidityProviderUniswap implements ILiquidityProvider {
  provider: ethers.providers.Web3Provider;
  chainId: ChainId;
  routerContract: Contract;

  constructor(cfg: Configuration) {  
    this.chainId = cfg.chainId;
    this.provider = getDefaultProvider();

    this.routerContract = new Contract(cfg.externalTokens['PancakeRouter'].address, IUniswapV2Router02ABI, this.provider);
  }

  getPairABI(): any
  {
    return IUniswapV2Pair;
  }

  getRouterContract(): Contract
  {
    return this.routerContract;
  }
  
  async getLiquidity(erc20Token0: ERC20, erc20Token1: ERC20, pairLiquidity: BigNumber, totalSupply: BigNumber): Promise<Array<BigNumber>>
  {
    const token0 = new Token(this.chainId, erc20Token0.address, erc20Token0.decimal);
    const token1 = new Token(this.chainId, erc20Token1.address, erc20Token1.decimal);

    const pair = await Fetcher.fetchPairData(token0 , token1, this.provider);
      
    const liquidityAmount = new TokenAmount(pair.liquidityToken, pairLiquidity.toString());
    const totalSupplyAmount = new TokenAmount(pair.liquidityToken, totalSupply.toString());

    const token0Amount = pair.getLiquidityValue(pair.token0, totalSupplyAmount, liquidityAmount, false);
    const token1Amount = pair.getLiquidityValue(pair.token1, totalSupplyAmount, liquidityAmount, false);

    const token0AmountBN = BigNumber.from(token0Amount.raw.toString());
    const token1AmountBN = BigNumber.from(token1Amount.raw.toString());

    return token0.sortsBefore(token1) ? [token0AmountBN, token1AmountBN] : [token1AmountBN, token0AmountBN];
  }

  async getTotalLiquidity(erc20Token0: ERC20, erc20Token1: ERC20): Promise<Array<BigNumber>>
  {
    const token0 = new Token(this.chainId, erc20Token0.address, erc20Token0.decimal);
    const token1 = new Token(this.chainId, erc20Token1.address, erc20Token1.decimal);

    const pair = await Fetcher.fetchPairData(token0 , token1, this.provider);

    const token0AmountBN = BigNumber.from(pair.reserve0.raw.toString());
    const token1AmountBN = BigNumber.from(pair.reserve1.raw.toString());

    return token0.sortsBefore(token1) ? [token0AmountBN, token1AmountBN] : [token1AmountBN, token0AmountBN];
  }

  async getPairPrice(erc20Token0: ERC20, erc20Token1: ERC20): Promise<[number, number]>
  {
    const token0 = new Token(this.chainId, erc20Token0.address, erc20Token0.decimal);
    const token1 = new Token(this.chainId, erc20Token1.address, erc20Token1.decimal);

    const pair = await Fetcher.fetchPairData(token0 , token1, this.provider);
    
    const price0 = Number(pair.priceOf(token0).toSignificant(erc20Token0.decimal)).valueOf();
    const price1 = Number(pair.priceOf(token1).toSignificant(erc20Token1.decimal)).valueOf();

    return [price0, price1];
  }

   async getTokenPriceRealTime(erc20Token0: ERC20, erc20Token1: ERC20): Promise<number> 
   {
    await this.provider.ready;

    const token0 = new Token(this.chainId, erc20Token0.address, erc20Token0.decimal);
    const token1 = new Token(this.chainId, erc20Token1.address, erc20Token1.decimal);

    try {
      const tokensPair = await Fetcher.fetchPairData(token0, token1, this.provider);
      const price = new Route([tokensPair], token1);
      return Number(price.midPrice.toSignificant(3));
    } catch (err) {
      console.error(`Failed to fetch token price for pair (${erc20Token0.symbol},${erc20Token1.symbol}): ${err}`);
    }
  }

}
