import { useCallback } from 'react';
import { parseUnits } from 'ethers/lib/utils';

import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { getDisplayBalance } from '../utils/formatBalance';

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
            `Adding ${getDisplayBalance(token0Amount)} ${bank.token0Name} + ${getDisplayBalance(token1Amount)} ${bank.token1Name} to liquidity pool`,
        );
    },
    [bank, antToken, handleTransactionReceipt],
  );
  return { onAddLiquidity: handleAddLiquidity };
};

function deadline()
{
    // 30 minutes
    return Math.floor(new Date().getTime() / 1000) + 1800;
}

export default useAddLiquidity;
