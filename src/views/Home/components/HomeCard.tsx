import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';
import Label from '../../../components/Label';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import TokenSymbol from '../../../components/TokenSymbol';
import { commify } from 'ethers/lib/utils';
import config from '../../../config';

interface HomeCardProps {
  title: string;
  symbol: string;
  color: string;
  supplyLabel?: string;
  address: string;
  priceInBUSDLastEpoch?: string;
  priceTextLastEpoch?: string;
  priceInBUSDRealTime?: string;
  priceTextRealTime?: string;
  totalSupply?: string;
  showSimplified?: boolean;
}

const HomeCard: React.FC<HomeCardProps> = ({
  title,
  symbol,
  color,
  address,
  supplyLabel = 'Total Supply',
  priceInBUSDLastEpoch,
  priceInBUSDRealTime,
  totalSupply,
  priceTextLastEpoch,
  priceTextRealTime,
  showSimplified
}) => {
  const tokenUrl = `${config.bscscanUrl}/token/${address}`;
  return (
    <Wrapper>
      <CardHeader>{title}</CardHeader>
      <StyledCards>
        <TokenSymbol symbol={symbol} />
        {priceInBUSDRealTime ? (
            <CardSection>
              <StyledValue>{priceInBUSDRealTime}</StyledValue>
              <Label text={priceTextRealTime} color={color} />
            </CardSection>
          ) : (
            <CardSection>
              {!showSimplified && <ValueSkeleton />}
              {!showSimplified && <Label text={priceTextRealTime} color={color} />}
            </CardSection>
          )} 
        {priceInBUSDLastEpoch ? (
            <CardSection>
              <StyledValue>{priceInBUSDLastEpoch}</StyledValue>
              <Label text={priceTextLastEpoch} color={color} />
            </CardSection>
          ) : (
            <CardSection>
              {!showSimplified && <ValueSkeleton />}
              {!showSimplified && <Label text={priceTextLastEpoch} color={color} />}
            </CardSection>
          )}          
 
        <CardSection>
          {totalSupply ? <StyledValue>{commify(totalSupply)}</StyledValue> : <ValueSkeleton />}
          <StyledSupplyLabel href={tokenUrl} target="_blank" color={color}>
            {supplyLabel}
          </StyledSupplyLabel>
        </CardSection>
      </StyledCards>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  @media (max-width: 768px) {
    margin-top: ${(props) => props.theme.spacing[4]}px;
  }
`;

const CardHeader = styled.h2`
  color: #fff;
  text-align: center;
`;

const StyledCards = styled.div`
  min-width: 300px;
  padding: ${(props) => props.theme.spacing[3]}px;
  color: ${(props) => props.theme.color.white};
  background-color: ${(props) => props.theme.color.grey[900]};
  border-radius: 5px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledValue = styled.span`
  display: inline-block;
  font-size: 36px;
  color: #eeeeee;
`;

const CardSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing[4]}px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ValueSkeletonPadding = styled.div`
  padding-top: ${(props) => props.theme.spacing[3]}px;
  padding-bottom: ${(props) => props.theme.spacing[2]}px;
`;

const StyledSupplyLabel = styled.a`
  display: block;
  color: ${(props) => props.color};
`;

const ValueSkeleton = () => {
  const theme = useContext(ThemeContext);
  return (
    <SkeletonTheme color={theme.color.grey[700]} highlightColor={theme.color.grey[600]}>
      <ValueSkeletonPadding>
        <Skeleton height={10} />
      </ValueSkeletonPadding>
    </SkeletonTheme>
  );
};

export default HomeCard;
