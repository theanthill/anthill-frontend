import { useCallback } from 'react';
import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';

const useAllocateSeigniorage = () => {
  const antToken = useAntToken();

  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleAllocateSeigniorage = useCallback(
    () => {
      handleTransactionReceipt(
        antToken.allocateSeigniorage(),
        `Triggering seigniorage`,
      );
    },
    [antToken],
  );
  return { onAllocateSeigniorage: handleAllocateSeigniorage };
};

export default useAllocateSeigniorage;
