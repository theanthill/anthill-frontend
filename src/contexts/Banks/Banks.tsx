import React, { useCallback, useEffect, useState } from 'react';
import Context from './context';
import useAntToken from '../../hooks/useAntToken';
import { Bank } from '../../anthill';
import config, { bankDefinitions } from '../../config';

const Banks: React.FC = ({ children }) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const antToken = useAntToken();

  const fetchPools = useCallback(async () => {
    const banks: Bank[] = [];

    for (const bankInfo of Object.values(bankDefinitions)) {
      if (bankInfo.finished) {
        if (!antToken.isUnlocked) continue;

        // only show pools staked by user
        const balance = await antToken.stakedBalanceOnBank(bankInfo.contract, antToken.myAccount);
        if (balance.lte(0)) {
          continue;
        }
      }
      banks.push({
        ...bankInfo,
        address: config.deployments[bankInfo.contract].address,
        depositToken: antToken.tokens[bankInfo.depositTokenName],
        token0: antToken.tokens[bankInfo.token0Name],
        token1: antToken.tokens[bankInfo.token1Name],
        earnToken: bankInfo.earnTokenName == 'ANT' ? antToken.tokens.ANT : antToken.tokens.ANTS,
      });
    }
    banks.sort((a, b) => (a.sort > b.sort ? 1 : -1));
    setBanks(banks);
  }, [antToken, antToken?.isUnlocked, setBanks]);

  useEffect(() => {
    if (antToken) {
      fetchPools()
        .catch(err => console.error(`Failed to fetch pools: ${err.stack}`));
    }
  }, [antToken, antToken?.isUnlocked, fetchPools]);

  return <Context.Provider value={{ banks }}>{children}</Context.Provider>;
};

export default Banks;
