import { TransactionResponse } from '@ethersproject/providers';
import { BigNumber, ethers } from 'ethers';
import ERC20 from './ERC20';

export interface ILiquidityProvider {
  unlockWallet(signer: ethers.Signer): void;
  getTotalLiquidity(erc20Token0: ERC20, erc20Token1: ERC20): Promise<Array<BigNumber>>;
  getUserLiquidity(
    erc20Token0: ERC20,
    erc20Token1: ERC20,
    positions: number[],
  ): Promise<[BigNumber, BigNumber]>;
  getPoolLiquidity(erc20Token0: ERC20, erc20Token1: ERC20): Promise<BigNumber>;
  getPoolSqrtPriceX96(erc20Token0: ERC20, erc20Token1: ERC20): Promise<BigNumber>;
  getPoolCurrentTick(erc20Token0: ERC20, erc20Token1: ERC20): Promise<number>;
  getPairPriceLatest(
    erc20Token0: ERC20,
    erc20Token1: ERC20,
    decimals: number,
  ): Promise<[number, number]>;
  getPairPriceTWAP(
    erc20Token0: ERC20,
    erc20Token1: ERC20,
    decimals: number,
  ): Promise<[number, number]>;
  quoteExactInput(tokenIn: ERC20, tokenOut: ERC20, amount: BigNumber): Promise<BigNumber>;
  swapExactInput(
    tokenIn: ERC20,
    tokenOut: ERC20,
    amountIn: BigNumber,
    amountOutMin: BigNumber,
    recipient: string,
  ): Promise<TransactionResponse>;
}
