import React from 'react'
import styled from 'styled-components'

import Button from '../Button'
import Input, { InputProps } from '../Input'

interface FiatInputProps extends InputProps {
  symbol: string,
}

const FiatInput: React.FC<FiatInputProps> = ({
  symbol,
  onChange,
  value,
}) => {
  return (
    <StyledFiatInput>
      <Input
        endAdornment={(
          <StyledTokenAdornmentWrapper>
            <StyledTokenSymbol>{symbol}</StyledTokenSymbol>
            <StyledSpacer />
          </StyledTokenAdornmentWrapper>
        )}
        onChange={onChange}
        placeholder="0"
        value={value}
      />
    </StyledFiatInput>
  )
}

/*
            <div>
              <Button size="sm" text="Max" />
            </div>
*/

const StyledFiatInput = styled.div`

`

const StyledSpacer = styled.div`
  width: ${props => props.theme.spacing[3]}px;
`

const StyledTokenAdornmentWrapper = styled.div`
  align-items: center;
  display: flex;
`

const StyledTokenSymbol = styled.span`
  color: ${props => props.theme.color.grey[600]};
  font-weight: 700;
`

export default FiatInput