'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, UserProfile } from '@/lib/types';
import { SourcesList } from './SourcesList';
import {
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  Trash2,
  AlertCircle,
  TrendingUp,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface ChatWindowProps {
  profile?: UserProfile;
  initialQuery?: string;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `### Welcome to Stock Desk 📈
I am your **quantitative stock & dividend research assistant** for Indian equities (NSE & BSE).

Unlike generic AI models that guess prices, my numbers are computed in code from structured balance sheets and market feeds:
* **Dividend Yields & Safety**: Exact payout ratios, 5-year dividend CAGRs, and debt-to-equity levels.
* **Valuation & Growth**: Trailing P/E, EPS trends, and risk assessment.
* **Personalized Strategy**: Allocation across dividend bluechips, growth stocks, and index ETFs based on your risk profile and tax bracket.
* **Capital Gains & Tax**: Post-tax views under Indian Income Tax Act (STCG 20% / LTCG 12.5% above ₹1.25L).

*Click one of the prompt shortcuts above or ask any question below.*`,
  createdAt: Date.now(),
};

const SUGGESTED_PROMPTS = [
  {
    title: 'ITC Dividend Safety',
    tag: 'FMCG Yield',
    prompt: 'Analyze ITC: dividend yield, payout safety, 5-year dividend CAGR, and key risks',
  },
  {
    title: 'TCS vs Infosys',
    tag: 'IT Valuation',
    prompt: 'Compare TCS vs Infosys on valuation, P/E ratio, dividend growth, and debt level',
  },
  {
    title: 'Custom Allocation',
    tag: 'Portfolio',
    prompt: 'Based on my profile, recommend allocation across dividend stocks, growth stocks, and index ETFs',
  },
  {
    title: 'Dip Buying Rule',
    tag: 'Strategy',
    prompt: 'Provide a structured buying schedule for my lump sum + SIP, with rules for buying on market dips',
  },
  {
    title: 'Budget 2024 Tax',
    tag: 'Tax Impact',
    prompt: 'Explain after-tax returns for my dividend income and capital gains under Budget 2024 rules',
  },
];

export function ChatWindow({ profile, initialQuery }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history
  useEffect(() => {
    try {
      const stored = localStorage.getItem('stock_desk_chat_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save history
  useEffect(() => {
    if (messages.length > 1) {
      try {
        localStorage.setItem('stock_desk_chat_history', JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle external query trigger
  useEffect(() => {
    if (initialQuery) {
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
    try {
      localStorage.removeItem('stock_desk_chat_history');
    } catch {
      // ignore
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setInput('');
    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    const assistantId = `assistant-${Date.now()}`;
    const placeholderAssistant: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      createdAt: Date.now(),
    };

    setMessages([...newMessages, placeholderAssistant]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          profile,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error (${res.status})`);
      }

      if (!res.body) {
        throw new Error('No response stream received');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let receivedSources: ChatMessage['sources'] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                accumulatedText += data.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: accumulatedText, isStreaming: true }
                      : msg
                  )
                );
              }
              if (data.sources) {
                receivedSources = data.sources;
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch {
              // ignore partial chunk json errors
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: accumulatedText,
                sources: receivedSources,
                isStreaming: false,
              }
            : msg
        )
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to generate response';
      setError(errMsg);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content:
                  msg.content ||
                  `⚠️ **Error encountered**: ${errMsg}\n\nPlease click "Retry" below.`,
                error: true,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="flex flex-col h-[740px] bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
      {/* Top Header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                AI Stock Research Desk
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Tool Calling
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Every ratio computed in code from verified feeds
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Clear history"
          className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-transparent hover:border-rose-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Suggested prompt chips */}
      <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-100 overflow-x-auto flex gap-2 no-scrollbar">
        {SUGGESTED_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(item.prompt)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-900 border border-slate-200/80 hover:border-emerald-300 text-xs font-medium whitespace-nowrap transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
          >
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
              {item.tag}
            </span>
            <span>{item.title}</span>
          </button>
        ))}
      </div>

      {/* Message stream area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/20">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 animate-fadeIn ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3.5 text-xs leading-relaxed transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-sm font-medium'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-card'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-600">Stock Desk Intelligence</span>
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Markdown content */}
                <div className="prose prose-slate prose-xs max-w-none break-words">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-3 rounded-xl border border-slate-200/90 shadow-2xs">
                          <table className="min-w-full text-left text-xs divide-y divide-slate-200">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="py-2.5 px-3 font-bold">{children}</th>
                      ),
                      td: ({ children }) => (
                        <td className="py-2 px-3 border-t border-slate-100 font-mono text-[11px] text-slate-800 bg-white">
                          {children}
                        </td>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-bold text-slate-900 mt-2 mb-1.5">
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-xs font-bold text-slate-900 mt-2 mb-1">
                          {children}
                        </h4>
                      ),
                      p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 mb-2 space-y-1 text-slate-700">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 mb-2 space-y-1 text-slate-700">{children}</ol>
                      ),
                      code: ({ children }) => (
                        <code className="bg-slate-100 text-emerald-800 border border-slate-200 px-1.5 py-0.5 rounded-md text-[11px] font-mono font-semibold">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Streaming indicator */}
                {msg.isStreaming && (
                  <div className="flex items-center gap-1.5 mt-2 text-emerald-700 font-medium text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Analyzing live structured market data...</span>
                  </div>
                )}

                {/* Sources list */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <SourcesList sources={msg.sources} />
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shrink-0 mt-0.5 shadow-2xs font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Global Error Banner with Retry */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/90 flex items-center justify-between text-xs text-rose-800 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-3.5 bg-white border-t border-slate-200/90 flex gap-2.5 items-center"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Indian stocks (e.g. Analyze ITC dividend, Compare TCS vs INFY, Dip buying rule)..."
            disabled={isLoading}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all disabled:opacity-50 font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-sm shadow-emerald-600/20 active:scale-95"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
