import React, { useCallback, useMemo, useState } from 'react'

import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'
import TokenInput from '../../../components/TokenInput'

import { getDisplayBalance, getFullDisplayBalance } from '../../../utils/formatBalance'
import { Bank } from '../../../anthill/types'
import Value from '../../../components/Value'
import Label from '../../../components/Label'
import styled from 'styled-components'
import useTotalLiquidityAmounts from '../../../hooks/useTotalLiquidityAmounts'

interface SwapInfoModalProps extends ModalProps {
  bank: Bank,
}

const SwapInfoModal: React.FC<SwapInfoModalProps> = ({ onDismiss, bank }) => {
  const [token0TotalBalance, token1TotalBalance] = useTotalLiquidityAmounts(bank);
  
  const totalToken0Amount = getDisplayBalance(token0TotalBalance, bank.token0.decimal);
  const totalToken1Amount = getDisplayBalance(token1TotalBalance, bank.token0.decimal);

  return (
    <Modal>
      <ModalTitle text={`Swap Info ${bank.token0Name} ⇄ ${bank.token1Name}`} />
      <StyledCardHeader>
        <StyledText>
            Exchange tokens from a liquidity pool pair. A fee of 0.20% is paid when swapping tokens.
        </StyledText>
        <StyledActionSpacer/>
        <StyledValues>
          <Value size='24px' value={`${totalToken0Amount} ${bank.token0.symbol}`}/>
          <StyledActionSpacer/>
          <Value size='24px' value={`${totalToken1Amount} ${bank.token1.symbol}`}/>
        </StyledValues>
        <Label text={`Total liquidity in pool`} />
        <StyledActionSpacer/>
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

const StyledText = styled.div`
  align-items: center;
  color: ${props => props.theme.color.grey[600]};
  display: flex;
  font-size: 12px;
  font-weight: 700;
  height: 44px;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

export default SwapInfoModal