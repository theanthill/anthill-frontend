import { BigNumber, Contract, ethers } from 'ethers';
import { ChainId } from '@uniswap/sdk';

import { abi as INonfungiblePositionManager } from '@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json';
import { abi as ISwapFactory } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json';
import { abi as IUniswapV3Pool } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { abi as IQuoter } from '@uniswap/v3-periphery/artifacts/contracts/interfaces/IQuoter.sol/IQuoter.json';
import { abi as ISwapRouter } from '@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json';

import ERC20 from './ERC20';
import { getDefaultProvider } from '../utils/provider';
import { Configuration } from './config';
import { decodeSqrtX96 } from '../utils/sqrtPrice';
import { getSqrtRatioAtTick } from '../utils/TickMath';

import { ILiquidityProvider } from './ILiquidityProvider';
import { TransactionResponse } from '@ethersproject/providers';

const LIQUIDITY_FEE = 3000;

/**
 * An API module of The Anthill contracts.
 * All contract-interacting domain logic should be defined in here.
 */
export class LiquidityProviderUniswap implements ILiquidityProvider {
  provider: ethers.providers.Web3Provider;
  myAccount: string;
  signer?: ethers.Signer;
  chainId: ChainId;
  positionManager: Contract;
  swapFactory: Contract;
  swapRouter: Contract;
  quoter: Contract;
  poolMap: Map<String, Contract>;

  constructor(cfg: Configuration) {
    this.chainId = cfg.chainId;
    this.provider = getDefaultProvider();

    this.positionManager = new Contract(
      cfg.deployments['PositionManager'].address,
      INonfungiblePositionManager,
      this.provider,
    );
    this.swapFactory = new Contract(
      cfg.deployments['SwapFactory'].address,
      ISwapFactory,
      this.provider,
    );
    this.swapRouter = new Contract(
      cfg.deployments['SwapRouter'].address,
      ISwapRouter,
      this.provider,
    );
    this.quoter = new Contract(cfg.deployments['Quoter'].address, IQuoter, this.provider);

    this.poolMap = new Map<string, Contract>();
  }

  unlockWallet(signer: ethers.Signer): void {
    this.positionManager = this.positionManager.connect(signer);
    this.swapFactory = this.swapFactory.connect(signer);
    this.swapRouter = this.swapRouter.connect(signer);
    this.quoter = this.quoter.connect(signer);
  }

  async getAccountLiquidity(
    erc20Token0: ERC20,
    erc20Token1: ERC20,
    account: string,
  ): Promise<Array<BigNumber>> {
    // Get the specific liquidity for a position
    /*const token0 = new Token(this.chainId, erc20Token0.address, erc20Token0.decimal);
    const token1 = new Token(this.chainId, erc20Token1.address, erc20Token1.decimal);

    const pair = await Fetcher.fetchPairData(token0 , token1, this.provider);
      
    const liquidityAmount = new TokenAmount(pair.liquidityToken, pairLiquidity.toString());
    const totalSupplyAmount = new TokenAmount(pair.liquidityToken, totalSupply.toString());

    const token0Amount = pair.getLiquidityValue(pair.token0, totalSupplyAmount, liquidityAmount, false);
    const token1Amount = pair.getLiquidityValue(pair.token1, totalSupplyAmount, liquidityAmount, false);

    const token0AmountBN = BigNumber.from(token0Amount.raw.toString());
    const token1AmountBN = BigNumber.from(token1Amount.raw.toString());

    return token0.sortsBefore(token1) ? [token0AmountBN, token1AmountBN] : [token1AmountBN, token0AmountBN];*/
    return [BigNumber.from('19900000000000000000'), BigNumber.from('19900000000000000000')];
  }

  async getTotalLiquidity(erc20Token0: ERC20, erc20Token1: ERC20): Promise<Array<BigNumber>> {
    const pool = await this.getPool(erc20Token0, erc20Token1);

    const token0Amount = await erc20Token0.balanceOf(pool.address);
    const token1Amount = await erc20Token1.balanceOf(pool.address);

    return [token0Amount, token1Amount];
  }

  async getUserLiquidity(positions: number[]): Promise<BigNumber> {
    let userLiquidity = BigNumber.from(0);
    for (let i = 0; i < positions.length; ++i) {
      const [, , , , , , , liquidity, , ,] = await this.positionManager.positions(positions[i]);
      userLiquidity = userLiquidity.add(liquidity);
    }

    return userLiquidity;
  }

  async getPoolLiquidity(erc20Token0: ERC20, erc20Token1: ERC20): Promise<BigNumber> {
    const pool = await this.getPool(erc20Token0, erc20Token1);
    return pool.liquidity();
  }

  async getPoolSqrtPriceX96(erc20Token0: ERC20, erc20Token1: ERC20): Promise<BigNumber> {
    const pool = await this.getPool(erc20Token0, erc20Token1);
    const slot0 = await pool.slot0();
    return slot0.sqrtPriceX96;
  }

  async getPoolCurrentTick(erc20Token0: ERC20, erc20Token1: ERC20): Promise<number> {
    const pool = await this.getPool(erc20Token0, erc20Token1);
    const slot0 = await pool.slot0();
    return slot0.tick;
  }

  /* USED */
  async getPairPriceLatest(
    erc20Token0: ERC20,
    erc20Token1: ERC20,
    decimals: number,
  ): Promise<[number, number]> {
    const pool = await this.getPool(erc20Token0, erc20Token1);
    const slot0 = await pool.slot0();
    const sqrtPriceX96 = slot0.sqrtPriceX96;

    const price = decodeSqrtX96(sqrtPriceX96, decimals);

    return erc20Token0.address < erc20Token1.address
      ? [price, 1.0 / price]
      : [1.0 / price, price];
  }

  async getPairPriceTWAP(
    erc20Token0: ERC20,
    erc20Token1: ERC20,
    decimals: number,
  ): Promise<[number, number]> {
    const pool = await this.getPool(erc20Token0, erc20Token1);
    const slot0 = await pool.slot0();

    const oldestObservationIndex =
      (slot0.observationIndex + slot0.observationCardinality - 1) %
      slot0.observationCardinality;
    const currentObservation = await pool.observations(slot0.observationIndex);
    const oldestObservation = await pool.observations(oldestObservationIndex);

    let price: number;
    if (
      oldestObservation.initialized &&
      oldestObservation.blockTimestamp !== 0 &&
      oldestObservation.blockTimestamp !== currentObservation.blockTimestamp
    ) {
      const tick =
        (currentObservation.tickCumulative - oldestObservation.tickCumulative) /
        (currentObservation.blockTimestamp - oldestObservation.blockTimestamp);
      const sqrtPriceX96 = getSqrtRatioAtTick(tick);
      price = decodeSqrtX96(sqrtPriceX96, decimals);
    } else {
      // We only have 1 current observation
      price = decodeSqrtX96(slot0.sqrtPriceX96, decimals);
    }

    return erc20Token0.address < erc20Token1.address
      ? [price, 1.0 / price]
      : [1.0 / price, price];
  }

  async getPool(erc20Token0: ERC20, erc20Token1: ERC20): Promise<Contract> {
    let key = erc20Token0.address + erc20Token1;
    if (erc20Token0.address > erc20Token1.address) {
      key = erc20Token1.address + erc20Token0.address;
    }

    if (!this.poolMap.has(key)) {
      const poolAddress = await this.swapFactory.getPool(
        erc20Token0.address,
        erc20Token1.address,
        LIQUIDITY_FEE,
      );

      this.poolMap.set(key, new Contract(poolAddress, IUniswapV3Pool, this.provider));
    }

    return this.poolMap.get(key);
  }

  async quoteExactInput(
    tokenIn: ERC20,
    tokenOut: ERC20,
    amount: BigNumber,
  ): Promise<BigNumber> {
    return this.quoter.callStatic.quoteExactInputSingle(
      tokenIn.address,
      tokenOut.address,
      LIQUIDITY_FEE,
      amount,
      0,
    );
  }

  async swapExactInput(
    tokenIn: ERC20,
    tokenOut: ERC20,
    amountIn: BigNumber,
    amountOutMin: BigNumber,
    recipient: string,
  ): Promise<TransactionResponse> {
    const deadline = Math.floor(new Date().getTime() / 1000) + 1800; // 30 minutes
    return this.swapRouter.exactInputSingle([
      tokenIn.address,
      tokenOut.address,
      LIQUIDITY_FEE,
      recipient,
      deadline,
      amountIn,
      amountOutMin,
      0,
    ]);
  }
}
