import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Page from '../../components/Page';
import PageHeader from '../../components/PageHeader';
import LaunchCountdown from '../../components/LaunchCountdown';
import Spacer from '../../components/Spacer';
import HomeCard from './components/HomeCard';
import { OverviewData } from './types';
import useAntToken from '../../hooks/useAntToken';
import config, { tokens } from '../../config';

const Home: React.FC = () => {
  const ant = useAntToken();

  const [{ antToken, antBond, antShare }, setStats] = useState<OverviewData>({});
  const fetchStats = useCallback(async () => {
    const [antToken, antBond, antShare] = await Promise.all([
      ant.getAntTokenStatFromPancakeSwap(),
      ant.getAntBondStat(),
      ant.getAntShareStat(),
    ]);
    if (Date.now() < config.antBondLaunchesAt.getTime() || parseFloat(antBond.priceInBUSD) < 1 ) {
      antBond.priceInBUSD = '-';
    }
    setStats({ antToken, antBond, antShare });
  }, [ant, setStats]);

  useEffect(() => {
    if (ant) {
      fetchStats().catch((err) => console.error(err.stack));
    }
  }, [ant]);

  const antTokenAddr = useMemo(() => ant?.tokens.ANT.address, [ant]);
  const antShareAddr = useMemo(() => ant?.tokens.ANTS.address, [ant]);
  const antBondAddr = useMemo(() => ant?.tokens.ANTB.address, [ant]);

  return (
    <Page>
      <PageHeader
        subtitle={ `Testnet Only! This is an alpha test on how to buy, sell, and provide liquidity for ${tokens.AntToken.inlineName} on PancakeSwap` }
        title="The Anthill Testnet!"
      />
      { Date.now() / 1000 < 1610596800 ? (
        <LaunchCountdown
          deadline={new Date('2021-01-14T04:00:00Z')}
          description="The Anthill"
          descriptionLink="#"
        />
      ) : [
        <Spacer size="md" key="Spacer" />,
        <CardWrapper key="CardWrapper">
          <HomeCard
            title={tokens['AntToken'].titleName}
            symbol={tokens['AntToken'].symbol}
            color={tokens['AntToken'].color}
            supplyLabel="Circulating Supply"
            address={antTokenAddr}
            priceInBUSD={'$' + antToken?.priceInBUSD}
            totalSupply={antToken?.totalSupply}
            priceText={`${tokens['AntToken'].symbol} Price`}
          />
          <Spacer size="lg" />
          <HomeCard
            title={tokens['AntShare'].titleName}
            symbol={tokens['AntShare'].symbol}
            color={tokens['AntShare'].color}
            address={antShareAddr}
            totalSupply={antShare?.totalSupply}
            priceText="USD price"
            showSimplified={true}
          />
          <Spacer size="lg" />
          <HomeCard
            title={tokens['AntBond'].titleName}
            symbol={tokens['AntBond'].symbol}
            color={tokens['AntBond'].color}
            address={antBondAddr}
            priceInBUSD={ antBond?.priceInBUSD }
            totalSupply={ antBond?.totalSupply }
            priceText="ANTS / ANT"
          />
        </CardWrapper>
      ]}
    </Page>
  );
};

const StyledOverview = styled.div`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const CardWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledNoticeContainer = styled.div`
  max-width: 768px;
  width: 90vw;
`;

const StyledSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`;

const StyledLink = styled.a`
  font-weight: 700;
  text-decoration: none;
  color: ${(props) => props.theme.color.primary.main};
`;

export default Home;
