import { BigNumber } from 'ethers';
import Humanize from 'humanize-plus';

export const getDisplayBalance = (balance: BigNumber, decimals = 18, fractionDigits = 2) => {
  const number = getBalance(balance, decimals - fractionDigits);
  return (number / 10 ** fractionDigits).toFixed(fractionDigits);
};

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18) => {
  return getDisplayBalance(balance, decimals);
};

export const getHumanizedDisplayBalance = (balance: BigNumber, decimals = 18, fractionDigits = 2) => {
  const number = getBalance(balance, decimals-fractionDigits);
  return Humanize.formatNumber(number / 10 ** fractionDigits, fractionDigits);
}

export const getCompactDisplayBalance = (balance: BigNumber, decimals = 18, fractionDigits = 0) => {
  return Humanize.compactInteger(getBalance(balance, decimals), fractionDigits);
}

export function getBalance(balance: BigNumber, decimals = 18) : number {
  return balance.div(BigNumber.from(10).pow(decimals)).toNumber();
}

export function formatNumber(number: number) : string {

  if (!isFinite(number)) {
    return '- '
  }

  return number.toFixed(2);
}
