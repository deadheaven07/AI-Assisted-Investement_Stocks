# AI-Assisted-Investement_Stocks

## Stock Desk 📈
An AI research assistant for Indian (NSE/BSE) stock and dividend investing, powered by Google Gemini with live market data, mathematical metrics engine, portfolio tracker, screener, alerts, and tax computations.

### Key Highlights
- **Structured Data First**: Mathematical metrics (Dividend Yield, Payout Ratio, 5-Year CAGR, P/E, Debt/Equity, XIRR) are computed deterministically in code with full unit test coverage—the LLM is used strictly to explain findings, never to guess numbers.
- **NSE & BSE Market Data Layer**: Pluggable provider interface (`MarketDataProvider`) with multi-tier TTL caching (quotes 1 min, fundamentals 24 hours), automated fallback, and graceful "data unavailable" states.
- **Function Calling with Gemini**: Model invokes verified financial tools (`getQuote`, `getFundamentals`, `getDividendHistory`, `getPriceHistory`) to fetch ground-truth structured data.
- **SEBI Educational Notice**: Educational information only; not SEBI-registered investment advice.
