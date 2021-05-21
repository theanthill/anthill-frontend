import { useCallback } from 'react';

import useAntToken from './useAntToken';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useFaucet = () => {
  const antToken = useAntToken();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleGetFreeTokens = useCallback(
    () => {  
        handleTransactionReceipt(
            antToken.getFreeTokens(),
            `Refilling tokens from faucet`,
        );
    },
    [antToken],
  );
  return { onGetFreeTokens: handleGetFreeTokens };
};

export default useFaucet;
