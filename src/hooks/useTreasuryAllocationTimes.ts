import { useEffect, useState } from 'react';
import useAntToken from './useAntToken';
import { TreasuryAllocationTime } from '../anthill/types';

const useTreasuryAllocationTimes = () => {
  const [time, setTime] = useState<TreasuryAllocationTime>({
    prevAllocation: new Date(),
    nextAllocation: new Date(),
  });
  const antToken = useAntToken();

  useEffect(() => {
    if (antToken) {
      antToken.getTreasuryNextAllocationTime().then(setTime);
    }
  }, [antToken]);
  return time;
};

export default useTreasuryAllocationTimes;
