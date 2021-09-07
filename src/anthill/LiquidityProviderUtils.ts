import { Configuration } from "./config";
import { LiquidityProviderUniswap } from "./LiquidityProviderUniswap";
import {ILiquidityProvider} from './ILiquidityProvider'

export function CreateLiquidityProvider(cfg: Configuration): ILiquidityProvider
{
  return new LiquidityProviderUniswap(cfg);
}