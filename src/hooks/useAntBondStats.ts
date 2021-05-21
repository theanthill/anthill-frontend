import { useCallback, useEffect, useState } from 'react';
import useAntToken from './useAntToken';
import { TokenStat } from '../anthill/types';
import config from '../config';

const useAntBondStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const antToken = useAntToken();

  const fetchAntBondPrice = useCallback(async () => {
    setStat(await antToken.getAntBondStat());
  }, [antToken]);

  useEffect(() => {
    fetchAntBondPrice().catch((err) => console.error(`Failed to fetch ANTB price: ${err.stack}`));
    const refreshInterval = setInterval(fetchAntBondPrice, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setStat, antToken]);

  return stat;
};

export default useAntBondStats;
