import { useCallback } from 'react';
import { parseUnits } from 'ethers/lib/utils';

import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useAddLiquidity = (bank: Bank) => {
  const antToken = useAntToken();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleAddLiquidity = useCallback(
    (amount: string) => {
        // [workerant] TODO: Rework this to make it token agnostic
        const BUSD = antToken.externalTokens['BUSD'];
        const liquidityHelper = antToken.contracts['LiquidityProviderHelper'];

        const antAmount = parseUnits(amount, antToken.ANT.decimal);
        const busdAmount = parseUnits(amount, BUSD.decimal);

        handleTransactionReceipt(
            liquidityHelper.stake(antAmount, busdAmount, antAmount, busdAmount, deadline()),
            `Adding ${amount}/${amount} ANT/BUSD to liquidity pool`,
        );
    },
    [bank, antToken],
  );
  return { onAddLiquidity: handleAddLiquidity };
};

function deadline()
{
    // 30 minutes
    return Math.floor(new Date().getTime() / 1000) + 1800;
}

export default useAddLiquidity;
