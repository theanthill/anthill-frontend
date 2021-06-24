import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import Button from '../../../components/Button';
import Card from '../../../components/Card';
import CardContent from '../../../components/CardContent';
import CardIcon from '../../../components/CardIcon';

import useApprove, { ApprovalState } from '../../../hooks/useApprove';

import { getBalance } from '../../../utils/formatBalance';

import TokenSymbol from '../../../components/TokenSymbol';
import { Bank } from '../../../anthill';
import useAddLiquidity from '../../../hooks/useAddLiquidity';
import useAntToken from '../../../hooks/useAntToken';
import TokenSwapInput from '../../Swap/components/TokenSwapInput';
import TokenSwapValue from '../../Swap/components/TokenSwapValue';
import useCalculateLiquidity from '../../../hooks/useCalculateLiquidity';
import useTokenBalance from '../../../hooks/useTokenBalance';

interface StakeProps {
  bank: Bank;
}

const AddLiquidity: React.FC<StakeProps> = ({ bank }) => {
  const antToken = useAntToken();
  const [token0In, setToken0In] = useState<boolean>(true);
  const [amountTokenA, setAmountTokenA] = useState<number>(0);
  const amountTokenB = useCalculateLiquidity(bank, token0In, amountTokenA);

  const [approveStatusToken0, approveToken0] = useApprove(antToken.tokens[bank.token0.symbol], antToken.contracts[bank.providerHelperName].address);
  const [approveStatusToken1, approveToken1] = useApprove(antToken.tokens[bank.token1.symbol], antToken.contracts[bank.providerHelperName].address);
  
  const tokenABalance = useTokenBalance(token0In ? bank.token0 : bank.token1);
  const tokenBBalance = useTokenBalance(token0In ? bank.token1 : bank.token0);

  const { onAddLiquidity } = useAddLiquidity(bank);

  const handleAddLiquidity = useCallback(() => 
  {
    if (token0In) {
      onAddLiquidity(amountTokenA, amountTokenB);
    }
    else
    {
      onAddLiquidity(amountTokenB, amountTokenA);
    }
  }, [token0In, amountTokenA, amountTokenB, onAddLiquidity]);

  const handleTokenChange = useCallback((amount: string) => {
    try{
      setAmountTokenA(parseInt(amount) || 0);
    }
    catch(err)
    {
      setAmountTokenA(0);
    }
    
  }, [])
  
  const handleChangeSwapDirection = useCallback(() => {
    setToken0In(!token0In)
  }, [setToken0In, token0In])

  
  return (
      <Card>
        <CardContent>
          <StyledCardContentInner>
            <StyledCardHeader>
              <CardIcon>
                <TokenSymbol symbol={token0In ? bank.token0.symbol : bank.token1.symbol} size={54} /><Plus>+</Plus><TokenSymbol symbol={token0In ? bank.token1.symbol : bank.token0.symbol} size={54} />
              </CardIcon>
              {(
                  token0In ?
                    <StyledInputHeader>
                      <Button size="sm" text={`${bank.token0.symbol} + ${bank.token1.symbol}`} onClick={handleChangeSwapDirection}/>
                      <TokenSwapInput
                        token={bank.token0}
                        tokenName={bank.token0Name}
                        onChange={handleTokenChange}
                      />
                      <TokenSwapValue
                        token={bank.token1}
                        tokenName={bank.token1Name}
                        value={amountTokenB ? amountTokenB.toString() : ''}
                      />
                    </StyledInputHeader>
                    :
                    <StyledInputHeader>
                    <Button size="sm" text={`${bank.token1.symbol} + ${bank.token0.symbol}`} onClick={handleChangeSwapDirection}/>
                    <TokenSwapInput
                      token={bank.token1}
                      tokenName={bank.token1Name}
                      onChange={handleTokenChange}
                    />
                    <TokenSwapValue
                      token={bank.token0}
                      tokenName={bank.token0Name}
                      value={amountTokenB ? amountTokenB.toString() : ''}
                    />
                  </StyledInputHeader>
              )}
            </StyledCardHeader>

              {
                (approveStatusToken0 !== ApprovalState.APPROVED ||
                approveStatusToken1 !== ApprovalState.APPROVED) ? (
                  // Approval buttons
                  <StyledCardActions>
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
                      <StyledActionSpacer/>
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
                  </StyledCardActions>
                ) : (
                  <StyledCardActions>
                    <>
                      <Button
                        disabled={amountTokenA === 0 || amountTokenB === 0 || amountTokenA > getBalance(tokenABalance) || amountTokenB > getBalance(tokenBBalance)}
                        onClick={handleAddLiquidity}
                        text={`Add Liquidity`}
                      />
                    </>

                  </StyledCardActions>
                )
              }
          </StyledCardContentInner>
        </CardContent>
      </Card>
    );
}

const Plus = styled.div`
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

const StyledInputHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: row;
  margin-top: ${(props) => props.theme.spacing[6]}px;
  width: 100%;
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

const StyledApproveButton = styled.div`
  display: block;
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  width: 100%;
`;

export default AddLiquidity;
