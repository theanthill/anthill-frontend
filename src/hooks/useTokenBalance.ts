import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import ERC20 from '../anthill/ERC20';
import useAntToken from './useAntToken';
import config from '../config';

const useTokenBalance = (token: ERC20) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const antToken = useAntToken();
  const antTokenUnlocked = antToken?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    setBalance(await token.balanceOf(antToken.myAccount));
  }, [antToken, token]);

  useEffect(() => {
    if (antTokenUnlocked) {
      fetchBalance().catch((err) =>
        console.error(`Failed to fetch token balance: ${err.stack}`),
      );
      let refreshInterval = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshInterval);
    }
  }, [antTokenUnlocked, token, fetchBalance]);

  return balance;
};

export default useTokenBalance;
