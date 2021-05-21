import { useCallback } from 'react';
import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';

const useWithdraw = (bank: Bank) => {
  const antToken = useAntToken();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleWithdraw = useCallback(
    (amount: string) => {
      const amountBn = parseUnits(amount, bank.depositToken.decimal);
      handleTransactionReceipt(
        antToken.unstake(bank.contract, amountBn),
        `Withdraw ${amount} ${bank.depositTokenName} from ${bank.contract}`,
      );
    },
    [bank, antToken],
  );
  return { onWithdraw: handleWithdraw };
};

export default useWithdraw;
