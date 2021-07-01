import { useCallback } from 'react';
import { parseUnits } from 'ethers/lib/utils';

import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRemoveLiquidity = (bank: Bank) => {
  const antToken = useAntToken();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  
  const handleRemoveLiquidity = useCallback(
    async (amount: string) => {
        const liquidityHelper = antToken.contracts[bank.providerHelperName];
        const liquidityAmount = parseUnits(amount, bank.depositToken.decimal);
        const amountBN = parseUnits(amount, bank.depositToken.decimal);
        const [amount0Min, amount1Min] = await antToken.getUserLiquidity(bank, amountBN);

        handleTransactionReceipt(
            liquidityHelper.withdraw(liquidityAmount, amount0Min, amount1Min,  deadline()),
            `Removing ${amount} ${bank.depositToken.symbol} from liquidity pool`,
        );
    },
    [bank, antToken, handleTransactionReceipt],
  );
  return { onRemoveLiquidity: handleRemoveLiquidity };
};

function deadline()
{
    // 30 minutes
    return Math.floor(new Date().getTime() / 1000) + 1800;
}

export default useRemoveLiquidity;
