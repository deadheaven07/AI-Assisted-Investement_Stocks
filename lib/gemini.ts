import { GoogleGenAI } from '@google/genai';
import { STOCK_TOOLS_DECLARATIONS, executeStockTool } from './tools';
import { SYSTEM_PROMPT, buildUserContextPrompt } from './prompt';
import { UserProfile, GroundingSource } from './types';

// Central model name constant as required by instructions
export const MODEL = 'gemini-2.5-flash';

let genAIClient: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in your .env.local file.'
      );
    }
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamChatResult {
  stream: ReadableStream<Uint8Array>;
}

/**
 * Handles multi-turn chat with function calling for Indian market data.
 * Executes financial tools locally, feeds structured results back, and streams the explanation.
 */
export async function streamStockChat(
  history: ChatTurn[],
  latestMessage: string,
  profile?: Partial<UserProfile>
): Promise<{
  readable: ReadableStream<Uint8Array>;
  sources: GroundingSource[];
}> {
  const ai = getGenAIClient();
  const sources: GroundingSource[] = [];

  const contextPrompt = buildUserContextPrompt(profile);
  const fullUserPrompt = contextPrompt
    ? `${contextPrompt}\n\nUser Question:\n${latestMessage}`
    : latestMessage;

  // Convert previous history to Gemini contents format
  const contents: Array<{ role: string; parts: Array<Record<string, unknown>> }> = [];
  for (const turn of history) {
    contents.push({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content }],
    });
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: fullUserPrompt }],
  });

  // Step 1: Initial call with function calling tools
  const initialResponse = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.3,
      tools: [{ functionDeclarations: STOCK_TOOLS_DECLARATIONS as any }],
    },
  });

  const candidate = initialResponse.candidates?.[0];
  const functionCalls = candidate?.content?.parts?.filter(
    (p: any) => Boolean(p.functionCall)
  );

  // If the model requested function calls, execute them and supply results back
  if (functionCalls && functionCalls.length > 0) {
    // Append the model's functionCall turn
    contents.push({
      role: 'model',
      parts: candidate?.content?.parts as Array<Record<string, unknown>>,
    });

    const responseParts: Array<Record<string, unknown>> = [];
    for (const fcPart of functionCalls) {
      const fc = fcPart.functionCall as { name: string; args: Record<string, unknown> };
      const toolResult = await executeStockTool(fc.name, fc.args || {});

      // Add tool metadata source so user sees verification
      const symbol = String(fc.args?.symbol || '').toUpperCase();
      sources.push({
        title: `${fc.name}(${symbol}) - Verified Structured Data`,
        url: `#tool-${fc.name}-${symbol}`,
      });

      responseParts.push({
        functionResponse: {
          name: fc.name,
          response: toolResult,
        },
      });
    }

    contents.push({
      role: 'user',
      parts: responseParts,
    });
  }

  // Step 2: Stream the final response with the executed numbers in context
  const responseStream = await ai.models.generateContentStream({
    model: MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.3,
    },
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of responseStream) {
          if (chunk.text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.text })}\n\n`)
            );
          }
        }
        // Send sources event
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ sources, done: true })}\n\n`
          )
        );
        controller.close();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Streaming error';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return { readable, sources };
}
