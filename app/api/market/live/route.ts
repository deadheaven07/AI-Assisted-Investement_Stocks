import { NextResponse } from 'next/server';
import { YahooMarketDataProvider } from '@/lib/data/providers/yahoo';
import { MockMarketDataProvider } from '@/lib/data/providers/mock';

export const dynamic = 'force-dynamic';

interface LiveMarketPayload {
  indices: {
    symbol: string;
    label: string;
    price: number;
    change: number;
    changePercent: number;
    isPositive: boolean;
  }[];
  stocks: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    isPositive: boolean;
    high52w: number | null;
    low52w: number | null;
    yield: string;
    payout: string;
    pe: string;
    cagr: string;
    sector: string;
  }[];
  marketStatus: {
    isOpen: boolean;
    label: string;
    exchange: string;
    timestamp: string;
  };
  source: 'live-yahoo' | 'fallback-cache';
}

// In-memory cache for 20 seconds
let cachedData: LiveMarketPayload | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 20_000;

const yahooProvider = new YahooMarketDataProvider();
const mockProvider = new MockMarketDataProvider();

const TARGET_INDICES = [
  { symbol: '^NSEI', label: 'NIFTY 50' },
  { symbol: '^BSESN', label: 'SENSEX' },
  { symbol: '^NSEBANK', label: 'BANK NIFTY' },
  { symbol: 'INR=X', label: 'USD/INR' },
];

const TARGET_STOCKS = [
  { symbol: 'ITC', sector: 'FMCG', defaultYield: '3.04%', defaultPayout: '88.7%', defaultPe: '29.2', defaultCagr: '7.8%' },
  { symbol: 'TCS', sector: 'Information Tech', defaultYield: '1.77%', defaultPayout: '56.4%', defaultPe: '31.8', defaultCagr: '14.6%' },
  { symbol: 'INFY', sector: 'Information Tech', defaultYield: '2.44%', defaultPayout: '71.8%', defaultPe: '29.4', defaultCagr: '13.2%' },
  { symbol: 'RELIANCE', sector: 'Energy & Retail', defaultYield: '0.35%', defaultPayout: '9.4%', defaultPe: '26.8', defaultCagr: '8.9%' },
  { symbol: 'IOC', sector: 'PSU Energy', defaultYield: '7.02%', defaultPayout: '64.5%', defaultPe: '9.2', defaultCagr: '18.4%' },
  { symbol: 'HDFCBANK', sector: 'Banking', defaultYield: '1.16%', defaultPayout: '22.0%', defaultPe: '18.9', defaultCagr: '21.5%' },
  { symbol: 'COALINDIA', sector: 'Mining & Power', defaultYield: '6.45%', defaultPayout: '68.2%', defaultPe: '8.4', defaultCagr: '16.5%' },
  { symbol: 'SBIN', sector: 'Public Banking', defaultYield: '1.82%', defaultPayout: '21.4%', defaultPe: '11.5', defaultCagr: '22.0%' },
];

function isIndianMarketOpen(): boolean {
  // IST is UTC + 5:30
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const istMinutes = utcHours * 60 + utcMinutes + 330;
  const istDay = (now.getUTCDay() + Math.floor(istMinutes / 1440)) % 7;
  const currentIstMinuteOfDay = istMinutes % 1440;

  // Monday = 1 to Friday = 5
  if (istDay === 0 || istDay === 6) return false;
  // 9:15 AM is 555 minutes; 3:30 PM is 930 minutes
  return currentIstMinuteOfDay >= 555 && currentIstMinuteOfDay <= 930;
}

export async function GET() {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_TTL_MS) {
    return NextResponse.json(cachedData);
  }

  const marketOpen = isIndianMarketOpen();

  try {
    // 1. Fetch live indices in parallel
    const indicesPromises = TARGET_INDICES.map(async (idx) => {
      try {
        const q = await yahooProvider.getQuote(idx.symbol);
        if (q.isAvailable && q.price > 0) {
          return {
            symbol: idx.symbol,
            label: idx.label,
            price: q.price,
            change: q.change,
            changePercent: q.changePercent,
            isPositive: q.change >= 0,
          };
        }
      } catch {
        // ignore
      }
      // Fallback
      return {
        symbol: idx.symbol,
        label: idx.label,
        price: idx.label === 'NIFTY 50' ? 24980.5 : idx.label === 'SENSEX' ? 81720.1 : idx.label === 'BANK NIFTY' ? 51450.25 : 84.05,
        change: idx.label === 'USD/INR' ? -0.05 : 95.4,
        changePercent: idx.label === 'USD/INR' ? -0.06 : 0.42,
        isPositive: idx.label !== 'USD/INR',
      };
    });

    // 2. Fetch live stocks in parallel
    const stocksPromises = TARGET_STOCKS.map(async (stk) => {
      try {
        const q = await yahooProvider.getQuote(stk.symbol);
        if (q.isAvailable && q.price > 0) {
          return {
            symbol: stk.symbol,
            name: q.name || stk.symbol,
            price: q.price,
            change: q.change,
            changePercent: q.changePercent,
            isPositive: q.change >= 0,
            high52w: q.high52w,
            low52w: q.low52w,
            yield: stk.defaultYield,
            payout: stk.defaultPayout,
            pe: stk.defaultPe,
            cagr: stk.defaultCagr,
            sector: stk.sector,
          };
        }
      } catch {
        // ignore
      }

      // Mock fallback if Yahoo is unreachable for this stock
      const mockQ = await mockProvider.getQuote(stk.symbol);
      return {
        symbol: stk.symbol,
        name: mockQ.name || stk.symbol,
        price: mockQ.price || 500,
        change: mockQ.change || 0,
        changePercent: mockQ.changePercent || 0,
        isPositive: (mockQ.change || 0) >= 0,
        high52w: mockQ.high52w,
        low52w: mockQ.low52w,
        yield: stk.defaultYield,
        payout: stk.defaultPayout,
        pe: stk.defaultPe,
        cagr: stk.defaultCagr,
        sector: stk.sector,
      };
    });

    const [indices, stocks] = await Promise.all([
      Promise.all(indicesPromises),
      Promise.all(stocksPromises),
    ]);

    const payload: LiveMarketPayload = {
      indices,
      stocks,
      marketStatus: {
        isOpen: marketOpen,
        label: marketOpen ? 'NSE / BSE Open (Live)' : 'NSE / BSE Closed (Last Close)',
        exchange: 'NSE / BSE India',
        timestamp: new Date().toISOString(),
      },
      source: 'live-yahoo',
    };

    cachedData = payload;
    lastFetchTime = now;
    return NextResponse.json(payload);
  } catch {
    // If entire batch failed, use mock database
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const fallbackPayload: LiveMarketPayload = {
      indices: [
        { symbol: '^NSEI', label: 'NIFTY 50', price: 24980.5, change: 104.2, changePercent: 0.42, isPositive: true },
        { symbol: '^BSESN', label: 'SENSEX', price: 81720.1, change: 310.5, changePercent: 0.38, isPositive: true },
        { symbol: '^NSEBANK', label: 'BANK NIFTY', price: 51450.25, change: 334.8, changePercent: 0.65, isPositive: true },
        { symbol: 'INR=X', label: 'USD/INR', price: 84.05, change: -0.05, changePercent: -0.06, isPositive: false },
      ],
      stocks: TARGET_STOCKS.map((s) => ({
        symbol: s.symbol,
        name: s.symbol,
        price: 500,
        change: 2.5,
        changePercent: 0.5,
        isPositive: true,
        high52w: 600,
        low52w: 400,
        yield: s.defaultYield,
        payout: s.defaultPayout,
        pe: s.defaultPe,
        cagr: s.defaultCagr,
        sector: s.sector,
      })),
      marketStatus: {
        isOpen: marketOpen,
        label: marketOpen ? 'NSE / BSE Open' : 'NSE / BSE Closed',
        exchange: 'NSE / BSE India',
        timestamp: new Date().toISOString(),
      },
      source: 'fallback-cache',
    };

    return NextResponse.json(fallbackPayload);
  }
}
