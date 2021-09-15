import { Configuration } from './anthill/config';
import { BankInfo, TokenInfo } from './anthill';

export const tokens: { [tokenName: string]: TokenInfo } = {
  AntToken: {
    titleName: 'ANT Token',
    inlineName: 'Ant Token',
    symbol: 'ANT',
    color: '#77e463',
  },
  AntShare: {
    titleName: 'ANT Share',
    inlineName: 'Ant Share',
    symbol: 'ANTS',
    color: '#4cb3ff',
  },
  AntBond: {
    titleName: 'ANT Bond',
    inlineName: 'Ant Bond',
    symbol: 'ANTB',
    color: '#da5eff',
  },
  'AntToken-USDC': {
    titleName: 'ANT-USDC LP',
    inlineName: 'ANTUSDC LP',
    symbol: 'ANT-USDC',
    color: '#ffffff',
  },
  'AntToken-BNB': {
    titleName: 'ANT-BNB LP',
    inlineName: 'ANTBNB LP',
    symbol: 'ANT-BNB',
    color: '#ffffff',
  },
  'AntToken-ETH': {
    titleName: 'ANT-ETH LP',
    inlineName: 'ANTETH LP',
    symbol: 'ANT-ETH',
    color: '#ffffff',
  },
};

const configurations: { [env: string]: Configuration } = {
  localhost: {
    bscscanUrl: 'https://testnet.bscscan.com/',
    defaultProvider: 'http://localhost:8545',
    deployments: require('./anthill/deployments/localhost.deployments.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
  rinkeby: {
    bscscanUrl: 'https://ropsten.etherscan.io/',
    defaultProvider: `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`,
    deployments: require('./anthill/deployments/rinkeby.deployments.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
  'arb-rinkeby': {
    bscscanUrl: 'https://rinkeby-explorer.arbitrum.io/',
    defaultProvider: `https://arb-rinkeby.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,
    deployments: require('./anthill/deployments/arb-rinkeby.deployments.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
};

export const bankDefinitions: { [contractName: string]: BankInfo } = {
  USDCANTLPTokenANTPool: {
    name: `Earn ${tokens['AntToken'].inlineName} by ${tokens['AntToken'].symbol} + USDC`,
    swapTitle: `Swap ${tokens['AntToken'].inlineName} and USDC`,
    contract: 'USDCANTPoolStakerANT',
    depositTokenName: 'AntToken-USDC',
    token0Name: 'ANT',
    token1Name: 'USDC',
    earnTokenSymbol: 'ANT',
    earnTokenName: 'Ant Tokens',
    providerHelperName: 'USDCANTPoolHelper',
    finished: false,
    sort: 0,
    chainIds: [4, 421611],
  },
  ETHANTLPTokenANTPool: {
    name: `Earn ${tokens['AntToken'].inlineName} by ${tokens['AntToken'].symbol} + ETH`,
    swapTitle: `Swap ${tokens['AntToken'].inlineName} and ETH`,
    contract: 'ETHANTPoolStakerANT',
    depositTokenName: 'AntToken-ETH',
    token0Name: 'ANT',
    token1Name: 'ETH',
    earnTokenSymbol: 'ANT',
    earnTokenName: 'Ant Tokens',
    providerHelperName: 'ETHANTPoolHelper',
    finished: false,
    sort: 1,
    chainIds: [4, 421611],
  },
};

export default configurations[
  process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || 'development'
];
