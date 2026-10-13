import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { streamStockChat } from '@/lib/gemini';
import { getMarketDataProvider } from '@/lib/data/provider';

export const dynamic = 'force-dynamic';

const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(2500),
    })
  ).min(1),
  profile: z.object({
    lumpSum: z.number().nonnegative().optional(),
    monthlyAmount: z.number().nonnegative().optional(),
    goal: z.enum(['dividend', 'growth', 'mix']).optional(),
    horizonYears: z.number().positive().max(50).optional(),
    riskComfort: z.enum(['low', 'medium', 'high']).optional(),
    taxSlabPercent: z.number().min(0).max(45).optional(),
    sectorsToAvoid: z.string().max(200).optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  // 1. IP extraction and rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rateLimit = checkRateLimit(ip, 30, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded. Please wait ${rateLimit.resetInSec} seconds before sending another message.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.resetInSec),
        },
      }
    );
  }

  // 2. Parse & validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
  }

  const parseResult = ChatRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { messages, profile } = parseResult.data;
  const history = messages.slice(0, -1);
  const latestMessage = messages[messages.length - 1].content;

  // 3. Check API key configuration
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // If API key is not yet set, provide an immediate educational fallback response
    // showcasing our real data layer without crashing the app
    const encoder = new TextEncoder();
    const provider = getMarketDataProvider();

    // Inspect if query mentions known Indian stocks
    const upperQuery = latestMessage.toUpperCase();
    let symbol = 'ITC';
    if (upperQuery.includes('TCS')) symbol = 'TCS';
    else if (upperQuery.includes('INFY')) symbol = 'INFY';
    else if (upperQuery.includes('RELIANCE')) symbol = 'RELIANCE';
    else if (upperQuery.includes('IOC')) symbol = 'IOC';
    else if (upperQuery.includes('HDFC')) symbol = 'HDFCBANK';

    const metrics = await provider.getComputedMetrics(symbol);

    const fallbackStream = new ReadableStream<Uint8Array>({
      start(controller) {
        const text = `⚠️ **Note**: \`GEMINI_API_KEY\` is not yet set in \`.env.local\`.

Here is verified live structured data computed directly by our **Stock Desk Data Layer** for **${symbol}**:

| Metric | Computed Value | Description |
| :--- | :--- | :--- |
| **Current Price** | ₹${metrics.currentPrice.toLocaleString('en-IN')} | Live / Delayed market price |
| **Dividend Yield** | ${metrics.dividendYieldPercent !== null ? `${metrics.dividendYieldPercent}%` : 'N/A'} | Annual Dividend / Price |
| **Payout Ratio** | ${metrics.payoutRatioPercent !== null ? `${metrics.payoutRatioPercent}%` : 'N/A'} | Dividend / Trailing EPS |
| **5-Yr Dividend CAGR**| ${metrics.fiveYearDividendCagrPercent !== null ? `${metrics.fiveYearDividendCagrPercent}%` : 'N/A'} | Historical dividend growth |
| **P/E Ratio** | ${metrics.peRatio ?? 'N/A'} | Price to Earnings |
| **Debt to Equity** | ${metrics.debtToEquityRatio ?? 'N/A'} | Total Debt / Total Equity |

*To unlock full multi-turn conversational AI reasoning and live Google Search grounding, add your key to \`.env.local\`:*
\`\`\`env
GEMINI_API_KEY=your_actual_gemini_key_here
\`\`\`
`;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              sources: [
                {
                  title: `${provider.name} provider - Structured Metrics Engine (${symbol})`,
                  url: `#metrics-${symbol}`,
                },
              ],
              done: true,
            })}\n\n`
          )
        );
        controller.close();
      },
    });

    return new Response(fallbackStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  }

  // 4. Stream response from Gemini with function calling
  try {
    const { readable } = await streamStockChat(history, latestMessage, profile);
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal streaming error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
