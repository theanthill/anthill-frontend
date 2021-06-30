import React, { useCallback, useState } from 'react';
import Button from '../../../components/Button';
import Modal, { ModalProps } from '../../../components/Modal';
import ModalActions from '../../../components/ModalActions';
import ModalTitle from '../../../components/ModalTitle';
import TokenExchangeInput from '../../../components/TokenExchangeInput';
import TokenExchangeValue from '../../../components/TokenExchangeValue';
import Label from '../../../components/Label';
import ERC20 from '../../../anthill/ERC20';
import Spacer from '../../../components/Spacer';

interface ExchangeModalProps extends ModalProps {
  onConfirm: (amount: number) => void;
  title: string;
  description: string;
  action: string;
  tokenIn: ERC20;
  tokenInName: string;
  tokenOut: ERC20;
  tokenOutName: string;
  exchangeRate: number;
}

const BondExchangeModal: React.FC<ExchangeModalProps> = ({
  title,
  description,
  onConfirm,
  onDismiss,
  action,
  tokenIn,
  tokenInName,
  tokenOut,
  tokenOutName,
  exchangeRate
}) => {
  const [amountIn, setAmountIn] = useState<number>(0);

  const handleChange = useCallback((amount: string) => 
    setAmountIn(Number(amount)),
    [setAmountIn],
  );

  const amountOut = amountIn * exchangeRate;

  return (
    <Modal>
      <ModalTitle text={title} />
      <TokenExchangeInput
        token={tokenIn}
        tokenName={tokenInName}
        onChange={handleChange}
      />
     <TokenExchangeValue
        token={tokenOut}
        tokenName={tokenOutName}
        value={amountOut ? String(amountOut) : ''}
      />
      <Spacer/>
      <Label text={`Rate = ${exchangeRate} ${tokenOutName} per ${tokenInName}`} />
      <ModalActions>
        <Button text="Cancel" variant="secondary" onClick={onDismiss} />
        <Button text={action} onClick={() => onConfirm(amountIn)} />
      </ModalActions>
    </Modal>
  );
};


export default BondExchangeModal;
