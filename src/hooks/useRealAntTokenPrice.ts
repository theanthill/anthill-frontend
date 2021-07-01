import { useCallback, useEffect, useState } from 'react';
import useAntToken from './useAntToken';
import config from '../config';

const useRealAntTokenPrice = () => {
  const [price, setPrice] = useState<number>(0);
  const antToken = useAntToken();

  const fetchAntTokenPrice = useCallback(async () => {
    setPrice(await antToken.getAntTokenTargetPrice());
  }, [antToken]);

  useEffect(() => {
    if (antToken) {
      fetchAntTokenPrice().catch((err) => console.error(`Failed to fetch real antToken price: ${err.stack}`));
      const refreshInterval = setInterval(fetchAntTokenPrice, config.refreshInterval);
      return () => clearInterval(refreshInterval);
    }
  }, [setPrice, antToken, fetchAntTokenPrice]);

  return price;
};

export default useRealAntTokenPrice;
