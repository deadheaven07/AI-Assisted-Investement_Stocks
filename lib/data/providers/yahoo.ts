import yahooFinance from 'yahoo-finance2';
import {
  StockQuote,
  StockFundamentals,
  DividendHistory,
  PriceHistory,
  HistoryRange,
  DividendRecord,
} from '../types';
import { MarketDataProvider } from '../provider';

export class YahooMarketDataProvider implements MarketDataProvider {
  readonly name = 'yahoo';

  private formatIndianSymbol(symbol: string): string {
    const clean = symbol.trim().toUpperCase();
    if (clean.endsWith('.NS') || clean.endsWith('.BO')) {
      return clean;
    }
    // Default to NSE (.NS) for Indian equities
    return `${clean}.NS`;
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const formatted = this.formatIndianSymbol(symbol);
    try {
      // Suppress console notice from yahoo-finance2
      // @ts-expect-error yahoo-finance2 suppressNotices
      yahooFinance.suppressNotices?.(['yahooSurvey']);

      const q = (await yahooFinance.quote(formatted)) as any;
      if (!q || !q.regularMarketPrice) {
        throw new Error('No quote data');
      }

      return {
        symbol: symbol.toUpperCase(),
        name: q.shortName || q.longName || symbol.toUpperCase(),
        currency: q.currency || 'INR',
        price: Number(q.regularMarketPrice) || 0,
        change: Number(q.regularMarketChange) || 0,
        changePercent: Number(q.regularMarketChangePercent) || 0,
        high52w: q.fiftyTwoWeekHigh ? Number(q.fiftyTwoWeekHigh) : null,
        low52w: q.fiftyTwoWeekLow ? Number(q.fiftyTwoWeekLow) : null,
        marketCap: q.marketCap ? Number(q.marketCap) : null,
        volume: q.regularMarketVolume ? Number(q.regularMarketVolume) : null,
        timestamp: new Date().toISOString(),
        source: 'yahoo-finance',
        isAvailable: true,
      };
    } catch {
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
        source: 'yahoo-finance',
        isAvailable: false,
      };
    }
  }

  async getFundamentals(symbol: string): Promise<StockFundamentals> {
    const formatted = this.formatIndianSymbol(symbol);
    try {
      const summary = (await yahooFinance.quoteSummary(formatted, {
        modules: ['summaryDetail', 'defaultKeyStatistics', 'financialData'],
      })) as any;

      const sd = summary.summaryDetail;
      const ks = summary.defaultKeyStatistics;
      const fd = summary.financialData;

      const eps = ks?.trailingEps ?? null;
      const forwardEps = ks?.forwardEps ?? null;
      const pe = sd?.trailingPE ?? null;
      const totalDebt = fd?.totalDebt ?? null;
      const totalCash = fd?.totalCash ?? null;
      const bookValue = ks?.bookValue ?? null;
      const debtToEquity = fd?.debtToEquity ? fd.debtToEquity / 100 : null; // YF reports percentage
      const annualDiv = sd?.dividendRate ?? null;
      const payoutRatio = sd?.payoutRatio ? sd.payoutRatio * 100 : null;
      const fcf = fd?.freeCashflow ?? null;

      return {
        symbol: symbol.toUpperCase(),
        peRatio: pe,
        epsTrailing: eps,
        forwardEps,
        bookValuePerShare: bookValue,
        totalDebt,
        totalEquity: null, // calculated or inferred
        debtToEquity,
        annualDividendPerShare: annualDiv,
        dividendPayoutRatio: payoutRatio,
        freeCashFlow: fcf,
        lastUpdated: new Date().toISOString(),
        source: 'yahoo-finance',
        isAvailable: true,
      };
    } catch {
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
        source: 'yahoo-finance',
        isAvailable: false,
      };
    }
  }

  async getDividendHistory(symbol: string): Promise<DividendHistory> {
    const formatted = this.formatIndianSymbol(symbol);
    try {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 6);

      const events = (await yahooFinance.historical(formatted, {
        period1: fiveYearsAgo,
        period2: new Date(),
        events: 'dividends',
      })) as any[];

      const dividends: DividendRecord[] = [];
      if (Array.isArray(events)) {
        for (const e of events) {
          if (e.dividends && e.dividends > 0) {
            dividends.push({
              date: new Date(e.date).toISOString().split('T')[0],
              amount: Number(e.dividends),
              currency: 'INR',
            });
          }
        }
      }

      dividends.sort((a, b) => a.date.localeCompare(b.date));

      return {
        symbol: symbol.toUpperCase(),
        dividends,
        source: 'yahoo-finance',
        isAvailable: true,
      };
    } catch {
      return {
        symbol: symbol.toUpperCase(),
        dividends: [],
        source: 'yahoo-finance',
        isAvailable: false,
      };
    }
  }

  async getPriceHistory(symbol: string, range: HistoryRange): Promise<PriceHistory> {
    const formatted = this.formatIndianSymbol(symbol);
    try {
      const now = new Date();
      const past = new Date();

      switch (range) {
        case '1m':
          past.setMonth(now.getMonth() - 1);
          break;
        case '6m':
          past.setMonth(now.getMonth() - 6);
          break;
        case '1y':
          past.setFullYear(now.getFullYear() - 1);
          break;
        case '3y':
          past.setFullYear(now.getFullYear() - 3);
          break;
        case '5y':
          past.setFullYear(now.getFullYear() - 5);
          break;
      }

      const historical = (await yahooFinance.historical(formatted, {
        period1: past,
        period2: now,
      })) as any[];

      const prices = (historical || []).map((h) => ({
        date: new Date(h.date).toISOString().split('T')[0],
        open: Number(h.open) || 0,
        high: Number(h.high) || 0,
        low: Number(h.low) || 0,
        close: Number(h.close) || 0,
        volume: Number(h.volume) || 0,
      }));

      return {
        symbol: symbol.toUpperCase(),
        range,
        prices,
        source: 'yahoo-finance',
        isAvailable: prices.length > 0,
      };
    } catch {
      return {
        symbol: symbol.toUpperCase(),
        range,
        prices: [],
        source: 'yahoo-finance',
        isAvailable: false,
      };
    }
  }
}
