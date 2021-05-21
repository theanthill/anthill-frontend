import React from 'react';
import styled from 'styled-components';
import { useWallet } from '@binance-chain/bsc-use-wallet';

import useModal from '../../../hooks/useModal';
import useChangeDollarPrice from '../../../hooks/useChangeDollarPrice';
import Button from '../../Button';

import DollarPriceModal from './DollarPriceModal';

interface DollarPriceButtonProps {}

const DollarPriceButton: React.FC<DollarPriceButtonProps> = (props) => {
  const { account } = useWallet();
  const { onChangeDollarPrice } = useChangeDollarPrice();

  const [onPresentDollarPriceModal, onDismissDollarPriceModal] = useModal(
    <DollarPriceModal
      onConfirm={(amount) => {
        onChangeDollarPrice(amount);
        onDismissDollarPriceModal();
      }}
    />)  
  return (
    <StyledDollarPriceButton>
      {!!account &&
        <Button
          onClick={onPresentDollarPriceModal}
          size="sm"
          text="Set Dollar Price"
        />
    }
    </StyledDollarPriceButton>
  )
}

const StyledDollarPriceButton = styled.div`
  margin-right: ${(props) => props.theme.spacing[4]}px;
`;
export default DollarPriceButton