import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import ERC20 from '../../../anthill/ERC20';

import { getFullDisplayBalance } from '../../../utils/formatBalance';

import useTokenBalance from '../../../hooks/useTokenBalance';

import TokenInput from '../../../components/TokenInput'

interface TokenSwapValueProps {
  token: ERC20;
  tokenName: string;
  value: string;
}

const TokenSwapValue: React.FC<TokenSwapValueProps> = ({ token, tokenName, value }) => {
  const [val, setVal] = useState('')

  const tokenBalance = useTokenBalance(token);
    
  const balanceMax = useMemo(() => {
    return getFullDisplayBalance(tokenBalance, token.decimal)
  }, [tokenBalance])

  const handleSelectMax = useCallback(() => {
    setVal(balanceMax)
  }, [balanceMax, setVal])

  const handleTokenChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    setVal(e.currentTarget.value)
  }, [setVal])

  return (
        <StyledCardHeader>
            <TokenInput
                    value={value}
                    onSelectMax={handleSelectMax}
                    onChange={handleTokenChange}
                    max={balanceMax}
                    symbol={tokenName}
                    disable={true}
                />
        </StyledCardHeader>
    );
}

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

export default TokenSwapValue;
