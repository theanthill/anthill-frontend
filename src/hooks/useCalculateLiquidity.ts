import { useCallback, useState, useEffect } from 'react';

import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import { BigNumber } from 'ethers';

const useCalculateLiquidity = (bank: Bank, token0In: boolean, amountIn: number) => {
  const antToken = useAntToken();
  const [amountOut, setAmountOut] = useState<number>(null);

  const fetchLiquidityAmount = useCallback(async () => {
      const pairPrice = await antToken.getPairPrice(bank, token0In);

      const price = Number(pairPrice.toSignificant(bank.token0.decimal));
      console.log("PRICE!!" + price);

      setAmountOut(amountIn * price)
      
    }, [bank, token0In, amountIn, antToken],
  );

  useEffect(() => {
    if (antToken && bank && amountIn) {
      fetchLiquidityAmount().catch((err) => console.log(`Failed to calculate liquidity amount out: ${err.stack}`));
    }
  }, [bank, amountIn, token0In, antToken]);

  return amountOut;
};

export default useCalculateLiquidity;