/**
 * Technical Indicators Module
 * Calculates SMA, EMA, RSI, MACD, and Bollinger Bands from price arrays.
 */

/**
 * Simple Moving Average
 */
export function sma(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(Number.NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

/**
 * Exponential Moving Average
 */
export function ema(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(Number.NaN);
    } else if (i === period - 1) {
      // Seed with SMA
      const sum = data.slice(0, period).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    } else {
      const prevEma = result[i - 1];
      result.push(data[i] * multiplier + prevEma * (1 - multiplier));
    }
  }
  return result;
}

/**
 * Relative Strength Index
 */
export function rsi(data: number[], period = 14): number[] {
  const result: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  result.push(Number.NaN); // no RSI for first candle

  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      result.push(Number.NaN);
    } else if (i === period - 1) {
      const avgGain =
        gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
      const avgLoss =
        losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    } else {
      const prevAvgGain =
        (result[i] === undefined || Number.isNaN(result[i])
          ? gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) /
            period
          : 0) + gains[i];

      // Wilder smoothing
      const prevRsi = result[result.length - 1];
      const prevRS =
        prevRsi >= 100 ? Number.POSITIVE_INFINITY : prevRsi / (100 - prevRsi);
      const prevAvgG =
        prevRS *
        (losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period);
      const newAvgGain = (prevAvgG * (period - 1) + gains[i]) / period;
      const newAvgLoss =
        (losses.slice(i - period, i).reduce((a, b) => a + b, 0) * (period - 1) +
          losses[i]) /
        period /
        period;

      void prevAvgGain; // suppress unused

      const avgLoss = newAvgLoss;
      const avgGain = newAvgGain;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }

  return result;
}

/**
 * MACD - Moving Average Convergence Divergence
 */
export function macd(
  data: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEma = ema(data, fastPeriod);
  const slowEma = ema(data, slowPeriod);

  const macdLine: number[] = fastEma.map((f, i) => {
    const s = slowEma[i];
    return Number.isNaN(f) || Number.isNaN(s) ? Number.NaN : f - s;
  });

  const validMacd = macdLine.filter((v) => !Number.isNaN(v));
  const signalLineValues = ema(validMacd, signalPeriod);

  // Re-align signal line with original index
  const signal: number[] = new Array(macdLine.length).fill(Number.NaN);
  let validIdx = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (!Number.isNaN(macdLine[i])) {
      signal[i] = signalLineValues[validIdx] ?? Number.NaN;
      validIdx++;
    }
  }

  const histogram = macdLine.map((m, i) => {
    const s = signal[i];
    return Number.isNaN(m) || Number.isNaN(s) ? Number.NaN : m - s;
  });

  return { macd: macdLine, signal, histogram };
}

/**
 * Bollinger Bands
 */
export function bollingerBands(
  data: number[],
  period = 20,
  stdDevMultiplier = 2,
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = sma(data, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(Number.NaN);
      lower.push(Number.NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = middle[i];
      const variance =
        slice.reduce((sum, v) => sum + (v - mean) ** 2, 0) / period;
      const stdDev = Math.sqrt(variance);
      upper.push(mean + stdDevMultiplier * stdDev);
      lower.push(mean - stdDevMultiplier * stdDev);
    }
  }

  return { upper, middle, lower };
}

/**
 * Volatility (standard deviation of returns)
 */
export function volatility(data: number[], period = 20): number[] {
  const returns: number[] = [Number.NaN];
  for (let i = 1; i < data.length; i++) {
    returns.push((data[i] - data[i - 1]) / data[i - 1]);
  }

  const result: number[] = [];
  for (let i = 0; i < returns.length; i++) {
    if (i < period - 1) {
      result.push(Number.NaN);
    } else {
      const slice = returns
        .slice(i - period + 1, i + 1)
        .filter((v) => !Number.isNaN(v));
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance =
        slice.reduce((sum, v) => sum + (v - mean) ** 2, 0) / slice.length;
      result.push(Math.sqrt(variance) * Math.sqrt(252) * 100); // annualized %
    }
  }
  return result;
}
