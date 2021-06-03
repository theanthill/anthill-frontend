import React from 'react';
import styled from 'styled-components';
import { TokenAmount, Pair, Currency } from '@pancakeswap-libs/sdk'

import Button from '../../../components/Button';
import Card from '../../../components/Card';
import CardContent from '../../../components/CardContent';
import CardIcon from '../../../components/CardIcon';
import { AddIcon, RemoveIcon } from '../../../components/icons';
import IconButton from '../../../components/IconButton';
import Label from '../../../components/Label';
import Value from '../../../components/Value';

import useApprove, { ApprovalState } from '../../../hooks/useApprove';
import useModal from '../../../hooks/useModal';
import useStakedBalance from '../../../hooks/useStakedBalance';
import useTokenBalance from '../../../hooks/useTokenBalance';
import useWithdraw from '../../../hooks/useWithdraw';

import { getDisplayBalance } from '../../../utils/formatBalance';

import LiquidityModal from './LiquidityModal';
import WithdrawModal from './WithdrawModal';
import TokenSymbol from '../../../components/TokenSymbol';
import { Bank, ContractName } from '../../../anthill';
import useAddLiquidity from '../../../hooks/useAddLiquidity';
import useRemoveLiquidity from '../../../hooks/useRemoveLiquidity';
import useAntToken from '../../../hooks/useAntToken';
import useLiquidityAmounts from '../../../hooks/useLiquidityAmounts';

interface StakeProps {
  bank: Bank;
}

const AddLiquidity: React.FC<StakeProps> = ({ bank }) => {
  const antToken = useAntToken();

  const [approveStatusToken0, approveToken0] = useApprove(antToken.tokens[bank.token0.symbol], antToken.contracts[bank.providerHelperName].address);
  const [approveStatusToken1, approveToken1] = useApprove(antToken.tokens[bank.token1.symbol], antToken.contracts[bank.providerHelperName].address);
  
  // TODO: reactive update of token balance
  const antTokenBalance = useTokenBalance(antToken.tokens.ANT);
  const stakedBalance = useStakedBalance(bank.contract);
  const [token0Balance, token1Balance] = useLiquidityAmounts(bank);

  const { onAddLiquidity } = useAddLiquidity(bank);
  const { onRemoveLiquidity } = useRemoveLiquidity(bank);

  const [onPresentDeposit, onDismissDeposit] = useModal(
    <LiquidityModal
      max={antTokenBalance}
      decimals={bank.depositToken.decimal}
      onConfirm={(amount) => {
        onAddLiquidity(amount);
        onDismissDeposit();
      }}
      tokenName={`${bank.token0Name}/${bank.token1Name}`}
    />,
  );

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

  return (
      <Card>
        <CardContent>
          <StyledCardContentInner>
            <StyledCardHeader>
              <CardIcon>
                <TokenSymbol symbol={bank.depositToken.symbol} size={54} />
              </CardIcon>
              <Value value={`${getDisplayBalance(token0Balance, bank.token0.decimal)}`}/>
              <Label text={`${bank.token0Name} tokens in pool`} />
              <Value value={`${getDisplayBalance(token1Balance, bank.token1.decimal)}`}/>
              <Label text={`${bank.token1Name} tokens in pool`} />
              <Value value={getDisplayBalance(stakedBalance, bank.depositToken.decimal)} />
              <Label text={`${bank.depositTokenName} Tokens`} />
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
                      <IconButton onClick={onPresentWithdraw}>
                        <RemoveIcon />
                      </IconButton>
                      <StyledActionSpacer />
                      <IconButton
                        disabled={bank.finished}
                        onClick={() => (bank.finished ? null : onPresentDeposit())}
                      >
                        <AddIcon />
                      </IconButton>
                    </>
                  </StyledCardActions>
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
const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
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
