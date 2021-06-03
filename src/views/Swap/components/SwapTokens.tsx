import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import { parseUnits, formatUnits } from 'ethers/lib/utils';

import Button from '../../../components/Button';
import Card from '../../../components/Card';
import CardContent from '../../../components/CardContent';
import useApprove, { ApprovalState } from '../../../hooks/useApprove';
import useCalculateSwap from '../../../hooks/useCalculateSwap'

import { Bank, } from '../../../anthill';
import useAntToken from '../../../hooks/useAntToken';
import TokenSwapInput from './TokenSwapInput'
import TokenSwapValue from './TokenSwapValue';
import useSwapTokens from '../../../hooks/useSwapTokens';


interface SwapTokensProps {
  bank: Bank;
}

const SwapTokens: React.FC<SwapTokensProps> = ({ bank }) => {
  const [amountIn, setAmountIn] = useState<BigNumber>(null);
  const [token0In, setToken0In] = useState<boolean>(true);
  const antToken = useAntToken();
  const {onSwapTokens} = useSwapTokens(bank);

  const [approveStatusToken0, approveToken0] = useApprove(antToken.tokens[bank.token0.symbol], antToken.contracts.PancakeRouter.address);
  const [approveStatusToken1, approveToken1] = useApprove(antToken.tokens[bank.token1.symbol], antToken.contracts.PancakeRouter.address);
  
  const amountOut = useCalculateSwap(bank, token0In, amountIn);

  const handleTokenChange = useCallback((amount: string) => {
    try{
      const amountIn = parseUnits(amount, bank.token0.decimal);
      setAmountIn(amountIn);
    }
    catch(err)
    {}
    
  }, [token0In])

  const handleChangeSwapDirection = useCallback(() => {
    setToken0In(!token0In)
  }, [setToken0In, token0In])
  
  const handleSwapTokens = useCallback(() => {
    onSwapTokens(token0In, amountIn, amountOut);
  }, [token0In, amountIn, amountOut])

  return (
      <Card>
        <CardContent>
          <StyledCardContentInner>
              {(
                  token0In ?
                  <StyledCardHeader>
                    <Button size="sm" text={`${bank.token0.symbol} ➔ ${bank.token1.symbol}`} onClick={handleChangeSwapDirection}/>
                    <TokenSwapInput
                      token={bank.token0}
                      tokenName={bank.token0Name}
                      onChange={handleTokenChange}
                    />
                    <TokenSwapValue
                      token={bank.token1}
                      tokenName={bank.token1Name}
                      value={amountOut ? formatUnits(amountOut) : ''}
                    />
                  </StyledCardHeader>
                  :
                  <StyledCardHeader>
                    <Button size="sm" text={`${bank.token1.symbol} ➔ ${bank.token0.symbol}`} onClick={handleChangeSwapDirection}/>
                    <TokenSwapInput
                      token={bank.token1}
                      tokenName={bank.token1Name}
                      onChange={handleTokenChange}
                    />
                    <TokenSwapValue
                      token={bank.token0}
                      tokenName={bank.token0Name}
                      value={amountOut ? formatUnits(amountOut) : ''}
                    />
                  </StyledCardHeader>
              )}
              {
               (
                  // Approval buttons
                  <StyledContent>
                    <StyledActionSpacer />
                    {(token0In ?                     
                        (approveStatusToken0 != ApprovalState.APPROVED ?
                          <StyledApproveButton>
                            <Button
                              disabled={
                                approveStatusToken0 == ApprovalState.PENDING ||
                                approveStatusToken0 == ApprovalState.UNKNOWN
                              }
                              onClick={approveToken0}
                              text={`Approve ${bank.token0.symbol}`}
                            />
                          </StyledApproveButton>

                        :
                          <Button text="Swap" onClick={handleSwapTokens} disabled={!amountIn || amountIn?.isZero()}/>
                        )
                      :
                      (approveStatusToken1 != ApprovalState.APPROVED ?
                        <StyledApproveButton>
                          <Button
                            disabled={
                              approveStatusToken1 == ApprovalState.PENDING ||
                              approveStatusToken1 == ApprovalState.UNKNOWN
                            }
                            onClick={approveToken1}
                            text={`Approve ${bank.token1.symbol}`}
                          />
                        </StyledApproveButton>
                      :
                        <Button text="Swap" onClick={handleSwapTokens}  disabled={!amountIn || amountIn?.isZero()}/>
                      )
                    )}
                  </StyledContent>
                )
              }
          </StyledCardContentInner>
        </CardContent>
      </Card>
    );
}

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledActionSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`;

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledApproveButton = styled.div`
  display: block;
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;

export default SwapTokens;
