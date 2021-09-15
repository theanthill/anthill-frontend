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
  const antUnlocked = ant?.isUnlocked;

  const [{ antToken, antBond }, setStats] = useState<OverviewData>({});
  const fetchStats = useCallback(async () => {
    const [antToken, antBond] = await Promise.all([
      ant.getAntTokenStat(),
      ant.getAntBondStat(),
    ]);
    if (Date.now() < config.antBondLaunchesAt.getTime() || parseFloat(antBond.priceInUSDCLastEpoch) < 1 ) {
      antBond.priceInUSDCLastEpoch = '-';
      antBond.priceInUSDCRealTime = '-';
    }
    setStats({ antToken, antBond });
  }, [ant, setStats]);

  useEffect(() => {
    if (antUnlocked) {
      fetchStats().catch((err) => console.error(err.stack));
    }
  }, [antUnlocked, fetchStats]);

  const antTokenAddr = useMemo(() => ant?.tokens.ANT.address, [ant]);
  const antBondAddr = useMemo(() => ant?.tokens.ANTB.address, [ant]);

  return (
    <Page>
      <PageHeader
        subtitle={ `Testnet Only!! Welcome to the Anthill Tokenomy Open Beta` }
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
            priceInUSDCRealTime={'$' + antToken?.priceInUSDCRealTime}
            priceTextRealTime='Latest price'
            priceInUSDCLastEpoch={'$' + antToken?.priceInUSDCLastEpoch}
            priceTextLastEpoch='Average price (TWAP)'
            totalSupply={antToken?.totalSupply}            
            showSimplified={true}
          />
          <Spacer size="lg" />
          <HomeCard
            title={tokens['AntBond'].titleName}
            symbol={tokens['AntBond'].symbol}
            color={tokens['AntBond'].color}
            address={antBondAddr}
            priceInUSDCLastEpoch={ antBond?.priceInUSDCLastEpoch }
            totalSupply={ antBond?.totalSupply }
            priceTextLastEpoch="Ant Bond per Ant Token"
            showSimplified={true}
          />
        </CardWrapper>
      ]}
    </Page>
  );
};

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

export default Home;
