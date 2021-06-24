import React from 'react'
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
  return (
    <IconButton onClick={onClick} size={size}>
      <InfoIcon size={size}/>
    </IconButton>
  )
}

export default InfoButton