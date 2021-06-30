import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import ERC20 from '../../../anthill/ERC20';
import { getFullDisplayBalance } from '../../../utils/formatBalance';

import useTokenBalance from '../../../hooks/useTokenBalance';

import TokenInput from '../../../components/TokenInput'

interface SwapTokensProps {
  token: ERC20;
  tokenName: string;
  onChange?: (amount: string) => void,
  disable?: boolean;
}

const BondExchangeInput: React.FC<SwapTokensProps> = ({ token, tokenName, onChange=null, disable=false }) => {
  const [val, setVal] = useState('')

  const tokenBalance = useTokenBalance(token);
    
  const balanceMax = useMemo(() => {
    return getFullDisplayBalance(tokenBalance, token.decimal)
  }, [tokenBalance, token])

  const handleSelectMax = useCallback(() => {
    setVal(balanceMax)
    if (onChange) onChange(balanceMax)
  }, [balanceMax, setVal, onChange])

  const handleTokenChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setVal(e.currentTarget.value)
    if (onChange) onChange(e.currentTarget.value)
  }, [setVal, onChange])

  return (
        <StyledCardHeader>
            <TokenInput
                    value={val}
                    onSelectMax={handleSelectMax}
                    onChange={handleTokenChange}
                    max={balanceMax}
                    symbol={tokenName}
                    disable={disable}
                />
        </StyledCardHeader>
    );
}

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

export default BondExchangeInput;
