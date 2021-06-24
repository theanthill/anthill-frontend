import { useCallback } from 'react';
import useAntToken from './useAntToken';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

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
    [antToken, handleTransactionReceipt],
  );
  return { onAllocateSeigniorage: handleAllocateSeigniorage };
};

export default useAllocateSeigniorage;
