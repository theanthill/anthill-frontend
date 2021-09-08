import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'bignumber.js';
import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import config from '../config';
import { balanceToDecimal } from '../anthill/ether-utils';

const usePoolAPRAPY = (bank: Bank) => {
  const [APRAPY, setAPRAPY] = useState([0, 0]);
  const antToken = useAntToken();
  const antTokenUnlocked = antToken?.isUnlocked;

  const fetchRewardRate = useCallback(async () => {
    /*const rewardRatePerSecondBN = await antToken.getBankRewardRate(bank);
    const totalSupplyBN = await antToken.getBankTotalSupply(bank);
    let totalSupply = new BigNumber(totalSupplyBN.toString());
    const unit = new BigNumber(10).pow(18);

    if (totalSupply.isZero()) {
      totalSupply = unit;
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

    const lpTokenRatio = new BigNumber(lpTokenBalancePool.toString()).div(
      new BigNumber(lpTotalSupply.toString()),
    );

    const tokenAmountTotal = new BigNumber(tokenBalanceLP.toString()).div(
      new BigNumber(10).pow(tokenDecimals),
    );
    const quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP.toString()).div(
      new BigNumber(10).pow(quoteTokenDecimals),
    );

    //const tokenAmountPool = tokenAmountTotal.times(lpTokenRatio)
    const quoteTokenAmountPool = quoteTokenAmountTotal.times(lpTokenRatio);

    const lpTotalInQuoteToken = quoteTokenAmountPool.times(2);

    const tokenPriceVsQuote = quoteTokenAmountTotal.div(tokenAmountTotal);
    const quoteTokenPriceE18 = await antToken.getTokenPriceInBUSD(bank.token1Name);
    const quoteTokenPrice = new BigNumber(quoteTokenPriceE18.toString()).div(
      new BigNumber(10).pow(18),
    );

    const tokenPriceUsd = new BigNumber(quoteTokenPrice).times(tokenPriceVsQuote);

    const poolLiquidityUSD = lpTotalInQuoteToken.times(
      new BigNumber(quoteTokenPrice.toString()),
    );

    const APR_BN = new BigNumber(rewardsPerYear)
      .times(tokenPriceUsd)
      .times(100)
      .div(poolLiquidityUSD);

    const APR = APR_BN.toNumber();
    const APY = (1 + APR / 365) ** 365 - 1;
    */
    setAPRAPY([0, 0]);
  }, [antToken, bank]);

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
