import React from 'react'

import Icon from '../Icon'
import InfoImage from '../../assets/img/info_icon.png'

interface InfoIconProps {
    size?: string,
  }

const InfoIcon: React.FC<InfoIconProps> = ({ size }) => {
  return (
    <Icon>
      <img src={InfoImage} alt="" width={size} height={size}/>
    </Icon>
  )
}

export default InfoIcon