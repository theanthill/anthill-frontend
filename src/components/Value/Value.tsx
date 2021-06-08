import React from 'react'

import styled from 'styled-components'

interface ValueProps {
  value: string,
  size?: string
}

const Value: React.FC<ValueProps> = ({ value, size }) => {
  return (
    <StyledValue size={size}>{value}</StyledValue>
  )
}

interface StyledValueProps {
  size?: string
}

const StyledValue = styled.div<StyledValueProps>`
  color: ${props => props.theme.color.grey[200]};
  font-size: ${ props => props.size ? props.size : '36px'};
  font-weight: 700;
`

export default Value