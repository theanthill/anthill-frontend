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
        const token1 = antToken.tokens[bank.token1Name];
        const liquidityHelper = antToken.contracts[bank.providerHelperName];

        const antAmount = parseUnits(amount, antToken.tokens.ANT.decimal);
        const token1Amount = parseUnits(amount, token1.decimal);

        handleTransactionReceipt(
            liquidityHelper.stake(antAmount, token1Amount, antAmount, token1Amount, deadline()),
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
