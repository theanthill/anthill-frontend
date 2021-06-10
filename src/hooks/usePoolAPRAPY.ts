import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useAntToken from './useAntToken';
import { ContractName } from '../anthill';
import config from '../config';
import { getDisplayBalance } from '../utils/formatBalance';

const usePoolAPRAPY = (poolName: ContractName) => {
  const [APRAPY, setAPRAPY] = useState([0, 0]);
  const antToken = useAntToken();

  const fetchRewardRate = useCallback(async () => {
    const rewardRatePerSecond = await antToken.getBankRewardRate(poolName);
    let totalSupply = await antToken.getBankTotalSupply(poolName);

    if (totalSupply.isZero())
    {
      totalSupply = BigNumber.from(10).pow(18);
    }
    
    const secondsInYear = BigNumber.from(60*60*24*365);
    const rewardsPerYear = secondsInYear.mul(rewardRatePerSecond);
    const interestRate = rewardsPerYear.div(totalSupply);

    const APR = interestRate.mul(100).toNumber();
    const APY = (1 + APR/365)**365 - 1;

    setAPRAPY([APR, APY]);
  }, [antToken?.isUnlocked, poolName]);

  useEffect(() => {
    if (antToken?.isUnlocked) {
      fetchRewardRate().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchRewardRate, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [antToken?.isUnlocked, poolName, antToken]);

  return APRAPY;
};

export default usePoolAPRAPY;
