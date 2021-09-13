import { Export } from 'hardhat-deploy/types';

export type Configuration = {
  chainId: number;
  bscscanUrl: string;
  defaultProvider: string;
  deployments: Export;
  config?: EthereumConfig;

  baseLaunchDate: Date;
  antBondLaunchesAt: Date;
  boardroomLaunchesAt: Date;

  refreshInterval: number;
  gasLimitMultiplier: number;
  priceDecimals: number;
};

export type EthereumConfig = {
  testing: boolean;
  autoGasMultiplier: number;
  defaultConfirmations: number;
  defaultGas: string;
  defaultGasPrice: string;
  ethereumNodeTimeout: number;
};

export const defaultEthereumConfig = {
  testing: false,
  autoGasMultiplier: 1.5,
  defaultConfirmations: 1,
  defaultGas: '6000000',
  defaultGasPrice: '1000000000000',
  ethereumNodeTimeout: 10000,
};
