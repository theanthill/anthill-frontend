import { useCallback, useState, useEffect } from 'react';

import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import { BigNumber } from 'ethers';

const useCalculateSwap = (bank: Bank, token0In: boolean, amountIn: BigNumber) => {
  const antToken = useAntToken();
  const [amountOut, setAmountOut] = useState<BigNumber>(null);

  const fetchSwapAmount = useCallback(async () => {
    const amountOut = await antToken.quoteExactInput(bank, token0In, amountIn);
    setAmountOut(amountOut);
  }, [bank, token0In, amountIn, antToken]);

  useEffect(() => {
    if (antToken && bank && amountIn) {
      fetchSwapAmount().catch((err) =>
        console.log(`Failed to calculate swap amount out: ${err.stack}`),
      );
    } else {
      setAmountOut(null);
    }
  }, [bank, amountIn, token0In, antToken, fetchSwapAmount]);

  return amountOut;
};

export default useCalculateSwap;
