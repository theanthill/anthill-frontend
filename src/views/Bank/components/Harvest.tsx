import React from 'react';
import styled from 'styled-components';

import { tokens } from '../../../config';

import Button from '../../../components/Button';
import Card from '../../../components/Card';
import CardContent from '../../../components/CardContent';
import CardIcon from '../../../components/CardIcon';
import Label from '../../../components/Label';
import Value from '../../../components/Value';

import useEarnings from '../../../hooks/useEarnings';
import useHarvest from '../../../hooks/useHarvest';

import { getDisplayBalance } from '../../../utils/formatBalance';
import TokenSymbol from '../../../components/TokenSymbol';
import { Bank } from '../../../anthill';
import useStakedBalance from '../../../hooks/useStakedBalance';
import InfoButton from '../../../components/InfoButton';
import useModal from '../../../hooks/useModal';
import LiquidityInfoModal from './LiquidityInfoModal';
import useRemoveLiquidity from '../../../hooks/useRemoveLiquidity';
import LiquidityWithdrawModal from './LiquidityWithdrawModal';

interface HarvestProps {
  bank: Bank;
}

const Harvest: React.FC<HarvestProps> = ({ bank }) => {
  const earnings = useEarnings(bank.contract);
  const { onReward } = useHarvest(bank);
  const stakedBalance = useStakedBalance(bank.contract);

  const [onPresentInfo] = useModal(
    <LiquidityInfoModal bank={bank}/>,
  );
  
  const { onRemoveLiquidity } = useRemoveLiquidity(bank);

  const [onPresentWithdraw, onDismissWithdraw] = useModal(
    <LiquidityWithdrawModal
      bank={bank}
      onConfirm={(amount) => {
        onRemoveLiquidity(amount);
        onDismissWithdraw();
      }}
    />,
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
            <Value value={getDisplayBalance(stakedBalance, bank.depositToken.decimal)} />
            <Label text={`${tokens[bank.depositTokenName].titleName} Tokens Staked`} />
            <StyledSpacer/>
            <Value value={getDisplayBalance(earnings, 18, 6)} />
            <Label text={`${bank.earnTokenName} Rewarded`} />
          </StyledCardHeader>
          <StyledCardActions>
            <Button
              disabled={getDisplayBalance(stakedBalance, bank.depositToken.decimal)==='0.00'}
              onClick={onPresentWithdraw}
              text={`Remove Liquidity`}
            />
            <StyledActionSpacer/>
            <Button onClick={onReward} disabled={earnings.eq(0)} text="Claim Rewards"  />
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

const StyledActionSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`;

export default Harvest;
