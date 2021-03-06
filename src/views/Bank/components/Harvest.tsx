import React from 'react';
import styled from 'styled-components';

import Button from '../../../components/Button';
import Card from '../../../components/Card';
import CardContent from '../../../components/CardContent';
import CardIcon from '../../../components/CardIcon';
import Label from '../../../components/Label';
import Value from '../../../components/Value';

import useEarnings from '../../../hooks/useEarnings';
import useExitAndClaim from '../../../hooks/useExitAndClaim';

import { getDisplayBalance } from '../../../utils/formatBalance';
import TokenSymbol from '../../../components/TokenSymbol';
import { Bank } from '../../../anthill';
import useUserTotalLiquidity from '../../../hooks/useUserTotalLiquidity';
import InfoButton from '../../../components/InfoButton';
import useModal from '../../../hooks/useModal';
import LiquidityInfoModal from './LiquidityInfoModal';

interface HarvestProps {
  bank: Bank;
}

const Harvest: React.FC<HarvestProps> = ({ bank }) => {
  const earnings = useEarnings(bank);
  const { onExitAndClaim } = useExitAndClaim(bank);
  const userTotalLiquidity = useUserTotalLiquidity(bank);

  const [onPresentInfo] = useModal(
    <LiquidityInfoModal bank={bank}/>,
  );

  return (
    <Card>
      <CardContent>
        <StyledCardContentInner>
          <StyledInfoButton>
            <InfoButton onClick={onPresentInfo} size='25px'/>
          </StyledInfoButton>
          <StyledCardHeader>
            <CardIcon>
              <TokenSymbol symbol={bank.earnToken.symbol} />
            </CardIcon>
            <Value value={getDisplayBalance(userTotalLiquidity)} />
            <Label text={`Total Liquidity Staked`} />
            <StyledSpacer/>
            <Value value={getDisplayBalance(earnings, 18, 6)} />
            <Label text={`${bank.earnTokenName} Rewarded`} />
          </StyledCardHeader>
          <StyledCardActions>
            <Button onClick={onExitAndClaim} disabled={earnings.eq(0)} text="Remove Liquidity & Claim Rewards"  />
          </StyledCardActions>
        </StyledCardContentInner>
      </CardContent>
    </Card>
  );
};

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledCardActions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: ${(props) => props.theme.spacing[6]}px;
  width: 100%;
`;

const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`;

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledInfoButton = styled.div`
  margin-left: auto; 
  margin-right: 0;
`;

export default Harvest;
