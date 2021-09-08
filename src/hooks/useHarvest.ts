import { useCallback } from 'react';
import useAntToken from './useAntToken';
import { Bank } from '../anthill';

const useExitAndClaim = (bank: Bank) => {
  const antToken = useAntToken();

  const handleExitAndClaim = useCallback(() => {
    antToken.exitAndRemoveLiquidity(bank, deadline());
  }, [bank, antToken]);

  return { onExitAndClaim: handleExitAndClaim };
};

function deadline() {
  // 30 minutes
  return Math.floor(new Date().getTime() / 1000) + 1800;
}

export default useExitAndClaim;
