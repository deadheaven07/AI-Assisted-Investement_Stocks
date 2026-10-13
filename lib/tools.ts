import { getMarketDataProvider } from './data/provider';
import { HistoryRange } from './data/types';

export const STOCK_TOOLS_DECLARATIONS = [
  {
    name: 'get_computed_stock_metrics',
    description:
      'Fetches pre-computed ground-truth financial metrics for an Indian stock (NSE/BSE), including current price, dividend yield, payout ratio, 5-year dividend CAGR, P/E ratio, debt-to-equity, and historical returns. All numbers are computed in code from structured data.',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'The stock ticker symbol (e.g., ITC, TCS, INFY, RELIANCE, IOC, HDFCBANK).',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_stock_quote',
    description: 'Fetches the latest market price, day change, 52-week high/low, and market cap for an Indian stock.',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'The stock ticker symbol (e.g. ITC, TCS, INFY).',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_stock_fundamentals',
    description: 'Fetches balance sheet and accounting fundamentals: trailing EPS, P/E, total debt, total equity, and annual dividend per share.',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'The stock ticker symbol (e.g. ITC, TCS, RELIANCE).',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_dividend_history',
    description: 'Fetches historical dividend payments with exact dates and payout amounts in INR.',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'The stock ticker symbol (e.g. ITC, IOC, TCS).',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_price_history',
    description: 'Fetches historical price series over a given time range (1m, 6m, 1y, 3y, 5y).',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'The stock ticker symbol.',
        },
        range: {
          type: 'string',
          enum: ['1m', '6m', '1y', '3y', '5y'],
          description: 'Historical range (default: 1y).',
        },
      },
      required: ['symbol'],
    },
  },
];

/**
 * Dispatches a tool call to the market data provider and returns the verified structured result
 */
export async function executeStockTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const provider = getMarketDataProvider();
  const symbol = String(args.symbol || '').trim().toUpperCase();

  switch (toolName) {
    case 'get_computed_stock_metrics': {
      const metrics = await provider.getComputedMetrics(symbol);
      return {
        success: true,
        data: metrics,
      };
    }
    case 'get_stock_quote': {
      const quote = await provider.getQuote(symbol);
      return {
        success: true,
        data: quote,
      };
    }
    case 'get_stock_fundamentals': {
      const fundamentals = await provider.getFundamentals(symbol);
      return {
        success: true,
        data: fundamentals,
      };
    }
    case 'get_dividend_history': {
      const dividends = await provider.getDividendHistory(symbol);
      return {
        success: true,
        data: dividends,
      };
    }
    case 'get_price_history': {
      const range = (String(args.range || '1y') as HistoryRange);
      const prices = await provider.getPriceHistory(symbol, range);
      return {
        success: true,
        data: prices,
      };
    }
    default:
      return {
        success: false,
        error: `Unknown tool: ${toolName}`,
      };
  }
}
