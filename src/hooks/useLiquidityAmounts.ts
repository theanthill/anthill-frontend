import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';

import useAntToken from './useAntToken';
import { BankInfo } from '../anthill';
import config from '../config';

const useUserLiquidityAmounts = (bank: BankInfo) => {
  const [balances, setBalance] = useState([BigNumber.from(0), BigNumber.from(0)]);
  const antToken = useAntToken();

  const fetchBalances = useCallback(async () => {
    setBalance(await antToken.getUserLiquidity(bank));
  }, [antToken?.isUnlocked]);

  useEffect(() => {
    if (antToken?.isUnlocked) {
      fetchBalances().catch((err) =>
        console.error(`Failed to fetch tokens liquidity: ${err.stack}`),
      );
      let refreshInterval = setInterval(fetchBalances, config.refreshInterval);
      return () => clearInterval(refreshInterval);
    }
  }, [antToken?.isUnlocked]);

  return balances;
};

export default useUserLiquidityAmounts;
