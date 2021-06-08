import React, { useCallback, useMemo, useState } from 'react'

import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'
import TokenInput from '../../../components/TokenInput'

import { getFullDisplayBalance } from '../../../utils/formatBalance'
import { BigNumber } from 'ethers';
import { Bank } from '../../../anthill/types'

interface LiquidityInfoModalProps extends ModalProps {
  bank: Bank,
  
  //max: BigNumber,
  //onConfirm: (amount: string) => void,
  //decimals?: number,
}

const LiquidityInfoModal: React.FC<LiquidityInfoModalProps> = ({ onDismiss, bank }) => {
  const [val, setVal] = useState('')

  /*const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max, decimals)
  }, [max])

  const handleChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setVal(e.currentTarget.value)
  }, [setVal])

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])
*/
  return (
    <Modal>
      <ModalTitle text={`Liquidity Info ${bank.token0Name} + ${bank.token1Name}`} />
    </Modal>
  )
}

export default LiquidityInfoModal