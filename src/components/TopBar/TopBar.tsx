import React from 'react'
import styled from 'styled-components'

import Container from '../Container'
import Logo from '../Logo'

import AccountButton from './components/AccountButton'
import AllocateSeigniorageButton from './components/AllocateSeigniorageButton'
import DollarPriceButton from './components/DollarPriceButton'
import Nav from './components/Nav'
import TxButton from './components/TxButton'

const TopBar: React.FC = () => {
  return (
    <StyledTopBar>
      <Container size="lg">
        <StyledTopBarInner>
          <div style={{ flex: 1,
          justifyContent: 'center' }}>
            <Logo />
          </div>
          <Nav />
          <div style={{
            flex: 1,

          }}>
          </div>
        </StyledTopBarInner>
      </Container>
      <Container size="lg">
        <StyledTopBarInner>
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center'
          }}>
            <DollarPriceButton/>
            <AllocateSeigniorageButton/>
            <TxButton />
            <AccountButton />
          </div>
        </StyledTopBarInner>
      </Container>
    </StyledTopBar>
  )
}

const StyledTopBar = styled.div``

const StyledTopBarInner = styled.div`
  align-items: center;
  display: flex;
  height: ${props => props.theme.topBarSize}px;
  justify-content: space-between;
  max-width: ${props => props.theme.siteWidth}px;
  width: 100%;
  flex-wrap: wrap;
`

export default TopBar