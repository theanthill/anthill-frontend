import { ChainId } from '@pancakeswap-libs/sdk';
import { Configuration } from './anthill/config';
import { BankInfo, TokenInfo } from './anthill';
import { runInThisContext } from 'vm';

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
  'ANT-BUSD' :
  {
    titleName: 'ANT-BUSD LP',
    inlineName: 'ANTBUSD LP',
    symbol: 'ANT-BUSD',
    color: "#ffffff",
  },
  'ANT-BNB' :
  {
    titleName: 'ANT-BNB LP',
    inlineName: 'ANTBNB LP',
    symbol: 'ANT-BNB',
    color: "#ffffff",
  }
};

const configurations: { [env: string]: Configuration } = {
  development: {
    chainId: ChainId.BSCTESTNET,
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
  'local-testnet': {
    chainId: ChainId.BSCTESTNET,
    bscscanUrl: 'https://testnet.bscscan.com/',
    defaultProvider: 'http://localhost:8545',
    deployments: require('./anthill/deployments/deployments.local-testnet.json'),
    externalTokens: require('./anthill/deployments/externals.local-testnet.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
  testnet: {
    chainId: ChainId.BSCTESTNET,
    bscscanUrl: 'https://testnet.bscscan.com/',
    defaultProvider: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    deployments: require('./anthill/deployments/deployments.testnet.json'),
    externalTokens: require('./anthill/deployments/externals.testnet.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
  'local-mainnet': {
    chainId: ChainId.MAINNET,
    bscscanUrl: 'https://bscscan.com/',
    defaultProvider: 'https://bsc-dataseed.binance.org',
    deployments: require('./anthill/deployments/deployments.local-mainnet.json'),
    externalTokens: require('./anthill/deployments/externals.local-mainnet.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
  mainnet: {
    chainId: ChainId.MAINNET,
    bscscanUrl: 'https://bscscan.com/',
    defaultProvider: 'https://bsc-dataseed.binance.org',
    deployments: require('./anthill/deployments/deployments.mainnet.json'),
    externalTokens: require('./anthill/deployments/externals.mainnet.json'),
    baseLaunchDate: new Date('2021-05-02T04:00:00Z'),
    antBondLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    boardroomLaunchesAt: new Date('2021-05-02T04:00:00Z'),
    refreshInterval: 5000,
    gasLimitMultiplier: 1.7,
    priceDecimals: 2,
  },
  production: {
    chainId: ChainId.BSCTESTNET,
    bscscanUrl: 'https://testnet.bscscan.com/',
    defaultProvider: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    deployments: require('./anthill/deployments/deployments.testnet.json'),
    externalTokens: require('./anthill/deployments/externals.testnet.json'),
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
    depositTokenName: 'ANT-BUSD',
    token0Name: 'ANT',
    token1Name: 'BUSD',
    earnTokenSymbol: 'ANT',
    earnTokenName: 'Ant Tokens',
    providerHelperName: 'BUSDANTLPHelper',
    finished: false,
    sort: 0,
  },
  BNBANTLPTokenANTPool: {
    name: `Earn ${tokens['AntToken'].inlineName} by ${tokens['AntToken'].symbol} + BNB`,
    swapTitle: `Swap ${tokens['AntToken'].inlineName} and BNB`,
    contract: 'BNBANTLPTokenANTPool',
    depositTokenName: 'ANT-BNB',
    token0Name: 'ANT',
    token1Name: 'BNB',
    earnTokenSymbol: 'ANT',
    earnTokenName: 'Ant Tokens',
    providerHelperName: 'BNBANTLPHelper',
    finished: false,
    sort: 1,
  },
};

export default configurations[process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || "development"];
