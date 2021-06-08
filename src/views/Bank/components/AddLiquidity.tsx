import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { tokens } from '../../../config';

import Button from '../../../components/Button';
import InfoButton from '../../../components/InfoButton';
import Card from '../../../components/Card';
import CardContent from '../../../components/CardContent';
import CardIcon from '../../../components/CardIcon';
import Label from '../../../components/Label';
import Value from '../../../components/Value';

import useApprove, { ApprovalState } from '../../../hooks/useApprove';
import useModal from '../../../hooks/useModal';
import useStakedBalance from '../../../hooks/useStakedBalance';
import useTokenBalance from '../../../hooks/useTokenBalance';

import { getDisplayBalance } from '../../../utils/formatBalance';

import WithdrawModal from './WithdrawModal';
import TokenSymbol from '../../../components/TokenSymbol';
import { Bank } from '../../../anthill';
import useAddLiquidity from '../../../hooks/useAddLiquidity';
import useRemoveLiquidity from '../../../hooks/useRemoveLiquidity';
import useAntToken from '../../../hooks/useAntToken';
import useLiquidityAmounts from '../../../hooks/useLiquidityAmounts';
import TokenSwapInput from '../../Swap/components/TokenSwapInput';
import TokenSwapValue from '../../Swap/components/TokenSwapValue';
import useCalculateLiquidity from '../../../hooks/useCalculateLiquidity';
import LiquidityInfoModal from './LiquidityInfoModal';

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
  
  const stakedBalance = useStakedBalance(bank.contract);

  const { onAddLiquidity } = useAddLiquidity(bank);
  const { onRemoveLiquidity } = useRemoveLiquidity(bank);

  const handleAddLiquidity = useCallback(() => 
  {
    if (token0In) {
      onAddLiquidity(amountTokenA, amountTokenB);
    }
    else
    {
      onAddLiquidity(amountTokenB, amountTokenA);
    }
  }, [token0In, amountTokenA, amountTokenB]);

  const [onPresentWithdraw, onDismissWithdraw] = useModal(
    <WithdrawModal
      max={stakedBalance}
      decimals={bank.depositToken.decimal}
      onConfirm={(amount) => {
        onRemoveLiquidity(amount);
        onDismissWithdraw();
      }}
      tokenName={`${bank.depositToken.symbol}`}
    />,
  );

  const [onPresentInfo] = useModal(
    <LiquidityInfoModal bank={bank}/>,
  );

  const handleTokenChange = useCallback((amount: string) => {
    try{
      setAmountTokenA(parseInt(amount));
    }
    catch(err)
    {}
    
  }, [token0In])
  
  const handleChangeSwapDirection = useCallback(() => {
    setToken0In(!token0In)
  }, [setToken0In, token0In])

  
  return (
      <Card>
        <CardContent>
          <StyledInfoButton>
            <InfoButton onClick={onPresentInfo} size='25px'/>
          </StyledInfoButton>
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
              <StyledActionSpacer />
              <StyledActionSpacer />
              <Value value={getDisplayBalance(stakedBalance, bank.depositToken.decimal)} />
              <Label text={`${tokens[bank.depositTokenName].titleName} Tokens`} />
            </StyledCardHeader>

              {
                (approveStatusToken0 !== ApprovalState.APPROVED ||
                approveStatusToken1 !== ApprovalState.APPROVED) ? (
                  // Approval buttons
                  <StyledContent>
                    <StyledActionSpacer />
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
                  </StyledContent>
                ) : (
                  <StyledCardActions>
                    <>
                      <Button
                        disabled={amountTokenA == 0 || amountTokenB == 0}
                        onClick={handleAddLiquidity}
                        text={`Add Liquidity`}
                      />
                      <StyledActionSpacer/>
                      <Button
                        disabled={getDisplayBalance(stakedBalance, bank.depositToken.decimal)=='0.00'}
                        onClick={onPresentWithdraw}
                        text={`Remove Liquidity`}
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
  flex-direction: column;
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

const StyledInfoButton = styled.div`
  margin-left: auto; 
  margin-right: 0;
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

export default AddLiquidity;
