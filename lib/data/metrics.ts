import {
  StockQuote,
  StockFundamentals,
  DividendHistory,
  DividendRecord,
  PriceHistory,
  ComputedStockMetrics,
} from './types';

/**
 * Computes Dividend Yield %: (Annual Dividend / Current Price) * 100
 */
export function computeDividendYield(
  annualDividend: number | null | undefined,
  currentPrice: number
): number | null {
  if (annualDividend === null || annualDividend === undefined || annualDividend < 0) {
    return null;
  }
  if (!currentPrice || currentPrice <= 0) {
    return null;
  }
  return Math.round((annualDividend / currentPrice) * 10000) / 100;
}

/**
 * Computes Payout Ratio %: (Annual Dividend Per Share / EPS) * 100
 * If company is loss-making (EPS <= 0), payout ratio is not meaningful and returns null.
 */
export function computePayoutRatio(
  annualDividendPerShare: number | null | undefined,
  eps: number | null | undefined
): number | null {
  if (
    annualDividendPerShare === null ||
    annualDividendPerShare === undefined ||
    annualDividendPerShare < 0
  ) {
    return null;
  }
  if (!eps || eps <= 0) {
    return null;
  }
  return Math.round((annualDividendPerShare / eps) * 10000) / 100;
}

/**
 * Computes 5-Year Dividend CAGR %:
 * Groups dividends by calendar year, takes earliest base year and latest end year.
 * Formula: ((D_end / D_start) ^ (1 / yearsDiff) - 1) * 100
 */
export function computeDividendCagr(
  dividends: DividendRecord[],
  targetYears = 5
): number | null {
  if (!dividends || dividends.length === 0) return null;

  // Aggregate dividends per year
  const yearlyTotals = new Map<number, number>();
  for (const d of dividends) {
    const yr = new Date(d.date).getFullYear();
    if (isNaN(yr)) continue;
    yearlyTotals.set(yr, (yearlyTotals.get(yr) || 0) + d.amount);
  }

  const sortedYears = Array.from(yearlyTotals.keys()).sort((a, b) => a - b);
  if (sortedYears.length < 2) return null;

  const latestYear = sortedYears[sortedYears.length - 1];
  // Look for target year (e.g. latestYear - targetYears) or closest earlier year
  let startYear: number | null = null;
  for (let i = 0; i < sortedYears.length - 1; i++) {
    const yr = sortedYears[i];
    if (latestYear - yr >= targetYears) {
      startYear = yr;
    }
  }

  // If exact targetYears wasn't reached, pick the earliest available if span is at least 3 years
  if (startYear === null && sortedYears.length >= 3) {
    const earliest = sortedYears[0];
    if (latestYear - earliest >= 3) {
      startYear = earliest;
    }
  }

  if (startYear === null) return null;

  const startDiv = yearlyTotals.get(startYear) || 0;
  const endDiv = yearlyTotals.get(latestYear) || 0;
  const yearsSpan = latestYear - startYear;

  if (startDiv <= 0 || endDiv <= 0 || yearsSpan <= 0) return null;

  const cagr = (Math.pow(endDiv / startDiv, 1 / yearsSpan) - 1) * 100;
  return Math.round(cagr * 100) / 100;
}

/**
 * Computes P/E Ratio: Current Price / Trailing EPS
 */
export function computePeRatio(
  currentPrice: number,
  eps: number | null | undefined
): number | null {
  if (!currentPrice || currentPrice <= 0 || !eps || eps <= 0) {
    return null;
  }
  return Math.round((currentPrice / eps) * 100) / 100;
}

/**
 * Computes Debt to Equity Ratio: Total Debt / Total Equity
 */
export function computeDebtToEquity(
  totalDebt: number | null | undefined,
  totalEquity: number | null | undefined
): number | null {
  if (
    totalDebt === null ||
    totalDebt === undefined ||
    totalDebt < 0 ||
    totalEquity === null ||
    totalEquity === undefined ||
    totalEquity <= 0
  ) {
    return null;
  }
  return Math.round((totalDebt / totalEquity) * 100) / 100;
}

/**
 * Computes Return % from historical price series:
 * ((End Price - Start Price) / Start Price) * 100
 */
export function computeHistoricalReturn(priceHistory?: PriceHistory): number | null {
  if (!priceHistory || !priceHistory.prices || priceHistory.prices.length < 2) {
    return null;
  }
  const first = priceHistory.prices[0].close;
  const last = priceHistory.prices[priceHistory.prices.length - 1].close;

  if (!first || first <= 0 || !last) return null;
  return Math.round(((last - first) / first) * 10000) / 100;
}

/**
 * Aggregates all computed metrics for a stock from raw data structures
 */
export function computeAllStockMetrics(
  quote: StockQuote,
  fundamentals: StockFundamentals,
  dividendHistory: DividendHistory,
  priceHistory1y?: PriceHistory,
  priceHistory3y?: PriceHistory
): ComputedStockMetrics {
  const notes: string[] = [];

  const divYield = computeDividendYield(
    fundamentals.annualDividendPerShare,
    quote.price
  );
  if (divYield === null) {
    notes.push('Dividend yield unavailable or zero dividend declared.');
  }

  const payoutRatio = computePayoutRatio(
    fundamentals.annualDividendPerShare,
    fundamentals.epsTrailing
  );
  if (payoutRatio === null) {
    notes.push('Payout ratio unavailable (loss-making or missing earnings).');
  }

  const cagr = computeDividendCagr(dividendHistory.dividends, 5);
  if (cagr === null) {
    notes.push('5-year dividend CAGR unavailable due to insufficient history.');
  }

  const pe =
    fundamentals.peRatio ?? computePeRatio(quote.price, fundamentals.epsTrailing);

  const deRatio =
    fundamentals.debtToEquity ??
    computeDebtToEquity(fundamentals.totalDebt, fundamentals.totalEquity);

  const ret1y = computeHistoricalReturn(priceHistory1y);
  const ret3y = computeHistoricalReturn(priceHistory3y);

  return {
    symbol: quote.symbol,
    currentPrice: quote.price,
    dividendYieldPercent: divYield,
    payoutRatioPercent: payoutRatio,
    fiveYearDividendCagrPercent: cagr,
    peRatio: pe,
    debtToEquityRatio: deRatio,
    oneYearReturnPercent: ret1y,
    threeYearReturnPercent: ret3y,
    timestamp: new Date().toISOString(),
    source: quote.source,
    notes,
  };
}
