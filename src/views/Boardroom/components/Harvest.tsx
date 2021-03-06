import React from 'react';
import styled from 'styled-components';

import Button from '../../../components/Button';
import TokenSymbol from '../../../components/TokenSymbol';
import Card from '../../../components/Card';
import CardContent from '../../../components/CardContent';
import Label from '../../../components/Label';
import Value from '../../../components/Value';
import CardIcon from '../../../components/CardIcon';
import useHarvestFromBoardroom from '../../../hooks/useHarvestFromBoardroom';
import useEarningsOnBoardroom from '../../../hooks/useEarningsOnBoardroom';
import { getDisplayBalance } from '../../../utils/formatBalance';

const Harvest: React.FC = () => {
  const { onReward } = useHarvestFromBoardroom();
  const earnings = useEarningsOnBoardroom();

  return (
    <Card>
      <CardContent>
        <StyledCardContentInner>
          <StyledCardHeader>
            <CardIcon>
              <TokenSymbol symbol="ANT" />
            </CardIcon>
            <Value value={getDisplayBalance(earnings)} />
            <Label text="Ant Tokens Rewarded" />
          </StyledCardHeader>
          <StyledCardActions>
            <Button onClick={onReward} text="Claim Reward" disabled={earnings.eq(0)} />
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
  justify-content: center;
  margin-top: ${(props) => props.theme.spacing[6]}px;
  width: 100%;
`;

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`;

export default Harvest;
