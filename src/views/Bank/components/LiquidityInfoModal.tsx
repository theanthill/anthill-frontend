import React from 'react'

import Modal, { ModalProps } from '../../../components/Modal'
import ModalTitle from '../../../components/ModalTitle'

import { formatNumber, getHumanizedDisplayBalance, } from '../../../utils/formatBalance'
import { Bank } from '../../../anthill/types'
import useUserStakedLiquidityAmounts from '../../../hooks/useUserStakedLiquidityAmounts'
import Value from '../../../components/Value'
import Label from '../../../components/Label'
import styled from 'styled-components'
import useTotalLiquidityAmounts from '../../../hooks/useTotalLiquidityAmounts'
import usePoolAPRAPY from '../../../hooks/usePoolAPRAPY'
import useBankTVL from '../../../hooks/useBankTVL'
import Spacer from '../../../components/Spacer'

interface LiquidityInfoModalProps extends ModalProps {
  bank: Bank,
}

const LiquidityInfoModal: React.FC<LiquidityInfoModalProps> = ({ onDismiss, bank }) => {
  const [token0UserBalance, token1UserBalance] = useUserStakedLiquidityAmounts(bank);
  const [token0TotalBalance, token1TotalBalance] = useTotalLiquidityAmounts(bank);
  
  const userToken0Amount = getHumanizedDisplayBalance(token0UserBalance, bank.token0.decimal);
  const userToken1Amount = getHumanizedDisplayBalance(token1UserBalance, bank.token1.decimal);

  const totalToken0Amount = getHumanizedDisplayBalance(token0TotalBalance, bank.token0.decimal);
  const totalToken1Amount = getHumanizedDisplayBalance(token1TotalBalance, bank.token0.decimal);

  const [APR, APY] = usePoolAPRAPY(bank);
  const TVL = getHumanizedDisplayBalance(useBankTVL(bank)); 
  
  return (
    <Modal>
      <ModalTitle text={`Liquidity Info ${bank.token0Name} + ${bank.token1Name}`} />
      <StyledCardHeader>
        <StyledText>
            The amounts that you can redeem depend directly on your share in the pool and the
            total liquidity locked in the pool for each token.
        </StyledText>
        <StyledActionSpacer/>
        <StyledValues>
          <Value size='24px' value={`${userToken0Amount} ${bank.token0.symbol}`}/>
          <StyledActionSpacer/>
          <Value size='24px' value={`${userToken1Amount} ${bank.token1.symbol}`}/>
        </StyledValues>
        <Label text={`Redeemable tokens`} />
        <StyledActionSpacer/>
        <StyledValues>
          <Value size='24px' value={`${totalToken0Amount} ${bank.token0.symbol}`}/>
          <StyledActionSpacer/>
          <Value size='24px' value={`${totalToken1Amount} ${bank.token1.symbol}`}/>
        </StyledValues>
        <Label text={`Total liquidity in pool`} />
        <StyledActionSpacer/>
        <StyledValues>
          <Value size='24px' value={`$${TVL}`}/>
        </StyledValues>
        <Label text={`Total Value Locked`} />
        <StyledActionSpacer/>
        <StyledValues>
          <StyledColumn>
            <Value size='14px' value={`${formatNumber(APR)}%`}/>
            <Label text={`APR`} />
          </StyledColumn>
          { isFinite(APY) && <Spacer/> }
          { isFinite(APY) && 
              <StyledColumn>
                <Value size='14px' value={`${formatNumber(APY)}%`}/>
                <Label text={`APY`} />
              </StyledColumn>
          }
        </StyledValues>
      </StyledCardHeader>
    </Modal>
    
  )
}

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledActionSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`;

const StyledValues = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledText = styled.div`
  align-items: center;
  color: ${props => props.theme.color.grey[600]};
  display: flex;
  font-size: 14px;
  font-weight: 700;
  height: 44px;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

export default LiquidityInfoModal