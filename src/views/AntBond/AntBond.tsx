import React, { useCallback, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useWallet } from '@binance-chain/bsc-use-wallet';

import Button from '../../components/Button';
import Page from '../../components/Page';
import PageHeader from '../../components/PageHeader';
import BondExchangeCard from './components/BondExchangeCard';
import styled from 'styled-components';
import Spacer from '../../components/Spacer';
import useAntBondStats from '../../hooks/useAntBondStats';
import useAntToken from '../../hooks/useAntToken';
import useAntTokenPriceRealTime from '../../hooks/useRealAntTokenPrice';
import ExchangeStat from './components/BondExchangeStat';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';
import useHandleTransactionReceipt from '../../hooks/useHandleTransactionReceipt';
import useAntBondExchangeRate from '../../hooks/useAntBondExchangeRate';
import { balanceToDecimal } from '../../anthill/ether-utils';

const AntBond: React.FC = () => {
  const { path } = useRouteMatch();
  const { account, connect } = useWallet();
  const antToken = useAntToken();
  const handleTransactionReceipt = useHandleTransactionReceipt();
  const antBondStat = useAntBondStats();

  const antBondExchangeRateBN = useAntBondExchangeRate();
  const antBondExchangeRate = balanceToDecimal(antBondExchangeRateBN);
  const antTokenPriceRealTime = useAntTokenPriceRealTime();
  
  const ANTBPriceInANTLastEpoch = parseFloat(antBondStat?.priceInUSDCLastEpoch);
  const ANTPriceInANTBLastEpoch = 1.0;

  const antBondBalance = useTokenBalance(antToken?.tokens.ANTB);

  const handleBuyAntBonds = useCallback(
    async (amount: number) => {
      const antBondAmount = amount * ANTBPriceInANTLastEpoch;
      handleTransactionReceipt(
        antToken.buyAntBonds(amount, antBondExchangeRateBN),
        `Buy ${antBondAmount.toFixed(antToken.priceDecimals)} ANTB with ${amount.toFixed(antToken.priceDecimals)} ANT`
      );
    },
    [antToken, handleTransactionReceipt, ANTBPriceInANTLastEpoch, antBondExchangeRateBN],
  );

  const handleRedeemAntBonds = useCallback(
    async (amount: number) => {
      const antTokenAmount = amount * ANTPriceInANTBLastEpoch;
      handleTransactionReceipt(
        antToken.redeemAntBonds(amount, antBondExchangeRateBN),
        `Redeem ${amount.toFixed(antToken.priceDecimals)} ANTB for ${antTokenAmount.toFixed(antToken.priceDecimals)} ANT`
      );  
    },
    [antToken, antBondExchangeRateBN, ANTPriceInANTBLastEpoch, handleTransactionReceipt],
  );

  const antTokenIsOverPriced = useMemo(() => antBondExchangeRate > antTokenPriceRealTime, [antTokenPriceRealTime, antBondExchangeRate]);
  const antTokenIsUnderPriced = useMemo(() => antBondExchangeRate < antTokenPriceRealTime, [antTokenPriceRealTime, antBondExchangeRate]);
  const antTokenIsUnderPriceCeiling = useMemo(() => antBondExchangeRate < (antTokenPriceRealTime * 1.05), [antTokenPriceRealTime, antBondExchangeRate]);

  return (
    <Switch>
      <Page>
        {!!account ? (
          <>
            <Route exact path={path}>
              <PageHeader
                title="Purchase & Redeem Ant Bonds"
                subtitle="Purchase Ant Bonds at a discount price when the Ant Token price is below $1. Redeem the And Bonds when the Ant Token price is above $1.05"
              />
            </Route>
            <StyledAntBond>
              <StyledCardWrapper>
                <BondExchangeCard
                  action="Purchase"
                  fromToken={antToken.tokens.ANT}
                  fromTokenName="Ant Token"
                  toToken={antToken.tokens.ANTB}
                  toTokenName="Ant Bond"
                  exchangeRate={ANTBPriceInANTLastEpoch}
                  priceDesc={
                      antTokenIsOverPriced
                       ? 'Ant Token price is over target price'
                       : antTokenIsUnderPriced
                       ? `Ant Token price is below target price`
                       : 'Ant Token price is exactly target price'
                  }
                  onExchange={handleBuyAntBonds}
                  disabled={ ANTBPriceInANTLastEpoch <= 1 }
                />
              </StyledCardWrapper>
              <StyledStatsWrapper>
                <ExchangeStat
                  tokenName="Ant Price"
                  description="Last Epoch TWAP"
                  price={(antBondExchangeRate/antTokenPriceRealTime).toFixed(antToken.priceDecimals)}
                  currencySymbol="$"
                />
                <Spacer size="sm" />
                <ExchangeStat
                  tokenName="1.00 ANT"
                  description={ ANTBPriceInANTLastEpoch > 1 ? 'ANTB = 1.00/(Ant Price)' : 'ANTB is fixed price'}
                  price={ ANTBPriceInANTLastEpoch > 1 ? (antTokenPriceRealTime/antBondExchangeRate).toFixed(antToken.priceDecimals) + ' ANTB' : '1.00 ANTB' }
                />
              </StyledStatsWrapper>
              <StyledCardWrapper>
                <BondExchangeCard
                  action="Redeem"
                  fromToken={antToken.tokens.ANTB}
                  fromTokenName="Ant Bond"
                  toToken={antToken.tokens.ANT}
                  toTokenName="Ant Token"
                  reverseDirection={true}
                  exchangeRate={ANTPriceInANTBLastEpoch}
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
