import React, { useCallback, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useWallet } from '@binance-chain/bsc-use-wallet';

import Button from '../../components/Button';
import Page from '../../components/Page';
import PageHeader from '../../components/PageHeader';
import ExchangeCard from './components/ExchangeCard';
import styled from 'styled-components';
import Spacer from '../../components/Spacer';
import useAntBondStats from '../../hooks/useAntBondStats';
import useAntToken from '../../hooks/useAntToken';
import useAntBondOraclePriceInLastTWAP from '../../hooks/useAntBondOraclePriceInLastTWAP';
import useRealAntTokenPrice from '../../hooks/useRealAntTokenPrice';
import { useTransactionAdder } from '../../state/transactions/hooks';
import config from '../../config';
import ExchangeStat from './components/ExchangeStat';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';

const AntBond: React.FC = () => {
  const { path } = useRouteMatch();
  const { account, connect } = useWallet();
  const antToken = useAntToken();
  const addTransaction = useTransactionAdder();
  const antBondStat = useAntBondStats();
  const antTokenPrice = useAntBondOraclePriceInLastTWAP();
  const realAntTokenPrice = useRealAntTokenPrice();

  const antBondBalance = useTokenBalance(antToken?.ANTB);

  const handleBuyAntBonds = useCallback(
    async (amount: string) => {
      var antTokenPriceFloat = Number(antTokenPrice) / 10**18
      const tx = await antToken.buyAntBonds(amount, antTokenPrice.toString());
      const antBondAmount = Number(amount) / Number(antTokenPriceFloat);
      addTransaction(tx, {
        summary: `Buy ${antBondAmount.toFixed(antToken.priceDecimals)} ANTB with ${amount} ANT`,
      });
    },
    [antToken, addTransaction, antTokenPrice],
  );

  const handleRedeemAntBonds = useCallback(
    async (amount: string) => {
      const tx = await antToken.redeemAntBonds(amount);
      addTransaction(tx, { summary: `Redeem ${amount} ANTB` });
    },
    [antToken, addTransaction],
  );
  const antTokenIsOverpriced = useMemo(() => antTokenPrice.gt(realAntTokenPrice), [antTokenPrice]);
  const antTokenIsUnderPriced = useMemo(() => antTokenPrice.lt(realAntTokenPrice), [antBondStat]);

  const isLaunched = Date.now() >= config.antBondLaunchesAt.getTime();

  return (
    <Switch>
      <Page>
        {!!account ? (
          <>
            <Route exact path={path}>
              <PageHeader
                title="Buy & Redeem AntBonds"
                subtitle="Earn premiums upon redemption"
              />
            </Route>
            <StyledAntBond>
              <StyledCardWrapper>
                <ExchangeCard
                  action="Purchase"
                  fromToken={antToken.ANT}
                  fromTokenName="Ant Token"
                  toToken={antToken.ANTB}
                  toTokenName="Ant Bond"
                  // priceDesc={
                  //   antTokenIsOverpriced
                  //     ? 'ANT is over AntToken Price'
                  //     : antTokenIsUnderPriced
                  //     ? `${Math.floor(
                  //         100 / Number(antTokenPrice) - 100,
                  //       )}% return when ANT > AntToken Price`
                  //     : '-'
                  // }
                  priceDesc='Buy Ant Bonds'
                  onExchange={handleBuyAntBonds}
                  disabled={ parseFloat(antBondStat?.priceInBUSD) < 1 }
                />
              </StyledCardWrapper>
              <StyledStatsWrapper>
                <ExchangeStat
                  tokenName="ANT / XAU"
                  description="ANT / XAU (Last-Day TWAP)"
                  price={String((Number(antTokenPrice) / Number(realAntTokenPrice)).toFixed(antToken.priceDecimals))}
                />
                <Spacer size="md" />
                <ExchangeStat
                  tokenName="ANT"
                  description="ANTB = 1 / (ANT/XAU)"
                  price={ parseFloat(antBondStat?.priceInBUSD) > 1 ? antBondStat?.priceInBUSD + ' ANTB' : '-' }
                />
              </StyledStatsWrapper>
              <StyledCardWrapper>
                <ExchangeCard
                  action="Redeem"
                  fromToken={antToken.ANTB}
                  fromTokenName="Ant Bond"
                  toToken={antToken.ANT}
                  toTokenName="Ant Token"
                  priceDesc={`${getDisplayBalance(antBondBalance)} ANTB Available`}
                  onExchange={handleRedeemAntBonds}
                  disabled={!antBondStat || antBondBalance.eq(0) || antTokenIsUnderPriced}
                />
              </StyledCardWrapper>
            </StyledAntBond>
          </>
        ) : (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <Button onClick={() => connect('injected')} text="Unlock Wallet" />
          </div>
        )}
      </Page>
    </Switch>
  );
};

const StyledAntBond = styled.div`
  display: flex;
  width: 900px;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 80%;
  }
`;

const StyledStatsWrapper = styled.div`
  display: flex;
  flex: 0.8;
  margin: 0 20px;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 80%;
    margin: 16px 0;
  }
`;

export default AntBond;
