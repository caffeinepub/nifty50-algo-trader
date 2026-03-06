import type { Candle, Strategy } from "../backend.d";
import { sma } from "./indicators";

export interface BacktestTrade {
  entryIndex: number;
  exitIndex: number;
  entryPrice: number;
  exitPrice: number;
  side: "BUY" | "SELL";
  pnl: number;
  exitReason: "TARGET" | "STOPLOSS" | "SIGNAL";
}

export interface BacktestMetrics {
  totalPnl: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  equityCurve: { index: number; equity: number }[];
  trades: BacktestTrade[];
}

export function runBacktest(
  candles: Candle[],
  strategy: Strategy,
): BacktestMetrics {
  const closes = candles.map((c) => c.close);
  const shortWindow = Number(strategy.shortWindow);
  const longWindow = Number(strategy.longWindow);
  const stopLossPercent = strategy.stopLossPercent / 100;
  const targetPercent = strategy.targetPercent / 100;
  const positionSize = Number(strategy.positionSize);

  const shortSma = sma(closes, shortWindow);
  const longSma = sma(closes, longWindow);

  const trades: BacktestTrade[] = [];
  let inTrade = false;
  let entryPrice = 0;
  let entryIndex = 0;
  let equity = 100000; // starting capital
  const equityCurve: { index: number; equity: number }[] = [
    { index: 0, equity },
  ];

  for (let i = longWindow; i < closes.length; i++) {
    const prevShort = shortSma[i - 1];
    const prevLong = longSma[i - 1];
    const currShort = shortSma[i];
    const currLong = longSma[i];

    if (
      Number.isNaN(prevShort) ||
      Number.isNaN(prevLong) ||
      Number.isNaN(currShort) ||
      Number.isNaN(currLong)
    )
      continue;

    if (!inTrade) {
      // Bullish crossover: short crosses above long
      if (prevShort <= prevLong && currShort > currLong) {
        inTrade = true;
        entryPrice = closes[i];
        entryIndex = i;
      }
    } else {
      const currentPrice = closes[i];
      const pnlPercent = (currentPrice - entryPrice) / entryPrice;

      // Check stop loss
      if (pnlPercent <= -stopLossPercent) {
        const pnl = pnlPercent * positionSize * entryPrice;
        trades.push({
          entryIndex,
          exitIndex: i,
          entryPrice,
          exitPrice: currentPrice,
          side: "BUY",
          pnl,
          exitReason: "STOPLOSS",
        });
        equity += pnl;
        equityCurve.push({ index: i, equity });
        inTrade = false;
        continue;
      }

      // Check target
      if (pnlPercent >= targetPercent) {
        const pnl = pnlPercent * positionSize * entryPrice;
        trades.push({
          entryIndex,
          exitIndex: i,
          entryPrice,
          exitPrice: currentPrice,
          side: "BUY",
          pnl,
          exitReason: "TARGET",
        });
        equity += pnl;
        equityCurve.push({ index: i, equity });
        inTrade = false;
        continue;
      }

      // Bearish crossover: short crosses below long
      if (prevShort >= prevLong && currShort < currLong) {
        const pnl = pnlPercent * positionSize * entryPrice;
        trades.push({
          entryIndex,
          exitIndex: i,
          entryPrice,
          exitPrice: currentPrice,
          side: "BUY",
          pnl,
          exitReason: "SIGNAL",
        });
        equity += pnl;
        equityCurve.push({ index: i, equity });
        inTrade = false;
      }
    }
  }

  // Close any open trade at end
  if (inTrade && closes.length > 0) {
    const exitPrice = closes[closes.length - 1];
    const pnlPercent = (exitPrice - entryPrice) / entryPrice;
    const pnl = pnlPercent * positionSize * entryPrice;
    trades.push({
      entryIndex,
      exitIndex: closes.length - 1,
      entryPrice,
      exitPrice,
      side: "BUY",
      pnl,
      exitReason: "SIGNAL",
    });
    equity += pnl;
    equityCurve.push({ index: closes.length - 1, equity });
  }

  // Calculate metrics
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const wins = trades.filter((t) => t.pnl > 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;

  // Max drawdown
  let peak = 100000;
  let maxDrawdown = 0;
  let runningEquity = 100000;
  for (const trade of trades) {
    runningEquity += trade.pnl;
    if (runningEquity > peak) peak = runningEquity;
    const drawdown = ((peak - runningEquity) / peak) * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  // Sharpe ratio (simplified: mean return / std dev of returns, annualized)
  const returns = trades.map((t) => t.pnl / (positionSize * t.entryPrice));
  const meanReturn =
    returns.length > 0
      ? returns.reduce((a, b) => a + b, 0) / returns.length
      : 0;
  const stdReturn =
    returns.length > 1
      ? Math.sqrt(
          returns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) /
            (returns.length - 1),
        )
      : 0;
  const sharpeRatio =
    stdReturn === 0 ? 0 : (meanReturn / stdReturn) * Math.sqrt(252);

  return {
    totalPnl,
    winRate,
    maxDrawdown,
    sharpeRatio,
    totalTrades: trades.length,
    equityCurve,
    trades,
  };
}
