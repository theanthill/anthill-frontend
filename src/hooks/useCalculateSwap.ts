import { useCallback, useState, useEffect } from 'react';

import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import { BigNumber } from 'ethers';

const useCalculateSwap = (bank: Bank, token0In: boolean, amountIn: BigNumber) => {
  const antToken = useAntToken();
  const [amountOut, setAmountOut] = useState<BigNumber>(null);

  const fetchSwapAmount = useCallback(async () => {

      var path;
      
      if (token0In) {
        path = [ bank.token0.address, bank.token1.address ];
      } else  {
        path = [ bank.token1.address, bank.token0.address ];
      }
      const amounts = await antToken.contracts.PancakeRouter.getAmountsOut(amountIn, path);

      setAmountOut(amounts[1]);
    }, [bank, token0In, amountIn, antToken],
  );

  useEffect(() => {
    if (antToken && bank && amountIn) {
      fetchSwapAmount().catch((err) => console.log(`Failed to calculate swap amount out: ${err.stack}`));
    }
    else{
      setAmountOut(null);
    }
  }, [bank, amountIn, token0In, antToken]);

  return amountOut;
};

export default useCalculateSwap;