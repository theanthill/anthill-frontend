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
import ExchangeStat from './components/ExchangeStat';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';
import useHandleTransactionReceipt from '../../hooks/useHandleTransactionReceipt';

const AntBond: React.FC = () => {
  const { path } = useRouteMatch();
  const { account, connect } = useWallet();
  const antToken = useAntToken();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const antBondStat = useAntBondStats();
  const antTokenPrice = useAntBondOraclePriceInLastTWAP();
  const antTokenPriceFloat = Number(antTokenPrice) / 10**18;
  const realAntTokenPrice = useRealAntTokenPrice();
  const realAntTokenPriceFloat = Number(realAntTokenPrice) / 10**18;

  const antBondBalance = useTokenBalance(antToken?.tokens.ANTB);

  const handleBuyAntBonds = useCallback(
    async (amount: string) => {
      const antBondAmount = Number(amount) / Number(antTokenPriceFloat);
      handleTransactionReceipt(
        antToken.buyAntBonds(amount, antTokenPrice.toString()),
        `Buy ${antBondAmount.toFixed(antToken.priceDecimals)} ANTB with ${amount} ANT`
      );
    },
    [antToken, handleTransactionReceipt, antTokenPrice, antTokenPriceFloat],
  );

  const handleRedeemAntBonds = useCallback(
    async (amount: string) => {
      handleTransactionReceipt(
        antToken.redeemAntBonds(amount, antTokenPrice.toString()),
        `Redeeming ${amount} Ant Bonds`
      );  
    },
    [antToken, antTokenPrice, handleTransactionReceipt],
  );

  const antTokenIsOverPriced = useMemo(() => antTokenPrice.gt(realAntTokenPrice), [antTokenPrice, realAntTokenPrice]);
  const antTokenIsUnderPriced = useMemo(() => antTokenPrice.lt(realAntTokenPrice), [antTokenPrice, realAntTokenPrice]);
  const antTokenIsUnderPriceCeiling = useMemo(() => antTokenPrice.lt(realAntTokenPrice.mul(105).div(100)), [antTokenPrice, realAntTokenPrice]);

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
                  fromToken={antToken.tokens.ANT}
                  fromTokenName="Ant Token"
                  toToken={antToken.tokens.ANTB}
                  toTokenName="Ant Bond"
                   priceDesc={
                      antTokenIsOverPriced
                       ? 'Ant Token price is over target price'
                       : antTokenIsUnderPriced
                       ? `Ant Token price is below target price`
                       : 'Ant Token price is exactly target price'
                  }
                  onExchange={handleBuyAntBonds}
                  disabled={ parseFloat(antBondStat?.priceInBUSD) <= 1 }
                />
              </StyledCardWrapper>
              <StyledStatsWrapper>
                <ExchangeStat
                  tokenName="ANT / BUSD"
                  description="ANT / BUSD (Last-Day TWAP)"
                  price={(antTokenPriceFloat/realAntTokenPriceFloat).toFixed(2)}
                />
                <Spacer size="md" />
                <ExchangeStat
                  tokenName="ANT"
                  description="ANTB = 1 / (ANT/BUSD)"
                  price={ parseFloat(antBondStat?.priceInBUSD) > 1 ? antBondStat?.priceInBUSD + ' ANTB' : '-' }
                />
              </StyledStatsWrapper>
              <StyledCardWrapper>
                <ExchangeCard
                  action="Redeem"
                  fromToken={antToken.tokens.ANTB}
                  fromTokenName="Ant Bond"
                  toToken={antToken.tokens.ANT}
                  toTokenName="Ant Token"
                  reverseDirection={true}
                  priceDesc={`${getDisplayBalance(antBondBalance)} ANTB Available`}
                  onExchange={handleRedeemAntBonds}
                  disabled={!antBondStat || getDisplayBalance(antBondBalance) === '0.00' || antTokenIsUnderPriceCeiling}
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
