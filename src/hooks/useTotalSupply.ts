import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useAntToken from './useAntToken';
import ERC20 from '../anthill/ERC20';

const useTotalSupply = (token: ERC20) => {
  const [amount, setAmount] = useState(BigNumber.from(0));

  useEffect(() => {
    if (token) {
      token.totalSupply().then(setAmount);
    }
  }, [token]);
  return amount;
};

export default useTotalSupply;
