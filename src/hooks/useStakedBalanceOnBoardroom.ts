import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useAntToken from './useAntToken';
import config from '../config';

const useStakedBalanceOnBoardroom = () => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const antToken = useAntToken();
  const antTokenUnlocked = antToken?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    setBalance(await antToken.getStakedAntSharesOnBoardroom());
  }, [antToken]);

  useEffect(() => {
    if (antTokenUnlocked) {
      fetchBalance().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [antTokenUnlocked, fetchBalance]);

  return balance;
};

export default useStakedBalanceOnBoardroom;
