import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import Button from '../../../components/Button';
import Card from '../../../components/Card';
import CardContent from '../../../components/CardContent';
import CardIcon from '../../../components/CardIcon';

import useApprove, { ApprovalState } from '../../../hooks/useApprove';

import { getBalance, getDisplayBalance } from '../../../utils/formatBalance';

import TokenSymbol from '../../../components/TokenSymbol';
import { Bank } from '../../../anthill';
import useAddLiquidity from '../../../hooks/useAddLiquidity';
import useAntToken from '../../../hooks/useAntToken';
import TokenSwapInput from '../../../components/TokenExchangeInput';
import TokenSwapValue from '../../../components/TokenExchangeValue';
import useCalculateLiquidity from '../../../hooks/useCalculateLiquidity';
import useTokenBalance from '../../../hooks/useTokenBalance';

interface StakeProps {
  bank: Bank;
}

const AddLiquidity: React.FC<StakeProps> = ({ bank }) => {
  const antToken = useAntToken();
  const [token0In, setToken0In] = useState<boolean>(true);
  const [amountToken0, setAmountTokenA] = useState<number>(0);
  const amountToken1 = useCalculateLiquidity(bank, token0In, amountToken0);

  const [approveStatusToken0, approveToken0] = useApprove(antToken.tokens[bank.token0.symbol], antToken.contracts[bank.providerHelperName].address);
  const [approveStatusToken1, approveToken1] = useApprove(antToken.tokens[bank.token1.symbol], antToken.contracts[bank.providerHelperName].address);
  
  const tokenABalance = useTokenBalance(token0In ? bank.token0 : bank.token1);
  const tokenBBalance = useTokenBalance(token0In ? bank.token1 : bank.token0);

  const { onAddLiquidity } = useAddLiquidity(bank);

  const handleAddLiquidity = useCallback(() => 
  {
    if (token0In) {
      onAddLiquidity(amountToken0, amountToken1);
    }
    else
    {
      onAddLiquidity(amountToken1, amountToken0);
    }
  }, [token0In, amountToken0, amountToken1, onAddLiquidity]);

  const handleTokenChange = useCallback((amount: string) => {
    try{
      setAmountTokenA(parseFloat(amount) || 0);
    }
    catch(err)
    {
      setAmountTokenA(0);
    }
    
  }, [])
  
  const balanceA = Number(getDisplayBalance(tokenABalance, 18, 6));
  const balanceB = Number(getDisplayBalance(tokenBBalance, 18, 6));

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
                        value={amountToken1 ? amountToken1.toString() : ''}
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
                      value={amountToken1 ? amountToken1.toString() : ''}
                    />
                  </StyledInputHeader>
              )}
              <StyledActionSpacer/>
            <StyledInfoLine>
              Liquidity Provider fee = 0.17% of each swap
            </StyledInfoLine>
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
                        disabled={amountToken0 === 0 || amountToken1 === 0 || amountToken0 > balanceA || amountToken1 > balanceB}
                        onClick={handleAddLiquidity}
                        text={`Add Liquidity & Stake`}
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

const StyledInfoLine = styled.div`
  align-items: center;
  color: ${props => props.theme.color.grey[400]};
  display: flex;
  font-size: 12px;
  font-weight: 700;
  justify-content: flex-end;
`

export default AddLiquidity;
