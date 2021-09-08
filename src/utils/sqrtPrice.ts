import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

export function decodeSqrtX96(sqrtPriceX96: BigNumber, decimals: number): number {
  const priceSquare = sqrtPriceX96.mul(sqrtPriceX96);
  const shiftAmount = BigNumber.from(2).pow(192);
  const result = priceSquare.mul(10 ** decimals).div(shiftAmount);
  return Number(formatUnits(result, decimals));
}
