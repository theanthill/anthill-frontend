import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';

import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import config from '../config';

const useUserStakedLiquidityAmounts = (bank: Bank) => {
  const [balances, setBalance] = useState([BigNumber.from(0), BigNumber.from(0)]);
  const antToken = useAntToken();
  const antTokenUnlocked = antToken?.isUnlocked;

  const fetchBalances = useCallback(async () => {
    setBalance(await antToken.getUserLiquidityAmounts(bank));
  }, [antToken, bank]);

  useEffect(() => {
    if (antTokenUnlocked) {
      fetchBalances().catch((err) =>
        console.error(`Failed to fetch tokens liquidity: ${err.stack}`),
      );
      let refreshInterval = setInterval(fetchBalances, config.refreshInterval);
      return () => clearInterval(refreshInterval);
    }
  }, [antTokenUnlocked, fetchBalances]);

  return balances;
};

export default useUserStakedLiquidityAmounts;
