import React, { useCallback, useMemo, useState } from 'react'

import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'
import TokenInput from '../../../components/TokenInput'

import { getFullDisplayBalance } from '../../../utils/formatBalance'
import { BigNumber } from 'ethers';

interface LiquidityModalProps extends ModalProps {
  max: BigNumber,
  decimals: number,
  onConfirm: (amount: string) => void,
  tokenName?: string,
}

const LiquidityModal: React.FC<LiquidityModalProps> = ({ max, decimals, onConfirm, onDismiss, tokenName = '' }) => {
  const [val, setVal] = useState('')

  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max, decimals)
  }, [max])

  const handleChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setVal(e.currentTarget.value)
  }, [setVal])

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])

  return (
    <Modal>
      <ModalTitle text={`Deposit ${tokenName}`} />
      <TokenInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={tokenName}
      />
      <ModalActions>
        <Button text="Cancel" variant="secondary" onClick={onDismiss} />
        <Button text="Confirm" onClick={() => onConfirm(val)} />
      </ModalActions>
    </Modal>
  )
}


export default LiquidityModal