import React from 'react';
import styled from 'styled-components';
import { useWallet } from '@binance-chain/bsc-use-wallet';

import useAllocateSeigniorage from '../../../hooks/useAllocateSeigniorage';
import Button from '../../Button';

interface AllocateSeigniorageButtonProps {}

const AllocateSeigniorageButton: React.FC<AllocateSeigniorageButtonProps> = (props) => {
  const { account } = useWallet();
  const { onAllocateSeigniorage } = useAllocateSeigniorage();

  return (
    <StyledAllocateSeigniorageButton>
      {!!account &&
        <Button
          onClick={onAllocateSeigniorage}
          size="sm"
          text="Seigniorage"
        />
    }
    </StyledAllocateSeigniorageButton>
  )
}

const StyledAllocateSeigniorageButton = styled.div`
  margin-right: ${(props) => props.theme.spacing[4]}px;
`;
export default AllocateSeigniorageButton