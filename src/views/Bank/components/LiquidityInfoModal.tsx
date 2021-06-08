import React, { useCallback, useMemo, useState } from 'react'

import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'
import TokenInput from '../../../components/TokenInput'

import { getDisplayBalance, getFullDisplayBalance } from '../../../utils/formatBalance'
import { BigNumber } from 'ethers';
import { Bank } from '../../../anthill/types'
import useUserLiquidityAmounts from '../../../hooks/useLiquidityAmounts'
import Value from '../../../components/Value'
import Label from '../../../components/Label'
import styled from 'styled-components'
import useTotalLiquidityAmounts from '../../../hooks/useTotalLiquidityAmounts'
import { tokenEarnedPerThousandDollarsCompounding } from '../../../utils/compoundApyHelper'

interface LiquidityInfoModalProps extends ModalProps {
  bank: Bank,
}

const LiquidityInfoModal: React.FC<LiquidityInfoModalProps> = ({ onDismiss, bank }) => {
    const [token0UserBalance, token1UserBalance] = useUserLiquidityAmounts(bank);
  const [token0TotalBalance, token1TotalBalance] = useTotalLiquidityAmounts(bank);
  
  const userToken0Amount = getDisplayBalance(token0UserBalance, bank.token0.decimal);
  const userToken1Amount = getDisplayBalance(token1UserBalance, bank.token1.decimal);

  const totalToken0Amount = getDisplayBalance(token0TotalBalance, bank.token0.decimal);
  const totalToken1Amount = getDisplayBalance(token1TotalBalance, bank.token0.decimal);

  return (
    <Modal>
      <ModalTitle text={`Liquidity Info ${bank.token0Name} + ${bank.token1Name}`} />
      <StyledCardHeader>
        <StyledText>
            Tokens in the pool that are currently redeemable. The amounts that you can
            redeem will change if the total amount of tokens in the liquidity pool change.
        </StyledText>
        <Value size='24px' value={`${userToken0Amount} ${bank.token0.symbol} / ${userToken1Amount} ${bank.token1.symbol}`}/>
        <Label text={`Reedemable tokens`} />
        <StyledActionSpacer/>
        <Value size='24px' value={`${totalToken0Amount} ${bank.token0.symbol} / ${totalToken1Amount} ${bank.token1.symbol}`}/>
        <Label text={`Total liquidity in pool`} />
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

const StyledText = styled.div`
  align-items: center;
  color: ${props => props.theme.color.grey[400]};
  display: flex;
  font-size: 14px;
  font-weight: 700;
  height: 44px;
  justify-content: flex-end;
  margin-bottom: 20px;
`;

export default LiquidityInfoModal