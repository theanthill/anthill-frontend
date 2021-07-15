import { Configuration } from "./config";
import { LiquidityProviderPancakeSwap } from "./LiquidityProviderPancakeSwap";
import { LiquidityProviderUniswap } from "./LiquidityProviderUniswap";
import {ILiquidityProvider} from './ILiquidityProvider'

export function CreateLiquidityProvider(cfg: Configuration): ILiquidityProvider
{
    switch (cfg.chainId)
    {
      case 56:
      case 97:
        return new LiquidityProviderPancakeSwap(cfg);
      case 3:
        return new LiquidityProviderUniswap(cfg);
      default:
        return new LiquidityProviderPancakeSwap(cfg);
    }
}