import { useCallback, useEffect, useState } from 'react';
import useAntToken from './useAntToken';
import config from '../config';
import { BigNumber } from 'ethers';

const useAntBondExchangeRate = () => {
  const [price, setPrice] = useState<BigNumber>(BigNumber.from(0));
  const antToken = useAntToken();

  const fetchAntTokenPrice = useCallback(async () => {
    setPrice(await antToken.getAntBondExchangeRate());
  }, [antToken]);

  useEffect(() => {
    fetchAntTokenPrice().catch((err) => console.error(`Failed to fetch ANT price: ${err.stack}`));
    const refreshInterval = setInterval(fetchAntTokenPrice, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setPrice, fetchAntTokenPrice, antToken]);

  return price;
};

export default useAntBondExchangeRate;
