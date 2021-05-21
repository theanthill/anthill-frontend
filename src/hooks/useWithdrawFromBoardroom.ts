import { useCallback } from 'react';
import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import { useTransactionAdder } from '../state/transactions/hooks';
import { BigNumber } from 'ethers';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useWithdrawFromBoardroom = () => {
  const antToken = useAntToken();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleWithdraw = useCallback(
    (amount: string) => {
      handleTransactionReceipt(
        antToken.withdrawAntShareFromBoardroom(amount),
        `Withdraw ${amount} ANTS from the boardroom`,
      );
    },
    [antToken],
  );
  return { onWithdraw: handleWithdraw };
};

export default useWithdrawFromBoardroom;
