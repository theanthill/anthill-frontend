import React, { useCallback, useMemo, useState } from 'react'

import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'
import FiatInput from '../../../components/FiatInput'

interface DollarPriceModalProps extends ModalProps {
  onConfirm: (amount: string) => void,
}

const DollarPriceModal: React.FC<DollarPriceModalProps> = ({ onConfirm, onDismiss }) => {
  const [val, setVal] = useState('')

  const handleChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setVal(e.currentTarget.value)
  }, [setVal])

  return (
    <Modal>
      <ModalTitle text={`Change ANT Dollar price`} />
      <FiatInput
        value={val}
        onChange={handleChange}
        symbol="$"
      />
      <ModalActions>
        <Button text="Cancel" variant="secondary" onClick={onDismiss} />
        <Button text="Confirm" onClick={() => onConfirm(val)} />
      </ModalActions>
    </Modal>
  )
}


export default DollarPriceModal