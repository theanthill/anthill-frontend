import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';

import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import config from '../config';

const useUserCustomLiquidityAmounts = (bank: Bank, amount: BigNumber) => {
  const [balances, setBalance] = useState([BigNumber.from(0), BigNumber.from(0)]);
  const antToken = useAntToken();
  const antTokenUnlocked = antToken?.isUnlocked;

  const fetchBalances = useCallback(async () => {
    const amount = await antToken.getUserTotalLiquidity(bank);
    setBalance([amount, amount]);
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

export default useUserCustomLiquidityAmounts;
