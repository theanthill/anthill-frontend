import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from '@binance-chain/bsc-use-wallet';
import { AntToken, ILiquidityProvider, CreateLiquidityProvider } from '../../anthill';
import config from '../../config';

export interface AntTokenContext {
  liquidityProvider?: ILiquidityProvider;  
  antToken?: AntToken;
}

export const Context = createContext<AntTokenContext>({ antToken: null });

export const AntTokenProvider: React.FC = ({ children }) => {
  const { ethereum, account } = useWallet();
  const [antToken, setAntToken] = useState<AntToken>();
  const [liquidityProvider, setLiquidityProvider] = useState<ILiquidityProvider>();

  useEffect(() => {
    if (!liquidityProvider) {
      setLiquidityProvider(CreateLiquidityProvider(config));
    }
    if (!antToken && liquidityProvider) {
      const ant = new AntToken(config, liquidityProvider);
      if (account) {
        // wallet was unlocked at initialization
        ant.unlockWallet(ethereum, account);
      }
      setAntToken(ant);
    } else if (account) {
      antToken.unlockWallet(ethereum, account);
    }
  }, [account, antToken, liquidityProvider, ethereum]);

  return <Context.Provider value={{ antToken }}>{children}</Context.Provider>;
};
