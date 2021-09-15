import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import config from '../config';

const useBankTVL = (bank: Bank) => {
  const [TVL, setTVL] = useState(BigNumber.from(0));
  const antToken = useAntToken();
  const antTokenUnlocked = antToken?.isUnlocked;

  const fetchRewardRate = useCallback(async () => {
    const [token0TotalLiquidity, token1TotalLiquidity] = await antToken.getBankTotalLiquidity(
      bank,
    );

    const token0Price = await antToken.getTokenPriceInUSDC(bank.token0.symbol);
    const token1Price = await antToken.getTokenPriceInUSDC(bank.token1.symbol);
    const decimalsDivisor = BigNumber.from(10).pow(18);

    let TVL = token0TotalLiquidity.mul(token0Price).div(decimalsDivisor);
    TVL = TVL.add(token1TotalLiquidity.mul(token1Price).div(decimalsDivisor));

    setTVL(TVL);
  }, [antToken, bank]);

  useEffect(() => {
    if (antTokenUnlocked) {
      fetchRewardRate().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchRewardRate, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [antTokenUnlocked, bank, fetchRewardRate]);

  return TVL;
};

export default useBankTVL;
