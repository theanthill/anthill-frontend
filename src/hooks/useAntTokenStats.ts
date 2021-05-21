import { useCallback, useEffect, useState } from 'react';
import useAntToken from './useAntToken';
import { TokenStat } from '../anthill/types';
import config from '../config';

const useAntTokenStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const antToken = useAntToken();

  const fetchAntTokenPrice = useCallback(async () => {
    setStat(await antToken.getAntTokenStatFromPancakeSwap());
  }, [antToken]);

  useEffect(() => {
    fetchAntTokenPrice().catch((err) => console.error(`Failed to fetch ANT price: ${err.stack}`));
    const refreshInterval = setInterval(fetchAntTokenPrice, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setStat, antToken]);

  return stat;
};

export default useAntTokenStats;
