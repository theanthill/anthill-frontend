import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useAntToken from './useAntToken';
import config from '../config';

const useTreasuryAmount = () => {
  const [amount, setAmount] = useState(BigNumber.from(0));
  const antToken = useAntToken();

  const fetchTreasuryAmount = useCallback(async () => {
    const { Treasury } = antToken.contracts;
    antToken.tokens.ANT.balanceOf(Treasury.address).then(setAmount);
  }, [antToken]);
  
  useEffect(() => {
    if (antToken) {
      fetchTreasuryAmount().catch((err) => console.error(`Failed to fetch treasury amount: ${err.stack}`));
      const refreshInterval = setInterval(fetchTreasuryAmount, config.refreshInterval);
      return () => clearInterval(refreshInterval);
    }
  }, [antToken, fetchTreasuryAmount]);
  return amount;
};

export default useTreasuryAmount;
