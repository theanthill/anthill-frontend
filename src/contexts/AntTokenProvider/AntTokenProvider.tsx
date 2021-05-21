import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from '@binance-chain/bsc-use-wallet';
import AntToken from '../../anthill';
import config from '../../config';

export interface AntTokenContext {
  antToken?: AntToken;
}

export const Context = createContext<AntTokenContext>({ antToken: null });

export const AntTokenProvider: React.FC = ({ children }) => {
  const { ethereum, account } = useWallet();
  const [antToken, setAntToken] = useState<AntToken>();

  useEffect(() => {
    if (!antToken) {
      const ant = new AntToken(config);
      if (account) {
        // wallet was unlocked at initialization
        ant.unlockWallet(ethereum, account);
      }
      setAntToken(ant);
    } else if (account) {
      antToken.unlockWallet(ethereum, account);
    }
  }, [account]);

  return <Context.Provider value={{ antToken }}>{children}</Context.Provider>;
};
