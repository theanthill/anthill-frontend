import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useAntToken from './useAntToken';

const useTreasuryAmount = () => {
  const [amount, setAmount] = useState(BigNumber.from(0));
  const antToken = useAntToken();


  useEffect(() => {
    if (antToken) {
      const { Treasury } = antToken.contracts;
      antToken.tokens.ANT.balanceOf(Treasury.address).then(setAmount);
    }
  }, [antToken]);
  return amount;
};

export default useTreasuryAmount;
