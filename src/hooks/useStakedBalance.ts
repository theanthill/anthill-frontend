import { useCallback, useEffect, useState } from 'react';

import { BigNumber } from 'ethers';
import useAntToken from './useAntToken';
import { ContractName } from '../anthill';
import config from '../config';

const useStakedBalance = (poolName: ContractName) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const antToken = useAntToken();
  const antTokenUnlocked = antToken?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    const balance = await antToken.stakedBalanceOnBank(poolName, antToken.myAccount);
    setBalance(balance);
  }, [antToken, poolName]);

  useEffect(() => {
    if (antTokenUnlocked) {
      fetchBalance().catch(err => console.error(err.stack));

      const refreshBalance = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [antTokenUnlocked, fetchBalance]);

  return balance;
};

export default useStakedBalance;
