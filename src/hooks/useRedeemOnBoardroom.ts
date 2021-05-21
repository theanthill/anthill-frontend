import { useCallback } from 'react';
import useAntToken from './useAntToken';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeemOnBoardroom = (description?: string) => {
  const antToken = useAntToken();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    const alertDesc = description || 'Redeem ANTS from Boardroom';
    handleTransactionReceipt(antToken.exitFromBoardroom(), alertDesc);
  }, [antToken]);
  return { onRedeem: handleRedeem };
};

export default useRedeemOnBoardroom;
