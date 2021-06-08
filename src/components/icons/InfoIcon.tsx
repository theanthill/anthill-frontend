import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'

import Icon, { IconProps } from '../Icon'
import InfoImage from '../../assets/img/info_icon.png'

interface InfoIconProps {
    size?: string,
  }

const InfoIcon: React.FC<InfoIconProps> = ({ size }) => {
  return (
    <Icon>
      <img src={InfoImage} width={size} height={size}/>
    </Icon>
  )
}

export default InfoIcon