import { useCallback, useEffect, useState } from 'react';

import { BigNumber } from 'ethers';
import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import config from '../config';

const useUserTotalLiquidity = (bank: Bank) => {
  const [totalLiquidity, setTotalLiquidity] = useState(BigNumber.from(0));
  const antToken = useAntToken();
  const antTokenUnlocked = antToken?.isUnlocked;

  const fetchTotalLiquidity = useCallback(async () => {
    const balance = await antToken.getUserTotalLiquidity(bank);
    setTotalLiquidity(balance);
  }, [antToken, bank]);

  useEffect(() => {
    if (antTokenUnlocked) {
      fetchTotalLiquidity().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchTotalLiquidity, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [antTokenUnlocked, fetchTotalLiquidity]);

  return totalLiquidity;
};

export default useUserTotalLiquidity;
