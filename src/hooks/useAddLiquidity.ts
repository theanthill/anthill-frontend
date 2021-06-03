import { useCallback } from 'react';
import { parseUnits } from 'ethers/lib/utils';

import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parse } from '@fortawesome/fontawesome-svg-core';

const useAddLiquidity = (bank: Bank) => {
  const antToken = useAntToken();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleAddLiquidity = useCallback(
    (amountToken0: number, amountToken1: number) => {
        const token0 = antToken.tokens[bank.token0Name];
        const token1 = antToken.tokens[bank.token1Name];
        
        const liquidityHelper = antToken.contracts[bank.providerHelperName];

        const token0Amount = parseUnits(amountToken0.toString(), token0.decimal);
        const token1Amount = parseUnits(amountToken1.toString(), token1.decimal);

        handleTransactionReceipt(
            liquidityHelper.stake(token0Amount, token1Amount, 0, 0, deadline()),
            `Adding ${amountToken0}/${amountToken1} ${bank.token0Name}/${bank.token1Name} to liquidity pool`,
        );
    },
    [bank, antToken],
  );

 /* const handleAddLiquidity = useCallback(
    async (amount0: number, amount1: number, token0In: boolean) => {
        const token0 = antToken.tokens[bank.token0Name];
        const token1 = antToken.tokens[bank.token1Name];
        
        const liquidityHelper = antToken.contracts[bank.providerHelperName];

        const [reserve0, reserve1 ] = await antToken.getPairReserves(bank);

        if (token0In)
        {
          const token0Amount = parseUnits(amount0.toString(), token0.decimal);
          const token1Amount = token0Amount.mul(reserve1).div(reserve0);

          handleTransactionReceipt(
            liquidityHelper.stake(token0Amount, token1Amount, 0, 0, deadline()),
            `Adding ${amount0}/${amount1} ${bank.token0Name}/${bank.token1Name} to liquidity pool`,
          );
        }
        else
        {
          const token1Amount = parseUnits(amount1.toString(), token1.decimal);
          const token0Amount = token1Amount.mul(reserve0).div(reserve1);

          handleTransactionReceipt(
            liquidityHelper.stake(token0Amount, token1Amount, 0, 0, deadline()),
            `Adding ${amount0}/${amount1} ${bank.token0Name}/${bank.token1Name} to liquidity pool`,
          );
        }

        
    },
    [bank, antToken],
  );*/
  return { onAddLiquidity: handleAddLiquidity };
};

function deadline()
{
    // 30 minutes
    return Math.floor(new Date().getTime() / 1000) + 1800;
}

export default useAddLiquidity;
