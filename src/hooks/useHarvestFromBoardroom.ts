import { useCallback } from 'react';
import useAntToken from './useAntToken';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useHarvestFromBoardroom = () => {
  const antToken = useAntToken();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleReward = useCallback(() => {
    handleTransactionReceipt(antToken.harvestAntTokenFromBoardroom(), 'Claim ANT from Boardroom');
  }, [antToken]);

  return { onReward: handleReward };
};

export default useHarvestFromBoardroom;
