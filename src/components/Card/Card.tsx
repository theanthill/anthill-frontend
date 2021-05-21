import React from 'react'
import styled from 'styled-components'

const Card: React.FC = ({ children }) => (
  <StyledCard>
    {children}
  </StyledCard>
)

const StyledCard = styled.div`
  background-color: ${props => props.theme.color.grey[900]};
  border: 1px solid ${props => props.theme.color.grey[800]};
  border-radius: 12px;
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-bottom: 20px;
`

export default Card