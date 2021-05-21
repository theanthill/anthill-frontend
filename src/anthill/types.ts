import ERC20 from './ERC20';

export type ContractName = string;

export interface BankInfo {
  name: string;
  contract: ContractName;
  depositTokenName: ContractName;
  token0Name: ContractName,
  token1Name: ContractName,
  earnTokenName: ContractName;
  sort: number;
  finished: boolean;
}

export interface Bank extends  BankInfo {
  address: string;
  depositToken: ERC20;
  token0: ERC20,
  token1: ERC20,
  earnToken: ERC20;
}

export type TokenStat = {
  priceInBUSD: string;
  totalSupply: string;
};

export type TreasuryAllocationTime = {
  prevAllocation: Date;
  nextAllocation: Date;
}

export type TokenInfo = {
  titleName: string;
  inlineName: string;
  symbol: string;
  color: string;
}