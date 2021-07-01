import React, { useCallback, useMemo, useState } from 'react'

import Button from '../../../components/Button'
import Modal, { ModalProps } from '../../../components/Modal'
import ModalActions from '../../../components/ModalActions'
import ModalTitle from '../../../components/ModalTitle'
import TokenInput from '../../../components/TokenInput'

import { getDisplayBalance, getFullDisplayBalance } from '../../../utils/formatBalance'
import { Bank } from '../../../anthill/types'
import useStakedBalance from '../../../hooks/useStakedBalance'
import Spacer from '../../../components/Spacer'
import Label from '../../../components/Label'
import useUserCustomLiquidityAmounts from '../../../hooks/useUserCustomLiquidityAmounts'
import { parseUnits } from 'ethers/lib/utils'

interface WithdrawModalProps extends ModalProps {
  bank: Bank,
  onConfirm: (amount: string) => void,
}

const LiquidityWithdrawModal: React.FC<WithdrawModalProps> = ({ bank, onConfirm, onDismiss}) => {
  const [amount, setAmount] = useState('');
  
  const amountBN = parseUnits(amount !== '' ? amount : "0", bank.depositToken.decimal);
  
  const stakedBalance = useStakedBalance(bank.contract);
  const [token0UserBalance, token1UserBalance] = useUserCustomLiquidityAmounts(bank, amountBN);
  const token0Minimum = getDisplayBalance(token0UserBalance, bank.depositToken.decimal);
  const token1Minimum = getDisplayBalance(token1UserBalance, bank.depositToken.decimal);

  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(stakedBalance, bank.depositToken.decimal)
  }, [stakedBalance, bank])

  const handleChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setAmount(e.currentTarget.value)
  }, [setAmount])

  const handleSelectMax = useCallback(() => {
    setAmount(fullBalance)
  }, [fullBalance, setAmount])

  return (
    <Modal>
      <ModalTitle text={`Withdraw ${bank.depositTokenName}`} />
      <TokenInput
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        value={amount}
        max={fullBalance}
        symbol={bank.depositTokenName}
      />
      <Spacer/>
      <Label text={`Receives minimum ${token0Minimum} ${bank.token0Name} and ${token1Minimum} ${bank.token1Name}`} />
      <ModalActions>
        <Button text="Cancel" variant="secondary" onClick={onDismiss} />
        <Button text="Confirm" onClick={() => onConfirm(amount)} />
      </ModalActions>
    </Modal>
  )
}

export default LiquidityWithdrawModal