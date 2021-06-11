import { useCallback } from 'react';
import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeem = (bank: Bank) => {
  const antToken = useAntToken();

  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    handleTransactionReceipt(antToken.settleWithdraw(bank.providerHelperName), `Claim & Withdraw ${bank.contract}`);
  }, [bank, antToken]);

  return { onRedeem: handleRedeem };
};

function deadline()
{
    // 30 minutes
    return Math.floor(new Date().getTime() / 1000) + 1800;
}

export default useRedeem;
