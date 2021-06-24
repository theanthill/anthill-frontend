import { useCallback } from 'react';
import useAntToken from './useAntToken';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';

const useChangeDollarPrice = () => {
  const antToken = useAntToken();

  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleChangeDollarPrice = useCallback(
    (amount: string) => {
      const amountBn = parseUnits(amount);
      handleTransactionReceipt(
        antToken.changeDollarPrice(amountBn),
        `Change Ant Token dollar price to ${amount}`,
      );
    },
    [antToken, handleTransactionReceipt],
  );
  return { onChangeDollarPrice: handleChangeDollarPrice };
};

export default useChangeDollarPrice;
