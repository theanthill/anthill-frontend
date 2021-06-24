import { useCallback } from 'react';
import useAntToken from './useAntToken';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useStakeToBoardroom = () => {
  const antToken = useAntToken();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleStake = useCallback(
    (amount: string) => {
      handleTransactionReceipt(
        antToken.stakeAntShareToBoardroom(amount),
        `Stake ${amount} ANTS to the boardroom`,
      );
    },
    [antToken, handleTransactionReceipt],
  );
  return { onStake: handleStake };
};

export default useStakeToBoardroom;
