import React from 'react'
import styled from 'styled-components'

export interface InputProps {
  endAdornment?: React.ReactNode,
  onChange: (e: React.FormEvent<HTMLInputElement>) => void,
  placeholder?: string,
  startAdornment?: React.ReactNode,
  value: string,
  disable?: boolean
}

const Input: React.FC<InputProps> = ({
  endAdornment,
  onChange,
  placeholder,
  startAdornment,
  value,
  disable=false
}) => {
  return (
    (!disable ?
    <StyledInputWrapper>
      {!!startAdornment && startAdornment}
      <StyledInput placeholder={placeholder} value={value} onChange={onChange} disabled={disable} />
      {!!endAdornment && endAdornment}
    </StyledInputWrapper>
    :
    <StyledInputWrapperDisabled>
    {!!startAdornment && startAdornment}
    <StyledInputDisabled placeholder={placeholder} value={value} onChange={onChange} disabled={disable} />
    {!!endAdornment && endAdornment}
  </StyledInputWrapperDisabled>
    )
  )
}

const StyledInputWrapper = styled.div`
  align-items: center;
  background-color: ${props => props.theme.color.grey[200]};
  border-radius: ${props => props.theme.borderRadius}px;
  display: flex;
  padding: 0 ${props => props.theme.spacing[3]}px;
`

const StyledInputWrapperDisabled = styled.div`
  align-items: center;
  background-color: ${props => props.theme.color.grey[600]};
  border-radius: ${props => props.theme.borderRadius}px;
  display: flex;
  padding: 0 ${props => props.theme.spacing[3]}px;
`

const StyledInput = styled.input`
  background: none;
  border: 0;
  color: ${props => props.theme.color.grey[600]};
  font-size: 18px;
  flex: 1;
  height: 56px;
  margin: 0;
  padding: 0;
  outline: none;
`

const StyledInputDisabled = styled.input`
  background: none;
  border: 0;
  color: ${props => props.theme.color.grey[200]};
  font-size: 18px;
  flex: 1;
  height: 56px;
  margin: 0;
  padding: 0;
  outline: none;
`

export default Input