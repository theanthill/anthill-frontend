import React, { useMemo } from 'react';
import styled from 'styled-components';
import useTokenBalance from '../../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../../utils/formatBalance';

import Button from '../../Button';
import Label from '../../Label';
import Modal, { ModalProps } from '../../Modal';
import ModalTitle from '../../ModalTitle';
import useAntToken from '../../../hooks/useAntToken';
import TokenSymbol from '../../TokenSymbol';

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const antToken = useAntToken();

  const antBalance = useTokenBalance(antToken.tokens.ANT);
  const displayAntBalance = useMemo(() => getDisplayBalance(antBalance), [antBalance]);

  const antsBalance = useTokenBalance(antToken.tokens.ANTS);
  const displayAntsBalance = useMemo(() => getDisplayBalance(antsBalance), [antsBalance]);

  const antbBalance = useTokenBalance(antToken.tokens.ANTB);
  const displayAntbBalance = useMemo(() => getDisplayBalance(antbBalance), [antbBalance]);

  return (
    <Modal>
      <ModalTitle text="My Wallet" />

      <Balances>
        <StyledBalanceWrapper>
          <TokenSymbol symbol="ANT" />
          <StyledBalance>
            <StyledValue>{displayAntBalance}</StyledValue>
            <Label text="ANT Available" />
          </StyledBalance>
        </StyledBalanceWrapper>

        <StyledBalanceWrapper>
          <TokenSymbol symbol="ANTS" />
          <StyledBalance>
            <StyledValue>{displayAntsBalance}</StyledValue>
            <Label text="ANTS Available" />
          </StyledBalance>
        </StyledBalanceWrapper>

        <StyledBalanceWrapper>
          <TokenSymbol symbol="ANTB" />
          <StyledBalance>
            <StyledValue>{displayAntbBalance}</StyledValue>
            <Label text="ANTB Available" />
          </StyledBalance>
        </StyledBalanceWrapper>
      </Balances>
    </Modal>
  )
}

const StyledValue = styled.div`
  color: ${props => props.theme.color.grey[300]};
  font-size: 30px;
  font-weight: 700;
`

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const Balances = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing[4]}px;
`

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 0 ${props => props.theme.spacing[3]}px;
`

const StyledBalanceIcon = styled.div`
  font-size: 36px;
  margin-right: ${props => props.theme.spacing[3]}px;
`

const StyledBalanceActions = styled.div`
  align-items: center;
  display: flex;
  margin-top: ${props => props.theme.spacing[4]}px;
`

export default AccountModal