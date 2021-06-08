import React from 'react';
import styled from 'styled-components';
import { useWallet } from '@binance-chain/bsc-use-wallet';

import useFaucet from '../../../hooks/useFaucet';
import Button from '../../../components/Button'

interface FaucetButtonProps {}

const FaucetButton: React.FC<FaucetButtonProps> = (props) => {
  const { account } = useWallet();
  const { onGetFreeTokens } = useFaucet();

  return (
    <StyledFaucetButton>
      {!!account &&
        <Button
          onClick={onGetFreeTokens}
          text="Get free ANT!"
        />
    }
    </StyledFaucetButton>
  )
}

const StyledFaucetButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
`;

export default FaucetButton