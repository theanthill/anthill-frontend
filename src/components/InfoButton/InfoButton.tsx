import React, { useContext, useMemo } from 'react'
import { ThemeContext } from 'styled-components'
import IconButton from '../IconButton'
import { InfoIcon } from '../icons'

interface InfoButtonProps {
  onClick?: () => void,
  size?: string
}

const InfoButton: React.FC<InfoButtonProps> = ({
  onClick,
  size
}) => {
  const { color, spacing } = useContext(ThemeContext)

  return (
    <IconButton onClick={onClick} size={size}>
      <InfoIcon size={size}/>
    </IconButton>
  )
}

export default InfoButton