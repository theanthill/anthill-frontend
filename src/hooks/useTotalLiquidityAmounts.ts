import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';

import useAntToken from './useAntToken';
import { BankInfo } from '../anthill';
import config from '../config';

const useTotalLiquidityAmounts = (bank: BankInfo) => {
  const [balances, setBalance] = useState([BigNumber.from(0), BigNumber.from(0)]);
  const antToken = useAntToken();

  const fetchBalances = useCallback(async () => {
    const stakedBalance = await antToken.stakedBalanceOnBank(bank.contract, antToken.myAccount);

    setBalance(await antToken.getTotalLiquidity(bank, stakedBalance));
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

export default useTotalLiquidityAmounts;
