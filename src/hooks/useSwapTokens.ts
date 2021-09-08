import { useCallback } from 'react';

import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { BigNumber } from '@ethersproject/bignumber';
import { getDisplayBalance } from '../utils/formatBalance';

const useSwapTokens = (bank: Bank) => {
  const antToken = useAntToken();

  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleSwapTokens = useCallback(
    (token0In: boolean, amountIn: BigNumber, amountOutMin: BigNumber) => {
      const amountInDisplay = getDisplayBalance(amountIn);
      const amountOutMinDisplay = getDisplayBalance(amountOutMin);

      handleTransactionReceipt(
        antToken.swapExactInput(bank, token0In, amountIn, amountOutMin),
        `Swapping ${amountInDisplay} ${bank.token0Name} for at least ${amountOutMinDisplay} ${bank.token1Name} tokens `,
      );
    },
    [bank, antToken, handleTransactionReceipt],
  );
  return { onSwapTokens: handleSwapTokens };
};

export default useSwapTokens;
