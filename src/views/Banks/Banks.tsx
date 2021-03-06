import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import Page from '../../components/Page';
import PageHeader from '../../components/PageHeader';
import Bank from '../Bank';
import BankCards from './BankCards';
import { useWallet } from '@binance-chain/bsc-use-wallet';
import Button from '../../components/Button';
import styled from 'styled-components';
import { tokens } from '../../config';

const Banks: React.FC = () => {
  const { path } = useRouteMatch();
  const { account, connect } = useWallet();

  return (
    <Switch>
      <Page>
        <Route exact path={path}>
          <PageHeader
            title="Pick a Liquidity Pool."
            subtitle={`Add liquidity to a pair of your liking and earn ${tokens.AntToken.inlineName} in the process!`}
          />

          {!!account ? (
            <BankCards />
          ) : '' }

          { !account ? (
            <Center>
              <Button onClick={() => connect('injected')} text="Unlock Wallet" />
            </Center>
          ) : '' }

        </Route>
        <Route path={`${path}/:bankId`}>
          <Bank />
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

export default Banks;
