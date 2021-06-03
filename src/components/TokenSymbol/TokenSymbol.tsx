import React from 'react';
import styled from 'styled-components';

import antLogo from '../../assets/img/ant-token.png';
import antsLogo from '../../assets/img/ant-share.png';
import antbLogo from '../../assets/img/ant-bond.png';
import BUSDLogo from '../../assets/img/BUSD.png';
import BNBLogo from '../../assets/img/BNB.png';
import DSDLogo from '../../assets/img/DSD.png';
import ESDLogo from '../../assets/img/ESD.png';
import BACLogo from '../../assets/img/BAC.png';
import SXAULogo from '../../assets/img/SXAU.png';
import BUILDETHLogo from '../../assets/img/BUILDETH.png';

const logosBySymbol: {[title: string]: string} = {
  'ANT': antLogo,
  'ANTB': antbLogo,
  'ANTS': antsLogo,
  'BUSD': BUSDLogo,
  'BNB' : BNBLogo,
  'DSD': DSDLogo,
  'ESD': ESDLogo,
  'BAC': BACLogo,
  'SXAU': SXAULogo,
  'BUILD-ETH': BUILDETHLogo,
  'ANT-BUSD': antLogo,
  'ANT-BNB': antLogo,
  'ANTS-BUSD': antsLogo,
};

type AntTokenLogoProps = {
  symbol: string;
  size?: number;
}

const LogoWrapper = styled.div`
  text-align: center;
`;

const TokenSymbol: React.FC<AntTokenLogoProps> = ({ symbol, size = 64 }) => {
  if (!logosBySymbol[symbol]) {
    throw new Error(`Invalid AntTokenLogo symbol: ${symbol}`);
  }
  return (
    <LogoWrapper>
      <img
        src={logosBySymbol[symbol]}
        alt={`${symbol} Logo`}
        width={size}
        height={size}
      />
    </LogoWrapper>
  )
};

export default TokenSymbol;
