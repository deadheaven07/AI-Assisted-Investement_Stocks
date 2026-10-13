import test from 'node:test';
import assert from 'node:assert/strict';
import { MockMarketDataProvider } from './providers/mock';
import { CachedMarketDataProvider } from './provider';

test('MockMarketDataProvider returns structured quote and fundamentals for ITC', async () => {
  const provider = new MockMarketDataProvider();
  const quote = await provider.getQuote('ITC');

  assert.equal(quote.symbol, 'ITC');
  assert.equal(quote.currency, 'INR');
  assert.ok(quote.price > 400);
  assert.equal(quote.isAvailable, true);

  const fundamentals = await provider.getFundamentals('ITC');
  assert.equal(fundamentals.symbol, 'ITC');
  assert.equal(fundamentals.debtToEquity, 0);
  assert.ok(fundamentals.annualDividendPerShare! > 10);
});

test('MockMarketDataProvider gracefully returns unavailable state for unknown symbol', async () => {
  const provider = new MockMarketDataProvider();
  const quote = await provider.getQuote('UNKNOWNXYZ');

  assert.equal(quote.isAvailable, false);
  assert.equal(quote.price, 0);

  const fund = await provider.getFundamentals('UNKNOWNXYZ');
  assert.equal(fund.isAvailable, false);
  assert.equal(fund.peRatio, null);
});

test('CachedMarketDataProvider caches responses and computes metrics deterministically', async () => {
  const baseProvider = new MockMarketDataProvider();
  const cachedProvider = new CachedMarketDataProvider(baseProvider);

  const metrics = await cachedProvider.getComputedMetrics('TCS');
  assert.equal(metrics.symbol, 'TCS');
  assert.ok(metrics.currentPrice > 3000);
  assert.ok(metrics.dividendYieldPercent !== null && metrics.dividendYieldPercent > 1.0);
  assert.ok(metrics.payoutRatioPercent !== null && metrics.payoutRatioPercent > 40);
  assert.ok(metrics.peRatio !== null && metrics.peRatio > 20);
  assert.ok(metrics.fiveYearDividendCagrPercent !== null);
  assert.equal(metrics.debtToEquityRatio, 0.09);
});
