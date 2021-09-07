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
  getPairPriceLatest(erc20Token0: ERC20, erc20Token1: ERC20): Promise<[number, number]>;
  getPairPriceTWAP(erc20Token0: ERC20, erc20Token1: ERC20): Promise<[number, number]>;
}
