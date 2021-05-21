import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useAntToken from './useAntToken';
import config from '../config';

const useEarningsOnBoardroom = () => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const antToken = useAntToken();

  const fetchBalance = useCallback(async () => {
    setBalance(await antToken.getEarningsOnBoardroom());
  }, [antToken?.isUnlocked]);

  useEffect(() => {
    if (antToken?.isUnlocked) {
      fetchBalance().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [antToken?.isUnlocked, setBalance]);

  return balance;
};

export default useEarningsOnBoardroom;
