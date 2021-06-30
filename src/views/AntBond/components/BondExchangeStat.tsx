import React from 'react';
import styled from 'styled-components';
import Card from '../../../components/Card';

interface ExchangeStatProps {
  tokenName: string;
  description: string;
  price: string;
  currencySymbol?: string;
}

const BondExchangeStat: React.FC<ExchangeStatProps> = ({ tokenName, description, price, currencySymbol }) => {
  return (
    <Card>
      <StyledCardContentInner>
        <StyledCardTitle>{`💰 ${tokenName} = ${currencySymbol ? currencySymbol : ''}${price}`}</StyledCardTitle>
        <StyledDesc>{description}</StyledDesc>
      </StyledCardContentInner>
    </Card>
  );
};

const StyledCardTitle = styled.div`
  color: ${(props) => props.theme.color.grey[200]};
  font-size: 20px;
  font-weight: 700;
  margin-bottom: ${(props) => props.theme.spacing[2]}px;
`;

const StyledDesc = styled.span`
  color: ${(props) => props.theme.color.grey[300]};
  font-size: 14px;
  text-align: center;
`;

const StyledCardContentInner = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing[2]}px;
`;

export default BondExchangeStat;
