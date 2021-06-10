import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import config from '../config';

const useLiquidityPoolTVL = (bank: Bank) => {
  const [TVL, setTVL] = useState(BigNumber.from(0));
  const antToken = useAntToken();

  const fetchRewardRate = useCallback(async () => {
    const [token0TotalLiquidity, token1TotalLiquidity] = await antToken.getTotalLiquidity(bank);

    const token0Price = await antToken.getTokenPriceInBUSD(bank.token0.symbol);
    const token1Price = await antToken.getTokenPriceInBUSD(bank.token1.symbol);
    
    let TVL = token0TotalLiquidity.mul(token0Price);
    TVL = TVL.add(token1TotalLiquidity.mul(token1Price));

    setTVL(TVL);
  }, [antToken?.isUnlocked, bank]);

  useEffect(() => {
    if (antToken?.isUnlocked) {
      fetchRewardRate().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchRewardRate, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [antToken?.isUnlocked, bank, antToken]);

  return TVL;
};

export default useLiquidityPoolTVL;
