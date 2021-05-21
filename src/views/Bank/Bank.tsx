import React, { useEffect } from 'react';
import styled from 'styled-components';

import { useParams } from 'react-router-dom';
import { useWallet } from '@binance-chain/bsc-use-wallet';

import Button from '../../components/Button';
import PageHeader from '../../components/PageHeader';
import Spacer from '../../components/Spacer';
import Harvest from './components/Harvest';
import AddLiquidity from './components/AddLiquidity';
import useBank from '../../hooks/useBank';
import useRedeem from '../../hooks/useRedeem';
import { Bank as BankEntity } from '../../anthill';

const Bank: React.FC = () => {
  useEffect(() => window.scrollTo(0, 0));

  const { bankId } = useParams();
  const bank = useBank(bankId);

  const { account } = useWallet();
  const { onRedeem } = useRedeem(bank);

  return account && bank ? (
    <>
      <PageHeader
        subtitle={`Deposit ${bank?.token0.symbol}/${bank?.token1.symbol} and earn ${bank?.earnTokenName}`}
        title={bank?.name}
      />
      <StyledBank>
        <StyledCardsWrapper>
          <StyledCardWrapper>
            <AddLiquidity bank={bank} />
          </StyledCardWrapper>
          <StyledCardWrapper>
            <Harvest bank={bank} />
          </StyledCardWrapper>
          <Spacer />
        </StyledCardsWrapper>
        <Spacer size="lg" />
        {bank.depositTokenName.includes('LP') && <LPTokenHelpText bank={bank} />}
        <Spacer size="lg" />
        <div>
          <Button onClick={onRedeem} text="Settle & Withdraw" />
        </div>
        <Spacer size="lg" />
      </StyledBank>
    </>
  ) : !bank ? (
    <BankNotFound />
  ) : (
    <UnlockWallet />
  );
};

const LPTokenHelpText: React.FC<{ bank: BankEntity }> = ({ bank }) => {
  let pairName: string;
  let uniswapUrl: string;
  if (bank.depositTokenName.includes('ANT')) {
    pairName = 'ANT-BUSD pair';
    uniswapUrl = 'https://app.uniswap.org/#/add/0x6b175474e89094c44da98b954eedeac495271d0f/0xb34ab2f65c6e4f764ffe740ab83f982021faed6d';
  } else {
    pairName = 'ANTS-BUSD pair';
    uniswapUrl = 'https://app.uniswap.org/#/add/0x6b175474e89094c44da98b954eedeac495271d0f/0xa9d232cc381715ae791417b624d7c4509d2c28db';
  }
  return (
    <StyledLink href={uniswapUrl} target="_blank">
      {`🦄  Provide liquidity to ${pairName} on Uniswap  🦄`}
    </StyledLink>
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

const StyledBank = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledUniswapLPGuide = styled.div`
  margin: -24px auto 48px;
`;

const StyledLink = styled.a`
  font-weight: 700;
  text-decoration: none;
  color: ${(props) => props.theme.color.primary.main};
`;

const StyledCardsWrapper = styled.div`
  display: flex;
  width: 800px;
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

const Center = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export default Bank;
