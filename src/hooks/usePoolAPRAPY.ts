import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useAntToken from './useAntToken';
import { ContractName } from '../anthill';
import config from '../config';
import { balanceToDecimal } from '../anthill/ether-utils';

const usePoolAPRAPY = (poolName: ContractName) => {
  const [APRAPY, setAPRAPY] = useState([0, 0]);
  const antToken = useAntToken();
  const antTokenUnlocked = antToken?.isUnlocked;

  const fetchRewardRate = useCallback(async () => {
    const rewardRatePerSecondBN = await antToken.getBankRewardRate(poolName);
    let totalSupplyBN = await antToken.getBankTotalSupply(poolName);
    const unit = BigNumber.from(10).pow(18);

    if (totalSupplyBN.isZero())
    {
      totalSupplyBN = unit;
    }
    
    const totalSupply = balanceToDecimal(totalSupplyBN);
    const rewardRatePerSecond = balanceToDecimal(rewardRatePerSecondBN)

    const SecondsInYear = 60*60*24*365;
    const rewardsPerYear = rewardRatePerSecond * SecondsInYear;
    const interestRate = rewardsPerYear/totalSupply;

    const APR = interestRate*100;
    const APY = (1 + APR/365)**365 - 1;

    setAPRAPY([APR, APY]);
  }, [antToken, poolName]);

  useEffect(() => {
    if (antToken?.isUnlocked) {
      fetchRewardRate().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchRewardRate, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [antTokenUnlocked, poolName, antToken, fetchRewardRate]);

  return APRAPY;
};

export default usePoolAPRAPY;
