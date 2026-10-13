# AI-Assisted-Investement_Stocks

## Stock Desk 📈
An AI research assistant for Indian (NSE/BSE) stock and dividend investing, powered by Google Gemini with live market data, mathematical metrics engine, portfolio tracker, screener, alerts, and tax computations.

---

### Core Philosophy: Structured Data First, LLM Explains
> **Golden Rule**: Every number shown to the user comes strictly from the data layer or a tested calculation, with its source and timestamp visible. If data is missing or uncertain, the app explicitly states "Data unavailable"—the LLM never invents numbers.

---

### 9-Stage Architecture Plan

1. **Stage 1: Data Layer (Completed)**
   - Pluggable `MarketDataProvider` interface (`lib/data/provider.ts`)
   - Swappable via `DATA_PROVIDER` environment variable (`mock` or `yahoo`)
   - In-memory TTL caching (quotes 1 min, fundamentals/dividends 24 hrs, price history 15 mins)
   - Deterministic client & server math: Dividend Yield, Payout Ratio, 5-Year CAGR, P/E, Debt/Equity, Returns
   - Gemini function calling integration with stock research tools (`lib/tools.ts`, `lib/gemini.ts`)
2. **Stage 2: Accounts and Database**
   - Authentication (Auth.js / Supabase Auth) & Postgres via Prisma
   - Models: `User`, `Profile`, `Holding`, `Transaction`, `Watchlist`, `Alert`, `ChatSession`, `ChatMessage`
   - Row-level access control & database migration
3. **Stage 3: Portfolio Tracker**
   - Holdings manager: Add/edit/delete holdings, broker CSV import with column mapping
   - Metrics: Current value, invested amount, absolute & % gain, XIRR, sector allocation pie, dividends received
   - Integration into chat context for portfolio-aware advice
4. **Stage 4: Screener**
   - Multi-metric filtering: Yield min, Payout max, P/E max, Debt/Equity max, Market cap, Sector, 5-Yr CAGR min
   - Sortable table with "Ask AI about this stock" quick actions & saved filter presets
5. **Stage 5: Alerts System**
   - Alert types: Ex-dividend date upcoming, price thresholds, dividend declarations, quarterly earnings date
   - Scheduled checks (Cron) + Email notifications (Resend) + In-app notification center
6. **Stage 6: Multi-Asset Expansion**
   - Mutual Funds: Official AMFI NAV data for returns and SIP projections
   - ETFs: Unified flow with NSE/BSE equities
   - Gold and Fixed Income: Manual-entry holdings with fixed coupon/price in portfolio views
7. **Stage 7: Indian Tax Engine**
   - Editable tax rules configuration (`lib/tax/config.ts`): STCG (20%), LTCG (12.5% above ₹1.25 Lakh per Finance Act 2024), Dividend slab rate
   - FIFO realized capital gains and estimated tax computation
8. **Stage 8: Backtest Engine**
   - Historical backtesting over 5–10 years for SIPs and high-dividend baskets with dividend reinvestment & drawdown charts
9. **Stage 9: Safety, Hardening & Deployment**
   - Zod validation on routes, rate limiting, Sentry error monitoring, CI workflows, and deployment guides

---

### Stage 1: Market Data Provider Research & Trade-offs

| Source | Reliability | Data Depth (NSE/BSE) | Legal & Terms Suitability | Implementation Status |
| :--- | :--- | :--- | :--- | :--- |
| **Yahoo Finance** (`yahoo-finance2`) | High for delayed/EOD quotes & history | Complete NSE (`.NS`) and BSE (`.BO`) equities, historical splits, dividends, balance sheets | Personal/educational usage; rate limits managed by our caching layer | **Supported** via `DATA_PROVIDER=yahoo` |
| **Licensed Broker APIs** (Zerodha Kite, Angel One, Upstox) | Exchange tick grade | Live quotes & market depth; limited multi-year historical balance sheet data | Requires active trading account, subscription fee (e.g. ₹2000/mo), and 24h rotating session tokens | **Ready for adapter** |
| **Commercial APIs** (EODHD, Twelve Data) | High | Structured REST API for global markets | Licensed commercial tiers; free tiers limited to 25–500 requests/day | **Ready for adapter** |
| **Direct Scraping** (NSE India, Screener.in) | Unstable / Anti-bot blocks | High | **Prohibited** by website Terms of Service. Direct scraping is avoided. | **Excluded by policy** |
| **Local Fixture Provider** (`mock`) | 100% deterministic, 0ms latency | Top Indian bluechips & dividend leaders (TCS, INFY, ITC, RELIANCE, IOC, HDFCBANK) | Ideal for offline development, integration tests, and CI/CD pipelines | **Supported** via `DATA_PROVIDER=mock` (default) |

---

### Function Calling vs Search Grounding Analysis (@google/genai)
- In `@google/genai` (SDK 2.x), passing both built-in `googleSearch` and custom `functionDeclarations` concurrently in the same request is restricted on `gemini-2.5-flash` and earlier endpoints.
- **Adopted Pattern**: Custom tool declarations (`get_computed_stock_metrics`, `get_stock_quote`, `get_stock_fundamentals`, `get_dividend_history`, `get_price_history`) are used for all quantitative financial parameters. The app executes these tools on verified market data, and passes the structured results to Gemini to explain the reasoning, risks, and taxation.

---

### How to Test Stage 1

1. **Run Unit Tests**:
   ```bash
   npm test
   ```
   *Expected Output:* 15 tests pass (SIP compound interest math, Dividend Yield, Payout Ratio, 5-Year CAGR, P/E, Debt/Equity, Returns, Mock Provider, and Cached Provider).

2. **Verify Next.js Build**:
   ```bash
   npm run build
   ```
   *Expected Output:* Successful compilation without TypeScript errors.

3. **Verify Provider Switching**:
   - In `.env.local`, set `DATA_PROVIDER=mock` (default) or `DATA_PROVIDER=yahoo`.
   - Set `GEMINI_API_KEY=your_key_here` to enable live Gemini function calling.
