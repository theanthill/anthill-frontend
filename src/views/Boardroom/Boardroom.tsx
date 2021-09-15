import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useWallet } from '@binance-chain/bsc-use-wallet';

import Button from '../../components/Button';
import PageHeader from '../../components/PageHeader';
import Spacer from '../../components/Spacer';
import Harvest from './components/Harvest';
import Stake from './components/Stake';
import { Switch } from 'react-router-dom';
import Page from '../../components/Page';
import useRedeemOnBoardroom from '../../hooks/useRedeemOnBoardroom';
import useStakedBalanceOnBoardroom from '../../hooks/useStakedBalanceOnBoardroom';

import Stat from './components/Stat';
import ProgressCountdown from './components/ProgressCountdown';
import useTreasuryAmount from '../../hooks/useTreasuryAmount';
import useAntToken from '../../hooks/useAntToken';
import { getBalance, getCompactDisplayBalance } from '../../utils/formatBalance';
//import useTreasuryAllocationTimes from '../../hooks/useTreasuryAllocationTimes';
import Notice from '../../components/Notice';
import useBoardroomVersion from '../../hooks/useBoardroomVersion';
import moment from 'moment';
import useTotalSupply from '../../hooks/useTotalSupply';
import useAntTokenStats from '../../hooks/useAntTokenStats';

const Boardroom: React.FC = () => {
  useEffect(() => window.scrollTo(0, 0));
  const { account } = useWallet();
  const { onRedeem } = useRedeemOnBoardroom();
  const stakedBalance = useStakedBalanceOnBoardroom();
  
  const antToken = useAntToken();
  const antTokenStat = useAntTokenStats();
  const treasuryAmount = useTreasuryAmount();
  const antTokenTotalSupply = useTotalSupply(antToken?.tokens.ANT);

  const scalingFactor = useMemo(
    () => (antTokenStat ? Number(antTokenStat.priceInUSDCLastEpoch).toFixed(antToken.priceDecimals) : null),
    [antTokenStat, antToken],
  );
  
  // [workerant] Set Epoch to 10 minutes for now
  /*
  const { prevAllocation, nextAllocation } = useTreasuryAllocationTimes();
  const prevEpoch = useMemo(() =>
      nextAllocation.getTime() <= Date.now()
        ? moment().utc().startOf('day').toDate()
        : prevAllocation,
    [prevAllocation, nextAllocation],
  );
  const nextEpoch = useMemo(() => moment(prevEpoch).add(8, 'hours').toDate(), [prevEpoch]);
  */

  const prevEpoch = useMemo(() => {
    const now = Date.now();
    const startOf10Minutes = now - (now % 600000);
    return moment(startOf10Minutes).toDate()
  },[],);
  const nextEpoch = useMemo(() => 
    moment(prevEpoch).add(10, 'minutes').toDate(),
  [prevEpoch]);

  const boardroomVersion = useBoardroomVersion();
  const usingOldBoardroom = boardroomVersion !== 'latest';
  const migrateNotice = useMemo(() => {
    if (boardroomVersion === 'v2') {
      return (
        <StyledNoticeWrapper>
          <Notice color="green">
            <b>Please Migrate into New Boardroom</b>
            <br />
            The boardroom upgrade was successful. Please settle and withdraw your stake from the
            legacy boardroom, then stake again on the new boardroom contract{' '}
            <b>to continue earning ANT seigniorage.</b>
          </Notice>
        </StyledNoticeWrapper>
      );
    }
    return <></>;
  }, [boardroomVersion]);

  return (
    <Switch>
      <Page>
        {!!account ? (
          <>
            <PageHeader
              title="Join the Boardroom"
              subtitle="Deposit Ant Shares and earn inflationary rewards"
            />
            {migrateNotice}
            <StyledHeader>
              <ProgressCountdown
                base={prevEpoch}
                deadline={nextEpoch}
                description="Next Epoch"
              />
              <Stat
                title={antTokenStat ? `${antTokenStat.priceInUSDCLastEpoch}` : '-'}
                description="Last TWAP"
              />
              <Stat
                title={parseFloat(scalingFactor) > 1 ? `x${scalingFactor}` : '-'}
                description="Scaling Factor"
              />
              <Stat
                title={
                  treasuryAmount
                    ? `~${getCompactDisplayBalance(treasuryAmount, antToken.tokens.ANT.decimal, 0)} ANT`
                    : '-'
                }
                description="Treasury Amount"
              />
              <Stat
                title={
                  antTokenTotalSupply
                    ? `~${getBalance(antTokenTotalSupply)}`
                    : '-'
                }
                description="Ant Token Supply"
              />
            </StyledHeader>
            <StyledBoardroom>
              <StyledCardsWrapper>
                <StyledCardWrapper>
                  <Harvest />
                </StyledCardWrapper>
                <Spacer />
                <StyledCardWrapper>
                  <Stake />
                </StyledCardWrapper>
              </StyledCardsWrapper>
              <Spacer size="lg" />
              {!usingOldBoardroom && (
                // for old boardroom users, the button is displayed in Stake component
                <>
                  <div>
                    <Button
                      disabled={stakedBalance.eq(0)}
                      onClick={onRedeem}
                      text="Exit: Claim & Withdraw"
                    />
                  </div>
                  <Spacer size="lg" />
                </>
              )}
            </StyledBoardroom>
          </>
        ) : (
          <UnlockWallet />
        )}
      </Page>
    </Switch>
  );
};

const UnlockWallet = () => {
  const { connect } = useWallet();
  return (
    <Center>
      <Button onClick={() => connect('injected')} text="Unlock Wallet" />
    </Center>
  );
};

const StyledBoardroom = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledHeader = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: row;
  margin-bottom: ${(props) => props.theme.spacing[5]}px;
  width: 960px;

  > * {
    flex: 1;
    height: 84px;
    margin: 0 ${(props) => props.theme.spacing[2]}px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const StyledNoticeWrapper = styled.div`
  width: 768px;
  margin-top: -20px;
  margin-bottom: 40px;
`;

const StyledCardsWrapper = styled.div`
  display: flex;
  width: 600px;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 80%;
  }
`;

const Center = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export default Boardroom;
