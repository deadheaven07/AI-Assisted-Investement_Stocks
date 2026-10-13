import {
  StockQuote,
  StockFundamentals,
  DividendHistory,
  PriceHistory,
  HistoryRange,
} from '../types';
import { MarketDataProvider } from '../provider';

interface MockStockData {
  quote: Omit<StockQuote, 'timestamp' | 'source' | 'isAvailable'>;
  fundamentals: Omit<StockFundamentals, 'lastUpdated' | 'source' | 'isAvailable'>;
  dividends: { date: string; amount: number; currency: string }[];
  basePrice: number;
}

const MOCK_DB: Record<string, MockStockData> = {
  ITC: {
    basePrice: 485.5,
    quote: {
      symbol: 'ITC',
      name: 'ITC Limited',
      currency: 'INR',
      price: 485.5,
      change: 3.2,
      changePercent: 0.66,
      high52w: 528.5,
      low52w: 399.3,
      marketCap: 6060000000000, // ~6 Lakh Cr
      volume: 12500000,
    },
    fundamentals: {
      symbol: 'ITC',
      peRatio: 29.2,
      epsTrailing: 16.62,
      forwardEps: 18.2,
      bookValuePerShare: 58.4,
      totalDebt: 350000000, // virtually debt free
      totalEquity: 728000000000,
      debtToEquity: 0.00,
      annualDividendPerShare: 14.75, // ~3.04% yield
      dividendPayoutRatio: 88.7,
      freeCashFlow: 185000000000,
    },
    dividends: [
      { date: '2020-07-06', amount: 10.15, currency: 'INR' },
      { date: '2021-06-10', amount: 10.75, currency: 'INR' },
      { date: '2022-05-27', amount: 11.5, currency: 'INR' },
      { date: '2023-05-30', amount: 12.75, currency: 'INR' },
      { date: '2024-05-28', amount: 13.75, currency: 'INR' },
      { date: '2025-06-04', amount: 14.75, currency: 'INR' },
    ],
  },
  TCS: {
    basePrice: 4120.0,
    quote: {
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      currency: 'INR',
      price: 4120.0,
      change: -12.5,
      changePercent: -0.3,
      high52w: 4592.25,
      low52w: 3700.0,
      marketCap: 14900000000000, // ~14.9 Lakh Cr
      volume: 1800000,
    },
    fundamentals: {
      symbol: 'TCS',
      peRatio: 31.8,
      epsTrailing: 129.5,
      forwardEps: 142.0,
      bookValuePerShare: 260.0,
      totalDebt: 78000000000,
      totalEquity: 900000000000,
      debtToEquity: 0.09,
      annualDividendPerShare: 73.0,
      dividendPayoutRatio: 56.4,
      freeCashFlow: 440000000000,
    },
    dividends: [
      { date: '2020-06-18', amount: 37.0, currency: 'INR' },
      { date: '2021-06-16', amount: 38.0, currency: 'INR' },
      { date: '2022-06-15', amount: 43.0, currency: 'INR' },
      { date: '2023-06-15', amount: 52.0, currency: 'INR' },
      { date: '2024-06-14', amount: 63.0, currency: 'INR' },
      { date: '2025-06-12', amount: 73.0, currency: 'INR' },
    ],
  },
  INFY: {
    basePrice: 1885.0,
    quote: {
      symbol: 'INFY',
      name: 'Infosys Limited',
      currency: 'INR',
      price: 1885.0,
      change: 18.0,
      changePercent: 0.96,
      high52w: 1990.0,
      low52w: 1358.35,
      marketCap: 7820000000000,
      volume: 4500000,
    },
    fundamentals: {
      symbol: 'INFY',
      peRatio: 29.4,
      epsTrailing: 64.1,
      forwardEps: 72.0,
      bookValuePerShare: 215.0,
      totalDebt: 85000000000,
      totalEquity: 820000000000,
      debtToEquity: 0.10,
      annualDividendPerShare: 46.0,
      dividendPayoutRatio: 71.8,
      freeCashFlow: 235000000000,
    },
    dividends: [
      { date: '2020-05-29', amount: 17.5, currency: 'INR' },
      { date: '2021-05-31', amount: 20.0, currency: 'INR' },
      { date: '2022-05-31', amount: 24.0, currency: 'INR' },
      { date: '2023-06-02', amount: 30.0, currency: 'INR' },
      { date: '2024-05-31', amount: 36.0, currency: 'INR' },
      { date: '2025-05-30', amount: 46.0, currency: 'INR' },
    ],
  },
  RELIANCE: {
    basePrice: 2840.0,
    quote: {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Limited',
      currency: 'INR',
      price: 2840.0,
      change: 14.5,
      changePercent: 0.51,
      high52w: 3217.9,
      low52w: 2221.0,
      marketCap: 19200000000000,
      volume: 6800000,
    },
    fundamentals: {
      symbol: 'RELIANCE',
      peRatio: 26.8,
      epsTrailing: 105.9,
      forwardEps: 118.0,
      bookValuePerShare: 1150.0,
      totalDebt: 3200000000000,
      totalEquity: 8400000000000,
      debtToEquity: 0.38,
      annualDividendPerShare: 10.0,
      dividendPayoutRatio: 9.4,
      freeCashFlow: 350000000000,
    },
    dividends: [
      { date: '2020-07-02', amount: 6.5, currency: 'INR' },
      { date: '2021-06-11', amount: 7.0, currency: 'INR' },
      { date: '2022-06-14', amount: 8.0, currency: 'INR' },
      { date: '2023-06-19', amount: 9.0, currency: 'INR' },
      { date: '2024-06-20', amount: 10.0, currency: 'INR' },
    ],
  },
  IOC: {
    basePrice: 142.5,
    quote: {
      symbol: 'IOC',
      name: 'Indian Oil Corporation',
      currency: 'INR',
      price: 142.5,
      change: -0.8,
      changePercent: -0.56,
      high52w: 196.8,
      low52w: 122.4,
      marketCap: 2010000000000,
      volume: 18000000,
    },
    fundamentals: {
      symbol: 'IOC',
      peRatio: 9.2,
      epsTrailing: 15.5,
      forwardEps: 16.2,
      bookValuePerShare: 135.0,
      totalDebt: 1200000000000,
      totalEquity: 1850000000000,
      debtToEquity: 0.65,
      annualDividendPerShare: 10.0, // ~7.0% yield
      dividendPayoutRatio: 64.5,
      freeCashFlow: 140000000000,
    },
    dividends: [
      { date: '2020-03-20', amount: 4.25, currency: 'INR' },
      { date: '2021-03-24', amount: 6.0, currency: 'INR' },
      { date: '2022-03-22', amount: 7.5, currency: 'INR' },
      { date: '2023-03-23', amount: 8.0, currency: 'INR' },
      { date: '2024-03-21', amount: 9.0, currency: 'INR' },
      { date: '2025-03-25', amount: 10.0, currency: 'INR' },
    ],
  },
  HDFCBANK: {
    basePrice: 1680.0,
    quote: {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Limited',
      currency: 'INR',
      price: 1680.0,
      change: 8.5,
      changePercent: 0.51,
      high52w: 1794.0,
      low52w: 1363.45,
      marketCap: 12800000000000,
      volume: 14000000,
    },
    fundamentals: {
      symbol: 'HDFCBANK',
      peRatio: 18.9,
      epsTrailing: 88.8,
      forwardEps: 102.0,
      bookValuePerShare: 590.0,
      totalDebt: 2800000000000, // Bank liabilities
      totalEquity: 4400000000000,
      debtToEquity: 0.64,
      annualDividendPerShare: 19.5,
      dividendPayoutRatio: 22.0,
      freeCashFlow: null, // Banks do not report standard FCF
    },
    dividends: [
      { date: '2021-06-25', amount: 6.5, currency: 'INR' },
      { date: '2022-05-12', amount: 15.5, currency: 'INR' },
      { date: '2023-05-15', amount: 19.0, currency: 'INR' },
      { date: '2024-05-10', amount: 19.5, currency: 'INR' },
    ],
  },
};

export class MockMarketDataProvider implements MarketDataProvider {
  readonly name = 'mock';

  private normalizeSymbol(symbol: string): string {
    return symbol.toUpperCase().replace(/\.(NS|BO)$/, '').trim();
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const key = this.normalizeSymbol(symbol);
    const item = MOCK_DB[key];
    if (!item) {
      return {
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase(),
        currency: 'INR',
        price: 0,
        change: 0,
        changePercent: 0,
        high52w: null,
        low52w: null,
        marketCap: null,
        volume: null,
        timestamp: new Date().toISOString(),
        source: 'mock',
        isAvailable: false,
      };
    }

    return {
      ...item.quote,
      timestamp: new Date().toISOString(),
      source: 'mock',
      isAvailable: true,
    };
  }

  async getFundamentals(symbol: string): Promise<StockFundamentals> {
    const key = this.normalizeSymbol(symbol);
    const item = MOCK_DB[key];
    if (!item) {
      return {
        symbol: symbol.toUpperCase(),
        peRatio: null,
        epsTrailing: null,
        forwardEps: null,
        bookValuePerShare: null,
        totalDebt: null,
        totalEquity: null,
        debtToEquity: null,
        annualDividendPerShare: null,
        dividendPayoutRatio: null,
        freeCashFlow: null,
        lastUpdated: new Date().toISOString(),
        source: 'mock',
        isAvailable: false,
      };
    }

    return {
      ...item.fundamentals,
      lastUpdated: new Date().toISOString(),
      source: 'mock',
      isAvailable: true,
    };
  }

  async getDividendHistory(symbol: string): Promise<DividendHistory> {
    const key = this.normalizeSymbol(symbol);
    const item = MOCK_DB[key];
    if (!item) {
      return {
        symbol: symbol.toUpperCase(),
        dividends: [],
        source: 'mock',
        isAvailable: false,
      };
    }

    return {
      symbol: item.quote.symbol,
      dividends: item.dividends,
      source: 'mock',
      isAvailable: true,
    };
  }

  async getPriceHistory(symbol: string, range: HistoryRange): Promise<PriceHistory> {
    const key = this.normalizeSymbol(symbol);
    const item = MOCK_DB[key];
    if (!item) {
      return {
        symbol: symbol.toUpperCase(),
        range,
        prices: [],
        source: 'mock',
        isAvailable: false,
      };
    }

    // Generate deterministic historical points based on basePrice
    const now = new Date();
    const monthsMap: Record<HistoryRange, number> = {
      '1m': 1,
      '6m': 6,
      '1y': 12,
      '3y': 36,
      '5y': 60,
    };
    const totalMonths = monthsMap[range] || 12;
    const pointsCount = Math.min(60, totalMonths * 2);
    const prices = [];

    for (let i = pointsCount; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * (totalMonths * 15 / pointsCount));
      const trendFactor = 1 - (i / pointsCount) * 0.25; // 25% growth over range
      const close = Math.round(item.basePrice * trendFactor * 100) / 100;
      prices.push({
        date: d.toISOString().split('T')[0],
        open: close * 0.99,
        high: close * 1.015,
        low: close * 0.985,
        close,
        volume: Math.round(item.quote.volume! / 20),
      });
    }

    return {
      symbol: item.quote.symbol,
      range,
      prices,
      source: 'mock',
      isAvailable: true,
    };
  }
}
