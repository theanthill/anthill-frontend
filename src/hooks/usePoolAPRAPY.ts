import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import config from '../config';
import { balanceToDecimal } from '../anthill/ether-utils';

const usePoolAPRAPY = (bank: Bank) => {
  const [APRAPY, setAPRAPY] = useState([0, 0]);
  const antToken = useAntToken();
  const antTokenUnlocked = antToken?.isUnlocked;

  const fetchRewardRate = useCallback(async () => {
    /*
    const rewardRatePerSecondBN = await antToken.getBankRewardRate(bank);
    const [token0Amount, token1Amount] = await antToken.getUserLiquidityAmounts(bank);

    let totalSupply = bank.token0Name === 'ANT' ? token0Amount : token1Amount;

    if (totalSupply.isZero()) {
      totalSupply = BigNumber.from(10).pow(18);
    }

    const rewardRatePerSecond = balanceToDecimal(rewardRatePerSecondBN);
    const SecondsInYear = 60 * 60 * 24 * 365;
    const rewardsPerYear = rewardRatePerSecond * SecondsInYear;

    const tokenBalanceLP = await bank.token0.balanceOf(bank.depositToken.address);
    const quoteTokenBalanceLP = await bank.token1.balanceOf(bank.depositToken.address);
    const lpTokenBalancePool = await bank.depositToken.balanceOf(bank.address);
    const lpTotalSupply = await bank.depositToken.totalSupply();

    const tokenDecimals = bank.token0.decimal;
    const quoteTokenDecimals = bank.token1.decimal;

    const lpTokenRatio = lpTokenBalancePool.div(lpTotalSupply);

    const tokenAmountTotal = tokenBalanceLP.div(BigNumber.from(10).pow(tokenDecimals));
    const quoteTokenAmountTotal = quoteTokenBalanceLP.div(
      BigNumber.from(10).pow(quoteTokenDecimals),
    );

    //const tokenAmountPool = tokenAmountTotal.times(lpTokenRatio)
    const quoteTokenAmountPool = quoteTokenAmountTotal.mul(lpTokenRatio);

    const lpTotalInQuoteToken = quoteTokenAmountPool.mul(2);

    const tokenPriceVsQuote = quoteTokenAmountTotal.div(tokenAmountTotal);
    const quoteTokenPriceE18 = await antToken.getTokenPriceInUSDC(bank.token1Name);
    const quoteTokenPrice = quoteTokenPriceE18.div(BigNumber.from(10).pow(18));

    const tokenPriceUsd = quoteTokenPrice.mul(tokenPriceVsQuote);

    const poolLiquidityUSD = lpTotalInQuoteToken.mul(quoteTokenPrice);

    const APR_BN = BigNumber.from(rewardsPerYear)
      .mul(tokenPriceUsd)
      .mul(100)
      .div(poolLiquidityUSD);

    const APR = APR_BN.toNumber();
    const APY = (1 + APR / 365) ** 365 - 1;
*/
    setAPRAPY([0, 0]);
  }, []);

  useEffect(() => {
    if (antToken?.isUnlocked) {
      fetchRewardRate().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchRewardRate, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [antTokenUnlocked, bank, antToken, fetchRewardRate]);

  return APRAPY;
};

export default usePoolAPRAPY;
