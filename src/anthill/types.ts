import ERC20 from './ERC20';

export type ContractName = string;

export interface BankInfo {
  name: string;
  swapTitle: string;
  contract: ContractName;
  depositTokenName: ContractName;
  token0Name: ContractName;
  token1Name: ContractName;
  earnTokenSymbol: string;
  earnTokenName: ContractName;
  providerHelperName: ContractName;
  sort: number;
  finished: boolean;
  chainIds: number[];
}

export interface Bank extends BankInfo {
  address: string;
  depositToken: ERC20;
  token0: ERC20;
  token1: ERC20;
  earnToken: ERC20;
}

export type TokenStat = {
  priceInUSDCLastEpoch: string; // Price in USDC from the last seigniorage
  priceInUSDCRealTime: string; // Price in USDC form PancakeSwap
  totalSupply: string; // Total current supply
};

export type TreasuryAllocationTime = {
  prevAllocation: Date;
  nextAllocation: Date;
};

export type TokenInfo = {
  titleName: string;
  inlineName: string;
  symbol: string;
  color: string;
};
