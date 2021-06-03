import React, { useEffect } from 'react';
import { Switch, NavLink} from 'react-router-dom';
import styled from 'styled-components';

import { useWallet } from '@binance-chain/bsc-use-wallet';

import Button from '../../components/Button';
import Page from '../../components/Page';
import List from '../../components/List';
import Card from '../../components/Card';
import PageHeader from '../../components/PageHeader';
import FaucetButton from './components/FaucetButton';

import MetamaskSettings from '../../assets/img/MetamaskSettings.png';
import MetamaskNetworks from '../../assets/img/MetamaskNetworks.png';
import MetamaskRPCSettings from '../../assets/img/MetamaskRPCSettings.png';
import MetamaskAddToken from '../../assets/img/MetamaskAddToken.png';
import MetamaskAddTokenAddress from '../../assets/img/MetamaskAddTokenAddress.png';
import MetamaskAddTokenConfirmation from '../../assets/img/MetamaskAddTokenConfirmation.png';
import MetamaskSelectNetwork from '../../assets/img/MetamaskSelectNetwork.png';
import BinanceFaucet from '../../assets/img/BinanceFaucet.png';
import MetamaskWalletAddress from '../../assets/img/MetamaskWalletAddress.png';
import BinanceFaucetAddress from '../../assets/img/BinanceFaucetAddress.png';
import FaucetGetBNB from '../../assets/img/FaucetGetBNB.png';
import FaucetApprovedBNB from '../../assets/img/FaucetApprovedBNB.png';

import Configurations, {tokens} from '../../config';

const Help: React.FC = () => {
  const { account } = useWallet();

  useEffect(() => window.scrollTo(0, 0));

  return (

        <Page>
            <PageHeader
                subtitle={`Setting up Metamask for the test network. Once you've followed the instructions and connected to the testnet, use the button below to connect your wallet and get some free tokens`}
                title={`Help`}
            />
            { account ? <FaucetButton/> : <UnlockWallet/>}
            <Card>
                <StyledSection>
                    <StyledTitle>
                        Current deployment addresses
                    </StyledTitle>
                    <StyledDesc>
                        <List
                            elements = {[ {header:`${tokens.AntToken.titleName}`, content: `${Configurations.deployments['AntToken'].address}`},
                                        {header:`${tokens.AntShare.titleName}`, content: `${Configurations.deployments['AntShare'].address}`},
                                        {header:`${tokens.AntBond.titleName}`, content: `${Configurations.deployments['AntBond'].address}`},
                                        {header:'BUSD Token', content: `${Configurations.externalTokens['BUSD'].address}`},
                                        {header:'BNB Token', content: `${Configurations.externalTokens['BNB'].address}`}
                    ]}/>
                    </StyledDesc>
                    <StyledDesc>
                        Please go to the Docs section above to know how to use these addreses
                    </StyledDesc>
                </StyledSection>
            </Card>
        </Page>

  )
};

const UnlockWallet = () => {
    const { connect } = useWallet();
    return (
      <Center>
        <Button onClick={() => connect('injected')} text="Unlock Wallet" />
      </Center>
    );
  };

const StyledSection = styled.div`
`;

const StyledTitle = styled.h1`
    color: ${props => props.theme.color.grey[100]};
    font-size: 24px;
    font-weight: 700;
    margin: 24px;
    padding: 0;
`;

const StyledDesc = styled.div`
    color: ${(props) => props.theme.color.grey[300]};
    width: 800px;
    margin: 24px;
    margin-top:0;
    text-indent: 34px;
`;

const StyledScreenshot = styled.div`
    text-align: center;
    margin: 24px;
`;

const Center = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
`;

const StyledLink = styled(NavLink)`
  color: ${props => props.theme.color.grey[400]};
  font-weight: 700;
  text-decoration: none;
  &:hover {
    color: ${props => props.theme.color.grey[500]};
  }
  &.active {
    color: ${props => props.theme.color.primary.main};
  }
`
export default Help;
