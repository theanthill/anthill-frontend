import { BigNumber, Contract } from "ethers";
import ERC20 from "./ERC20";

export interface ILiquidityProvider {
  getPairABI(): any;
  getRouterContract(): Contract;
  
  getLiquidity(erc20Token0: ERC20, erc20Token1: ERC20, pairLiquidity: BigNumber, totalSupply: BigNumber): Promise<Array<BigNumber>>;
  getTotalLiquidity(erc20Token0: ERC20, erc20Token1: ERC20): Promise<Array<BigNumber>>;
  getPairPrice(erc20Token0: ERC20, erc20Token1: ERC20): Promise<[number, number]>;
  getTokenPriceRealTime(erc20Token0: ERC20, erc20Token1: ERC20): Promise<number>;
}