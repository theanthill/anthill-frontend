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
    this.chainId = parseInt(cfg.deployments.chainId);
    this.provider = getDefaultProvider();

    this.positionManager = new Contract(
      cfg.deployments.contracts['INonfungiblePositionManager'].address,
      INonfungiblePositionManager,
      this.provider,
    );
    this.swapFactory = new Contract(
      cfg.deployments.contracts['IUniswapV3Factory'].address,
      ISwapFactory,
      this.provider,
    );
    this.swapRouter = new Contract(
      cfg.deployments.contracts['ISwapRouter'].address,
      ISwapRouter,
      this.provider,
    );
    this.quoter = new Contract(
      cfg.deployments.contracts['IQuoter'].address,
      IQuoter,
      this.provider,
    );

    this.poolMap = new Map<string, Contract>();
  }

  unlockWallet(signer: ethers.Signer): void {
    this.positionManager = this.positionManager.connect(signer);
    this.swapFactory = this.swapFactory.connect(signer);
    this.swapRouter = this.swapRouter.connect(signer);
    this.quoter = this.quoter.connect(signer);
  }

  async getTotalLiquidity(erc20Token0: ERC20, erc20Token1: ERC20): Promise<Array<BigNumber>> {
    const pool = await this.getPool(erc20Token0, erc20Token1);

    const token0Amount = await erc20Token0.balanceOf(pool.address);
    const token1Amount = await erc20Token1.balanceOf(pool.address);

    return [token0Amount, token1Amount];
  }

  async getUserLiquidity(
    erc20Token0: ERC20,
    erc20Token1: ERC20,
    positions: number[],
  ): Promise<[BigNumber, BigNumber]> {
    let amount0 = BigNumber.from(0);
    let amount1 = BigNumber.from(0);

    const pool = await this.getPool(erc20Token0, erc20Token1);
    const slot0 = await pool.slot0();

    for (let i = 0; i < positions.length; ++i) {
      const [
        ,
        ,
        ,
        ,
        ,
        tickLower,
        tickUpper,
        liquidity,
        ,
        ,
      ] = await this.positionManager.positions(positions[i]);

      const sqrtRatioAX96 = getSqrtRatioAtTick(tickLower);
      const sqrtRatioBX96 = getSqrtRatioAtTick(tickUpper);

      if (slot0.tick < tickLower) {
        const numerator1 = liquidity.mul(BigNumber.from(2).pow(96));
        const numerator2 = sqrtRatioBX96.sub(sqrtRatioAX96);

        const amount = numerator1.mul(numerator2).div(sqrtRatioBX96).div(sqrtRatioAX96);

        amount0 = amount0.add(amount);
      } else if (slot0.tick < tickUpper) {
        {
          const numerator1 = liquidity.mul(BigNumber.from(2).pow(96));
          const numerator2 = sqrtRatioBX96.sub(slot0.sqrtPriceX96);

          const amount = numerator1.mul(numerator2).div(sqrtRatioBX96).div(slot0.sqrtPriceX96);

          amount0 = amount0.add(amount);
        }
        {
          const Q96 = BigNumber.from(2).pow(96);

          const multiplier = slot0.sqrtPriceX96.sub(sqrtRatioAX96);
          const numerator = liquidity.mul(multiplier);

          const amount = numerator.div(Q96);

          amount1 = amount1.add(amount);
        }
      } else {
        const Q96 = BigNumber.from(2).pow(96);

        const multiplier = sqrtRatioBX96.sub(sqrtRatioAX96);
        const numerator = liquidity.mul(multiplier);

        const amount = numerator.div(Q96);

        amount1 = amount1.add(amount);
      }
    }

    return erc20Token0.address < erc20Token1.address ? [amount0, amount1] : [amount1, amount0];
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

    const price = decodeSqrtX96(sqrtPriceX96, 10);

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
    let key = erc20Token0.address + erc20Token1.address;
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
