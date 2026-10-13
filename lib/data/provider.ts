import {
  StockQuote,
  StockFundamentals,
  DividendHistory,
  PriceHistory,
  HistoryRange,
  ComputedStockMetrics,
} from './types';
import { marketCache, CACHE_TTL } from './cache';
import { MockMarketDataProvider } from './providers/mock';
import { YahooMarketDataProvider } from './providers/yahoo';
import { computeAllStockMetrics } from './metrics';

export interface MarketDataProvider {
  readonly name: string;
  getQuote(symbol: string): Promise<StockQuote>;
  getFundamentals(symbol: string): Promise<StockFundamentals>;
  getDividendHistory(symbol: string): Promise<DividendHistory>;
  getPriceHistory(symbol: string, range: HistoryRange): Promise<PriceHistory>;
}

/**
 * Decorator adding in-memory TTL caching and metric helpers to any MarketDataProvider
 */
export class CachedMarketDataProvider implements MarketDataProvider {
  constructor(private readonly inner: MarketDataProvider) {}

  get name(): string {
    return `${this.inner.name} (cached)`;
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const cacheKey = `quote:${symbol.toUpperCase()}`;
    const cached = marketCache.get<StockQuote>(cacheKey);
    if (cached) return cached;

    const data = await this.inner.getQuote(symbol);
    if (data.isAvailable) {
      marketCache.set(cacheKey, data, CACHE_TTL.QUOTE_MS);
    }
    return data;
  }

  async getFundamentals(symbol: string): Promise<StockFundamentals> {
    const cacheKey = `fundamentals:${symbol.toUpperCase()}`;
    const cached = marketCache.get<StockFundamentals>(cacheKey);
    if (cached) return cached;

    const data = await this.inner.getFundamentals(symbol);
    if (data.isAvailable) {
      marketCache.set(cacheKey, data, CACHE_TTL.FUNDAMENTALS_MS);
    }
    return data;
  }

  async getDividendHistory(symbol: string): Promise<DividendHistory> {
    const cacheKey = `dividends:${symbol.toUpperCase()}`;
    const cached = marketCache.get<DividendHistory>(cacheKey);
    if (cached) return cached;

    const data = await this.inner.getDividendHistory(symbol);
    if (data.isAvailable) {
      marketCache.set(cacheKey, data, CACHE_TTL.DIVIDEND_MS);
    }
    return data;
  }

  async getPriceHistory(symbol: string, range: HistoryRange): Promise<PriceHistory> {
    const cacheKey = `prices:${symbol.toUpperCase()}:${range}`;
    const cached = marketCache.get<PriceHistory>(cacheKey);
    if (cached) return cached;

    const data = await this.inner.getPriceHistory(symbol, range);
    if (data.isAvailable) {
      marketCache.set(cacheKey, data, CACHE_TTL.PRICE_HISTORY_MS);
    }
    return data;
  }

  /**
   * High-level helper: Fetches all data and computes structured metrics deterministically
   */
  async getComputedMetrics(symbol: string): Promise<ComputedStockMetrics> {
    const [quote, fundamentals, dividends, price1y, price3y] = await Promise.all([
      this.getQuote(symbol),
      this.getFundamentals(symbol),
      this.getDividendHistory(symbol),
      this.getPriceHistory(symbol, '1y'),
      this.getPriceHistory(symbol, '3y'),
    ]);

    return computeAllStockMetrics(quote, fundamentals, dividends, price1y, price3y);
  }
}

let activeProviderInstance: CachedMarketDataProvider | null = null;

/**
 * Factory function returning the configured market data provider instance.
 * Controlled via DATA_PROVIDER environment variable:
 * - 'yahoo' (Default live NSE/BSE provider via Yahoo Finance)
 * - 'mock'  (Offline zero-network fixture provider for testing/development)
 */
export function getMarketDataProvider(): CachedMarketDataProvider {
  if (activeProviderInstance) {
    return activeProviderInstance;
  }

  const providerType = (process.env.DATA_PROVIDER || 'mock').toLowerCase().trim();
  let baseProvider: MarketDataProvider;

  switch (providerType) {
    case 'yahoo':
      baseProvider = new YahooMarketDataProvider();
      break;
    case 'mock':
    default:
      baseProvider = new MockMarketDataProvider();
      break;
  }

  activeProviderInstance = new CachedMarketDataProvider(baseProvider);
  return activeProviderInstance;
}
