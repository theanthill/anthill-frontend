import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Page from '../../components/Page';
import PageHeader from '../../components/PageHeader';
import Swap from '../Swap';
import SwapCards from './SwapCards';
import { useWallet } from '@binance-chain/bsc-use-wallet';
import Button from '../../components/Button';
import styled from 'styled-components';
import { tokens } from '../../config';

const Swaps: React.FC = () => {
  const { path } = useRouteMatch();
  const { account, connect } = useWallet();
  
  return (
    <Switch>
      <Page>
        <Route exact path={path}>
          <PageHeader
            title="Pick a Swap."
            subtitle={`Exchange ${tokens.AntToken.inlineName} for other cryptocurrencies and viceversa`}
          />

          {!!account ? (
            <SwapCards />
          ) : '' }

          { !account ? (
            <Center>
              <Button onClick={() => connect('injected')} text="Unlock Wallet" />
            </Center>
          ) : '' }

        </Route>
        <Route path={`${path}/:bankId`}>
          <Swap />
        </Route>
      </Page>
    </Switch>
  );
};

const Center = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export default Swaps;
