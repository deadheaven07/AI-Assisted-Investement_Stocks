import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDividendYield,
  computePayoutRatio,
  computeDividendCagr,
  computePeRatio,
  computeDebtToEquity,
  computeHistoricalReturn,
  computeAllStockMetrics,
} from './metrics';
import { StockQuote, StockFundamentals, DividendHistory, PriceHistory } from './types';

test('computeDividendYield calculates percentage correctly', () => {
  // ITC at ₹500 paying ₹15 dividend = 3.00%
  const y = computeDividendYield(15, 500);
  assert.equal(y, 3.0);

  // IOC at ₹140 paying ₹7 dividend = 5.00%
  const y2 = computeDividendYield(7, 140);
  assert.equal(y2, 5.0);

  // Missing or negative dividend
  assert.equal(computeDividendYield(null, 500), null);
  assert.equal(computeDividendYield(-5, 500), null);
  assert.equal(computeDividendYield(15, 0), null);
});

test('computePayoutRatio calculates payout percentage and handles loss-makers', () => {
  // ₹30 dividend on ₹100 EPS = 30.00%
  const p = computePayoutRatio(30, 100);
  assert.equal(p, 30.0);

  // ₹10 dividend on negative EPS (loss-making company) -> null
  assert.equal(computePayoutRatio(10, -50), null);
  assert.equal(computePayoutRatio(10, 0), null);
  assert.equal(computePayoutRatio(null, 100), null);
});

test('computeDividendCagr calculates 5-year growth rate accurately', () => {
  // Dividends: 2019: ₹10, 2020: ₹11, 2021: ₹12.5, 2022: ₹14, 2023: ₹15, 2024: ₹16.1
  // 5-year span: 2019 (10) to 2024 (16.1051) -> (16.1051 / 10)^(1/5) - 1 ≈ 10%
  const dividends = [
    { date: '2019-03-15', amount: 10, currency: 'INR' },
    { date: '2020-03-15', amount: 11, currency: 'INR' },
    { date: '2021-03-15', amount: 12.1, currency: 'INR' },
    { date: '2022-03-15', amount: 13.31, currency: 'INR' },
    { date: '2023-03-15', amount: 14.64, currency: 'INR' },
    { date: '2024-03-15', amount: 16.1051, currency: 'INR' },
  ];
  const cagr = computeDividendCagr(dividends, 5);
  assert.ok(cagr !== null);
  assert.equal(Math.round(cagr), 10);

  // Single year of dividends -> insufficient history
  assert.equal(computeDividendCagr([{ date: '2024-01-01', amount: 10, currency: 'INR' }]), null);
  assert.equal(computeDividendCagr([]), null);
});

test('computePeRatio calculates P/E and guards against non-positive EPS', () => {
  // Price 3000, EPS 120 -> PE 25.0
  assert.equal(computePeRatio(3000, 120), 25.0);

  // Loss-making company
  assert.equal(computePeRatio(3000, -20), null);
  assert.equal(computePeRatio(3000, 0), null);
  assert.equal(computePeRatio(0, 120), null);
});

test('computeDebtToEquity calculates leverage and guards against negative equity', () => {
  // Debt 50,000 Cr, Equity 100,000 Cr -> 0.5
  assert.equal(computeDebtToEquity(50000, 100000), 0.5);

  // Zero debt
  assert.equal(computeDebtToEquity(0, 100000), 0);

  // Negative equity (balance sheet distress)
  assert.equal(computeDebtToEquity(50000, -10000), null);
  assert.equal(computeDebtToEquity(50000, 0), null);
});

test('computeHistoricalReturn calculates price gain/loss percentage', () => {
  const priceHistory: PriceHistory = {
    symbol: 'TCS',
    range: '1y',
    source: 'test',
    isAvailable: true,
    prices: [
      { date: '2025-01-01', open: 3500, high: 3600, low: 3400, close: 3500, volume: 1000 },
      { date: '2026-01-01', open: 4200, high: 4300, low: 4100, close: 4200, volume: 1200 },
    ],
  };

  // (4200 - 3500) / 3500 = 700 / 3500 = 20.00%
  assert.equal(computeHistoricalReturn(priceHistory), 20.0);
});

test('computeAllStockMetrics bundles metrics with warnings when data is missing', () => {
  const quote: StockQuote = {
    symbol: 'INFY',
    name: 'Infosys Limited',
    currency: 'INR',
    price: 1800,
    change: 15,
    changePercent: 0.84,
    high52w: 2000,
    low52w: 1350,
    marketCap: 750000000000,
    volume: 5000000,
    timestamp: '2026-10-13T10:00:00Z',
    source: 'mock',
    isAvailable: true,
  };

  const fundamentals: StockFundamentals = {
    symbol: 'INFY',
    peRatio: 28.5,
    epsTrailing: 63.15,
    forwardEps: 70,
    bookValuePerShare: 220,
    totalDebt: 9000,
    totalEquity: 85000,
    debtToEquity: 0.11,
    annualDividendPerShare: 46,
    dividendPayoutRatio: 72.8,
    freeCashFlow: 23000,
    lastUpdated: '2026-10-13T10:00:00Z',
    source: 'mock',
    isAvailable: true,
  };

  const dividendHistory: DividendHistory = {
    symbol: 'INFY',
    source: 'mock',
    isAvailable: true,
    dividends: [
      { date: '2020-06-15', amount: 17.5, currency: 'INR' },
      { date: '2021-06-15', amount: 20, currency: 'INR' },
      { date: '2022-06-15', amount: 24, currency: 'INR' },
      { date: '2023-06-15', amount: 30, currency: 'INR' },
      { date: '2024-06-15', amount: 35, currency: 'INR' },
      { date: '2025-06-15', amount: 46, currency: 'INR' },
    ],
  };

  const metrics = computeAllStockMetrics(quote, fundamentals, dividendHistory);

  assert.equal(metrics.symbol, 'INFY');
  assert.equal(metrics.currentPrice, 1800);
  assert.equal(metrics.dividendYieldPercent, 2.56); // 46 / 1800 * 100 = 2.5555 -> 2.56%
  assert.equal(metrics.payoutRatioPercent, 72.84);  // 46 / 63.15 * 100 = 72.84%
  assert.ok(metrics.fiveYearDividendCagrPercent !== null);
  assert.equal(metrics.debtToEquityRatio, 0.11);
  assert.equal(metrics.peRatio, 28.5);
});
