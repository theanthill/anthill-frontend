import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import { parseUnits, formatUnits } from 'ethers/lib/utils';

import Button from '../../../components/Button';
import Card from '../../../components/Card';
import CardIcon from '../../../components/CardIcon';
import CardContent from '../../../components/CardContent';
import TokenSymbol from '../../../components/TokenSymbol';
import useApprove, { ApprovalState } from '../../../hooks/useApprove';
import useCalculateSwap from '../../../hooks/useCalculateSwap'

import { Bank, } from '../../../anthill';
import useAntToken from '../../../hooks/useAntToken';
import TokenExchangeInput from '../../../components/TokenExchangeInput';
import TokenExchangeValue from '../../../components/TokenExchangeValue';
import useSwapTokens from '../../../hooks/useSwapTokens';
import { getDisplayBalance } from '../../../utils/formatBalance';

interface SwapTokensProps {
  bank: Bank;
}

const ExchangeBonds: React.FC<SwapTokensProps> = ({ bank }) => {
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
    {
      setAmountIn(null);
    }
    
  }, [bank])

  const handleChangeSwapDirection = useCallback(() => {
    setToken0In(!token0In)
  }, [setToken0In, token0In])
  
  const handleSwapTokens = useCallback(() => {
    onSwapTokens(token0In, amountIn, amountOut);
  }, [token0In, amountIn, amountOut, onSwapTokens])

  const providerFee = amountIn?.mul(2).div(1000);

  return (
      <Card>
        <CardContent>
          <StyledCardContentInner>
              <CardIcon>
                <TokenSymbol symbol={token0In ? bank.token0.symbol : bank.token1.symbol} size={54} /><Arrow>➔</Arrow><TokenSymbol symbol={token0In ? bank.token1.symbol : bank.token0.symbol} size={54} />
              </CardIcon>
              {(
                  token0In ?
                  <StyledCardHeader>
                    <Button size="sm" text={`${bank.token0.symbol} ➔ ${bank.token1.symbol}`} onClick={handleChangeSwapDirection}/>
                    <TokenExchangeInput
                      token={bank.token0}
                      tokenName={bank.token0Name}
                      onChange={handleTokenChange}
                    />
                    <TokenExchangeValue
                      token={bank.token1}
                      tokenName={bank.token1Name}
                      value={amountOut ? formatUnits(amountOut) : ''}
                    />
                    <StyledMaxText>
                      {( providerFee ? `Service fee: ${getDisplayBalance(providerFee, 18, 6)} ${bank.token0Name}` : ``)}
                    </StyledMaxText>
                  </StyledCardHeader>
                  :
                  <StyledCardHeader>
                    <Button size="sm" text={`${bank.token1.symbol} ➔ ${bank.token0.symbol}`} onClick={handleChangeSwapDirection}/>
                    <TokenExchangeInput
                      token={bank.token1}
                      tokenName={bank.token1Name}
                      onChange={handleTokenChange}
                    />
                    <TokenExchangeValue
                      token={bank.token0}
                      tokenName={bank.token0Name}
                      value={amountOut ? formatUnits(amountOut) : ''}
                    />
                    <StyledMaxText>
                      {( providerFee ? `Service fee: ${getDisplayBalance(providerFee, 18, 6)} ${bank.token1Name}` : ``)}
                    </StyledMaxText>
                  </StyledCardHeader>
              )}
              {(
                  // Approval buttons
                  <StyledContent>
                    <StyledActionSpacer />
                    {(token0In ?                     
                        (approveStatusToken0 !== ApprovalState.APPROVED ?
                          <StyledApproveButton>
                            <Button
                              disabled={
                                approveStatusToken0 === ApprovalState.PENDING ||
                                approveStatusToken0 === ApprovalState.UNKNOWN
                              }
                              onClick={approveToken0}
                              text={`Approve ${bank.token0.symbol}`}
                            />
                          </StyledApproveButton>

                        :
                          <Button text="Swap" onClick={handleSwapTokens} disabled={!amountIn || amountIn?.isZero()}/>
                        )
                      :
                      (approveStatusToken1 !== ApprovalState.APPROVED ?
                        <StyledApproveButton>
                          <Button
                            disabled={
                              approveStatusToken1 === ApprovalState.PENDING ||
                              approveStatusToken1 === ApprovalState.UNKNOWN
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

const Arrow = styled.div`
  color: #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  justify-content: center;
`;

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

const StyledInfoButton = styled.div`
  margin-left: auto; 
  margin-right: 0;
`;

const StyledMaxText = styled.div`
  align-items: center;
  color: ${props => props.theme.color.grey[400]};
  display: flex;
  font-size: 12px;
  font-weight: 700;
  height: 44px;
  justify-content: flex-end;
`


export default ExchangeBonds;
