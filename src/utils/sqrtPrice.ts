import { BigNumber } from "@ethersproject/bignumber";

export function decodeSqrtX96(sqrtPriceX96: BigNumber) : BigNumber {

    const priceSquare = sqrtPriceX96.mul(sqrtPriceX96);
    const shiftAmount = BigNumber.from(2).pow(192);

    return priceSquare.div(shiftAmount);
}