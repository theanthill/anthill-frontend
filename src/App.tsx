import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import {
  BscConnector,
  UserRejectedRequestError,
} from '@binance-chain/bsc-connector'
import {
  ConnectionRejectedError,
  useWallet,
  UseWalletProvider,
} from '@binance-chain/bsc-use-wallet'
import { ChainId } from '@pancakeswap-libs/sdk';

import BanksProvider from './contexts/Banks';
import AntTokenProvider from './contexts/AntTokenProvider';
import ModalsProvider from './contexts/Modals';

import Home from './views/Home';
import Banks from './views/Banks';
import Swaps from './views/Swaps';
import AntBond from './views/AntBond';
import Boardroom from './views/Boardroom';
import Help from './views/Help';

import store from './state';
import theme from './theme';
import config from './config';
import Updaters from './state/Updaters';
import Popups from './components/Popups';

const App: React.FC = () => {
  return (
    <Providers>
      <Router>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/bank">
            <Banks />
          </Route>
          <Route path="/swap">
            <Swaps />
          </Route>
          <Route path="/bonds">
            <AntBond />
          </Route>
          <Route path="/boardroom">
            <Boardroom />
          </Route>
          <Route path="/docs">
          </Route>
          <Route path="/help">
            <Help />
          </Route>
        </Switch>
      </Router>
    </Providers>
  );
};

const Providers: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <UseWalletProvider 
      chainId={config.chainId} 
      connectors={{
        bsc: {
          web3ReactConnector() {
            return new BscConnector({ supportedChainIds: [ChainId.MAINNET, ChainId.BSCTESTNET] })
          },
          handleActivationError(err: any) {
            if (err instanceof UserRejectedRequestError) {
              return new ConnectionRejectedError()
            }
    }}
    }}
      >
        <Provider store={store}>
          <Updaters />
          <AntTokenProvider>
            <ModalsProvider>
              <BanksProvider>
                <>
                  <Popups />
                  {children}
                </>
              </BanksProvider>
            </ModalsProvider>
          </AntTokenProvider>
        </Provider>
      </UseWalletProvider>
    </ThemeProvider>
  );
};

export default App;
