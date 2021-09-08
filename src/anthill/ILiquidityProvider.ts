import { BigNumber, ethers } from 'ethers';
import ERC20 from './ERC20';

export interface ILiquidityProvider {
  unlockWallet(signer: ethers.Signer): void;
  getLiquidity(
    erc20Token0: ERC20,
    erc20Token1: ERC20,
    pairLiquidity: BigNumber,
    totalSupply: BigNumber,
  ): Promise<Array<BigNumber>>;
  getTotalLiquidity(erc20Token0: ERC20, erc20Token1: ERC20): Promise<Array<BigNumber>>;
  getPoolLiquidity(erc20Token0: ERC20, erc20Token1: ERC20): Promise<BigNumber>;
  getPoolSqrtPriceX96(erc20Token0: ERC20, erc20Token1: ERC20): Promise<BigNumber>;
  getPoolCurrentTick(erc20Token0: ERC20, erc20Token1: ERC20): Promise<number>;
  getPairPriceLatest(erc20Token0: ERC20, erc20Token1: ERC20): Promise<[number, number]>;
  getPairPriceTWAP(erc20Token0: ERC20, erc20Token1: ERC20): Promise<[number, number]>;
  quoteExactInput(tokenIn: ERC20, tokenOut: ERC20, amount: BigNumber): Promise<BigNumber>;
}
