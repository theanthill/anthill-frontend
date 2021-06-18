import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      {}
      <StyledLink href="https://github.com/theanthill/anthill-contracts" target="_blank">GitHub</StyledLink>
      <StyledLink href="https://www.theanthill.io" target="_blank">Community</StyledLink>
      <StyledLinkHidden exact to="/boardroom">Boardroom</StyledLinkHidden>
    </StyledNav>
  )
}

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
`

const StyledLink = styled.a`
  color: ${props => props.theme.color.grey[400]};
  padding-left: ${props => props.theme.spacing[3]}px;
  padding-right: ${props => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${props => props.theme.color.grey[500]};
  }
`

const StyledLinkHidden = styled(NavLink)`
  color: ${props => props.theme.color.black};
  padding-left: ${props => props.theme.spacing[3]}px;
  padding-right: ${props => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${props => props.theme.color.black};
  }
`

export default Nav