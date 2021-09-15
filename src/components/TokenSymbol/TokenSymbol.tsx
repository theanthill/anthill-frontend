import React from 'react';
import styled from 'styled-components';

import antLogo from '../../assets/img/ant-token.png';
import antsLogo from '../../assets/img/ant-share.png';
import antbLogo from '../../assets/img/ant-bond.png';
import USDCLogo from '../../assets/img/USDC.png';
import ETHLogo from '../../assets/img/ETH.png';

const logosBySymbol: {[title: string]: string} = {
  'ANT': antLogo,
  'ANTB': antbLogo,
  'ANTS': antsLogo,
  'USDC': USDCLogo,
  'ETH' : ETHLogo,
  'AntToken-USDC': antLogo,
  'AntToken-BNB': antLogo,
  'AntToken-ETH': antLogo,
  'ANTS-USDC': antsLogo,
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
