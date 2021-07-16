import { Configuration } from './anthill/config';
import { BankInfo, TokenInfo } from './anthill';

export const tokens: { [tokenName: string]: TokenInfo } =
{
  AntToken :
  {
    titleName: 'ANT Token',
    inlineName: 'Ant Token',
    symbol: 'ANT',
    color: "#77e463",
  },
  AntShare :
  {
    titleName: 'ANT Share',
    inlineName: 'Ant Share',
    symbol: 'ANTS',
    color: "#4cb3ff",
  },
  AntBond :
  {
    titleName: 'ANT Bond',
    inlineName: 'Ant Bond',
    symbol: 'ANTB',
    color: "#da5eff",
  },
  'AntToken-BUSD' :
  {
    titleName: 'ANT-BUSD LP',
    inlineName: 'ANTBUSD LP',
    symbol: 'ANT-BUSD',
    color: "#ffffff",
  },
  'AntToken-BNB' :
  {
    titleName: 'ANT-BNB LP',
    inlineName: 'ANTBNB LP',
    symbol: 'ANT-BNB',
    color: "#ffffff",
  },
  'AntToken-ETH' :
  {
    titleName: 'ANT-ETH LP',
    inlineName: 'ANTETH LP',
    symbol: 'ANT-ETH',
    color: "#ffffff",
  }
};

const configurations: { [env: string]: Configuration } = {
  development: {
    chainId: 97,
    bscscanUrl: 'https://testnet.bscscan.com/',
    defaultProvider: 'http://localhost:8545',
    deployments: require('./anthill/deployments/deployments.dev.json'),
    externalTokens: require('./anthill/deployments/externals.dev.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
  'bsc-local-testnet': {
    chainId: 97,
    bscscanUrl: 'https://testnet.bscscan.com/',
    defaultProvider: 'http://localhost:8545',
    deployments: require('./anthill/deployments/deployments.bsc-local-testnet.json'),
    externalTokens: require('./anthill/deployments/externals.bsc-local-testnet.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
  'bsc-testnet': {
    chainId: 97,
    bscscanUrl: 'https://testnet.bscscan.com/',
    defaultProvider: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    deployments: require('./anthill/deployments/deployments.bsc-testnet.json'),
    externalTokens: require('./anthill/deployments/externals.bsc-testnet.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
  'bsc-local-mainnet': {
    chainId: 56,
    bscscanUrl: 'https://bscscan.com/',
    defaultProvider: 'https://bsc-dataseed.binance.org',
    deployments: require('./anthill/deployments/deployments.bsc-local-mainnet.json'),
    externalTokens: require('./anthill/deployments/externals.bsc-local-mainnet.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
  'bsc-mainnet': {
    chainId: 56,
    bscscanUrl: 'https://bscscan.com/',
    defaultProvider: 'https://bsc-dataseed.binance.org',
    deployments: require('./anthill/deployments/deployments.bsc-mainnet.json'),
    externalTokens: require('./anthill/deployments/externals.bsc-mainnet.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
  'eth-local-ropsten': {
    chainId: 3,
    bscscanUrl: 'https://ropsten.etherscan.io/',
    defaultProvider: 'http://localhost:8545',
    deployments: require('./anthill/deployments/deployments.eth-local-ropsten.json'),
    externalTokens: require('./anthill/deployments/externals.eth-local-ropsten.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
  production: {
    chainId: 97,
    bscscanUrl: 'https://testnet.bscscan.com/',
    defaultProvider: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    deployments: require('./anthill/deployments/deployments.bsc-testnet.json'),
    externalTokens: require('./anthill/deployments/externals.bsc-testnet.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
};

export const bankDefinitions: { [contractName: string]: BankInfo } = {
  BUSDANTLPTokenANTPool: {
    name: `Earn ${tokens['AntToken'].inlineName} by ${tokens['AntToken'].symbol} + BUSD`,
    swapTitle: `Swap ${tokens['AntToken'].inlineName} and BUSD`,
    contract: 'BUSDANTLPTokenANTPool',
    depositTokenName: 'AntToken-BUSD',
    token0Name: 'ANT',
    token1Name: 'BUSD',
    earnTokenSymbol: 'ANT',
    earnTokenName: 'Ant Tokens',
    providerHelperName: 'BUSDANTLPHelper',
    finished: false,
    sort: 0,
    chainIds: []
  },
  BNBANTLPTokenANTPool: {
    name: `Earn ${tokens['AntToken'].inlineName} by ${tokens['AntToken'].symbol} + BNB`,
    swapTitle: `Swap ${tokens['AntToken'].inlineName} and BNB`,
    contract: 'BNBANTLPTokenANTPool',
    depositTokenName: 'AntToken-BNB',
    token0Name: 'ANT',
    token1Name: 'BNB',
    earnTokenSymbol: 'ANT',
    earnTokenName: 'Ant Tokens',
    providerHelperName: 'BNBANTLPHelper',
    finished: false,
    sort: 1,
    chainIds: [56, 97]
  },
  ETHANTLPTokenANTPool: {
    name: `Earn ${tokens['AntToken'].inlineName} by ${tokens['AntToken'].symbol} + ETH`,
    swapTitle: `Swap ${tokens['AntToken'].inlineName} and ETH`,
    contract: 'ETHANTLPTokenANTPool',
    depositTokenName: 'AntToken-ETH',
    token0Name: 'ANT',
    token1Name: 'ETH',
    earnTokenSymbol: 'ANT',
    earnTokenName: 'Ant Tokens',
    providerHelperName: 'ETHANTLPHelper',
    finished: false,
    sort: 1,
    chainIds: [3]
  },
};

export default configurations[process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || "development"];
