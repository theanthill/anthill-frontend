import { useCallback } from 'react';
import { formatUnits } from 'ethers/lib/utils';

import useAntToken from './useAntToken';
import { Bank } from '../anthill';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { BigNumber } from '@ethersproject/bignumber';
import { useWallet } from '@binance-chain/bsc-use-wallet';

const useSwapTokens = (bank: Bank) => {
  const antToken = useAntToken();
  const {account} = useWallet();
  
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleSwapTokens = useCallback((token0In: boolean, amountIn: BigNumber, amountOutMin: BigNumber) => {
        var path;
              
        if (token0In) {
            path = [ bank.token0.address, bank.token1.address ];

            handleTransactionReceipt(
                antToken.contracts.PancakeRouter.swapExactTokensForTokens(amountIn, amountOutMin, path, account, deadline()),
                `Swapping ${formatUnits(amountIn)} ${bank.token0Name} for at least ${formatUnits(amountOutMin)} ${bank.token1Name} tokens `);
        } else  {
            path = [ bank.token1.address, bank.token0.address ];

            handleTransactionReceipt(
                antToken.contracts.PancakeRouter.swapExactTokensForTokens(amountIn, amountOutMin, path, account, deadline()),
                `Swapping ${formatUnits(amountIn)} ${bank.token1Name} for at least ${formatUnits(amountOutMin)} ${bank.token0Name} tokens `);
        }
    },
    [bank, antToken, account],
  );
  return { onSwapTokens: handleSwapTokens };
};

function deadline()
{
    // 30 minutes
    return Math.floor(new Date().getTime() / 1000) + 1800;
}

export default useSwapTokens;
