export interface StockQuote {
  symbol: string;
  name: string;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  high52w: number | null;
  low52w: number | null;
  marketCap: number | null;
  volume: number | null;
  timestamp: string; // ISO 8601
  source: string;
  isAvailable: boolean;
}

export interface StockFundamentals {
  symbol: string;
  peRatio: number | null;
  epsTrailing: number | null;
  forwardEps: number | null;
  bookValuePerShare: number | null;
  totalDebt: number | null;
  totalEquity: number | null;
  debtToEquity: number | null;
  annualDividendPerShare: number | null;
  dividendPayoutRatio: number | null;
  freeCashFlow: number | null;
  lastUpdated: string;
  source: string;
  isAvailable: boolean;
}

export interface DividendRecord {
  date: string; // YYYY-MM-DD
  amount: number;
  currency: string;
  type?: 'interim' | 'final' | 'special';
}

export interface DividendHistory {
  symbol: string;
  dividends: DividendRecord[];
  source: string;
  isAvailable: boolean;
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type HistoryRange = '1m' | '6m' | '1y' | '3y' | '5y';

export interface PriceHistory {
  symbol: string;
  range: HistoryRange;
  prices: PricePoint[];
  source: string;
  isAvailable: boolean;
}

export interface ComputedStockMetrics {
  symbol: string;
  currentPrice: number;
  dividendYieldPercent: number | null;
  payoutRatioPercent: number | null;
  fiveYearDividendCagrPercent: number | null;
  peRatio: number | null;
  debtToEquityRatio: number | null;
  oneYearReturnPercent: number | null;
  threeYearReturnPercent: number | null;
  timestamp: string;
  source: string;
  notes: string[];
}
