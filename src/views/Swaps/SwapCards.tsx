import React from 'react';
import styled from 'styled-components';
import Humanize from 'humanize-plus';

import { Bank } from '../../anthill';
import Button from '../../components/Button';
import Card from '../../components/Card';
import CardContent from '../../components/CardContent';
import CardIcon from '../../components/CardIcon';
import useBanks from '../../hooks/useBanks';
import TokenSymbol from '../../components/TokenSymbol';
import Notice from '../../components/Notice';
import useLiquidityPoolTVL from '../../hooks/usePoolTVL';
import { getBalance } from '../../utils/formatBalance';

const SwapCards: React.FC = () => {
  const [banks] = useBanks();

  const activeBanks = banks.filter((bank) => !bank.finished);
  const inactiveBanks = banks.filter((bank) => bank.finished);

  let finishedFirstRow = false;
  const inactiveRows = inactiveBanks.reduce<Bank[][]>(
    (bankRows, bank) => {
      const newBankRows = [...bankRows];
      if (newBankRows[newBankRows.length - 1].length === (finishedFirstRow ? 2 : 3)) {
        newBankRows.push([bank]);
        finishedFirstRow = true;
      } else {
        newBankRows[newBankRows.length - 1].push(bank);
      }
      return newBankRows;
    },
    [[]],
  );
  
  return (
    <StyledCards>
      {inactiveRows[0].length > 0 && (
        <StyledInactiveNoticeContainer>
          <Notice color="grey">
            <b>You have banks where the mining has finished.</b>
            <br />
            Please withdraw and settle your stakes.
          </Notice>
        </StyledInactiveNoticeContainer>
      )}
      <StyledRow>
        {activeBanks.map((bank, i) => (
          <React.Fragment key={bank.name}>
            <SwapCard bank={bank} />
            {i < activeBanks.length - 1 && <StyledSpacer />}
          </React.Fragment>
        ))}
      </StyledRow>
      {inactiveRows[0].length > 0 && (
        <>
          <StyledInactiveBankTitle>Inactive Banks</StyledInactiveBankTitle>
          {inactiveRows.map((bankRow, i) => (
            <StyledRow key={i}>
              {bankRow.map((bank, j) => (
                <React.Fragment key={j}>
                  <SwapCard bank={bank} />
                  {j < bankRow.length - 1 && <StyledSpacer />}
                </React.Fragment>
              ))}
            </StyledRow>
          ))}
        </>
      )}
    </StyledCards>
  );
};

interface SwapCardProps {
  bank: Bank;
}

const SwapCard: React.FC<SwapCardProps> = ({ bank }) => {
  const TVL = useLiquidityPoolTVL(bank); 
  
  return (
    <StyledCardWrapper>
      <StyledCardSuperAccent />
      <Card>
        <CardContent>
          <StyledContent>
            <CardIcon>
              <TokenSymbol symbol={bank.token0.symbol} size={60} /><Arrow>⇄</Arrow><TokenSymbol symbol={bank.token1.symbol} size={60} />
            </CardIcon>
            <StyledTitle>{bank.swapTitle}</StyledTitle>
            <StyledDetails>
              <StyledDetail>Exchange either way</StyledDetail>
              <StyledSpacer/>
              <StyledStats>TVL: {`~$${Humanize.compactInteger(getBalance(TVL))}`}</StyledStats>
            </StyledDetails>
            <Button text="Select" to={`/swap/${bank.contract}`} />
          </StyledContent>
        </CardContent>
      </Card>
    </StyledCardWrapper>
  );
};

const Arrow = styled.div`
  color: #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  justify-content: center;
`;

const StyledCardSuperAccent = styled.div`
  border-radius: 12px;
  filter: blur(8px);
  position: absolute;
  top: -4px;
  right: -4px;
  bottom: -4px;
  left: -4px;
  z-index: -1;
`;

const StyledCards = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 940px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
  flex-flow: row wrap;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  width: calc((900px - ${(props) => props.theme.spacing[4]}px * 2) / 3);
  position: relative;
`;

const StyledTitle = styled.h4`
  color: ${(props) => props.theme.color.grey[200]};
  font-size: 24px;
  height: 70px;
  font-weight: 700;
  text-align: center;
  margin: ${(props) => props.theme.spacing[2]}px 0 0;
  padding: 0;
`;

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`;

const StyledDetails = styled.div`
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
  margin-top: ${(props) => props.theme.spacing[2]}px;
  text-align: center;
`;

const StyledDetail = styled.div`
  color: ${(props) => props.theme.color.grey[300]};
`;

const StyledDisclaimers = styled.div`
  margin-bottom: ${(props) => props.theme.spacing[3]}px;
  margin-top: ${(props) => props.theme.spacing[1]}px;
  text-align: center;
`;

const StyledDisclaimerSmall = styled.div`
  color: ${(props) => props.theme.color.grey[300]};
  font-size: 14px;
`;

const StyledInactiveNoticeContainer = styled.div`
  width: 598px;
  margin-bottom: ${(props) => props.theme.spacing[6]}px;
`;

const StyledInactiveBankTitle = styled.p`
  font-size: 24px;
  font-weight: 600;
  color: ${(props) => props.theme.color.grey[400]};
  margin-top: ${(props) => props.theme.spacing[5]}px;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`;

const StyledApproveButton = styled.div`
  display: block;
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;

const StyledStats = styled.div`
  color: ${(props) => props.theme.color.grey[500]};
  font-weight: 700;
  font-size: 12px;
`;

export default SwapCards;