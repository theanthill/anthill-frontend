import React, { useEffect } from 'react';
import styled from 'styled-components';

import { useParams } from 'react-router-dom';
import { useWallet } from '@binance-chain/bsc-use-wallet';

import Button from '../../components/Button';
import PageHeader from '../../components/PageHeader';
import Spacer from '../../components/Spacer';
import SwapTokens from './components/SwapTokens';
import useBank from '../../hooks/useBank';

const Swap: React.FC = () => {
  useEffect(() => window.scrollTo(0, 0));

  const { bankId } = useParams();
  const bank = useBank(bankId);

  const { account } = useWallet();

  return account && bank ? (
    <>
      <PageHeader
        subtitle={`Exchange ${bank?.token0.symbol} by ${bank?.token1.symbol} and viceversa`}
        title={bank?.swapTitle}
      />
      <StyledSwap>
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <SwapTokens bank={bank} /> 
          </StyledCardWrapper>
        </StyledCardsWrapper>
        <Spacer size="lg" />
      </StyledSwap>
    </>
  ) : !bank ? (
    <BankNotFound />
  ) : (
    <UnlockWallet />
  );
};

const BankNotFound = () => {
  return (
    <Center>
      <PageHeader
        title="Not Found"
        subtitle="You've hit a bank just robbed by unicorns."
      />
    </Center>
  );
};

const UnlockWallet = () => {
  const { connect } = useWallet();
  return (
    <Center>
      <Button onClick={() => connect('injected')} text="Unlock Wallet" />
    </Center>
  );
};

const StyledSwap = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledCardsWrapper = styled.div`
  display: flex;
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Center = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export default Swap;
