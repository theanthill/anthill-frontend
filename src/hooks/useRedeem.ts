import { useCallback } from 'react';
import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeem = (bank: Bank) => {
  const antToken = useAntToken();

  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    handleTransactionReceipt(antToken.settleWithdraw(bank.providerHelperName), `Claim & Withdraw ${bank.contract}`);
  }, [bank, antToken, handleTransactionReceipt]);

  return { onRedeem: handleRedeem };
};

export default useRedeem;
