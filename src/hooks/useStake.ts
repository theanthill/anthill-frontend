import { useCallback } from 'react';
import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';

const useStake = (bank: Bank) => {
  const antToken = useAntToken();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleStake = useCallback(
    (amount: string) => {
      const amountBn = parseUnits(amount, bank.depositToken.decimal);
      handleTransactionReceipt(
        antToken.stake(bank.contract, amountBn),
        `Stake ${amount} ${bank.token0Name}-${bank.token1Name} to ${bank.contract}`,
      );
    },
    [bank, antToken],
  );
  return { onStake: handleStake };
};

export default useStake;
