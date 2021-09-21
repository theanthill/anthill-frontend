import { useCallback, useEffect, useState } from 'react';
import useAntToken from './useAntToken';
import config from '../config';

const useAntBondExchangeRate = () => {
  const [price, setPrice] = useState<number>(0);
  const antToken = useAntToken();

  const fetchAntTokenPrice = useCallback(async () => {
    setPrice(await antToken.getAntBondExchangeRate());
  }, [antToken]);

  useEffect(() => {
    if (antToken) {
      fetchAntTokenPrice().catch((err) =>
        console.error(`Failed to fetch ANT price: ${err.stack}`),
      );
      const refreshInterval = setInterval(fetchAntTokenPrice, config.refreshInterval);
      return () => clearInterval(refreshInterval);
    }
  }, [setPrice, fetchAntTokenPrice, antToken]);

  return price;
};

export default useAntBondExchangeRate;
