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
  Copy,
  Check,
  Cpu,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface ChatWindowProps {
  profile?: UserProfile;
  initialQuery?: string;
  onSelectTab?: (tab: 'chat' | 'calculator' | 'screener') => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `### Stock Desk Quantitative Intelligence 📈
Welcome to your **AI Stock & Dividend Research Desk** for Indian equities (NSE & BSE).

Unlike generic LLMs that hallucinate financials, my quantitative calculations run entirely in code through verified data providers:
* **Dividend Yields & Payout Safety**: Real-time dividend yields, payout sustainability, and 5-year dividend CAGRs.
* **Valuation & Fundamentals**: Trailing P/E, Debt-to-Equity ratios, and earnings compounding.
* **Custom Strategy**: Tailored asset allocations across dividend aristocrats, growth compounding leaders, and index ETFs based on your risk comfort and tax bracket.
* **Budget 2024 Tax Rules**: STCG (20%) and LTCG (12.5% above ₹1.25L exemption) capital gains analysis.

*Click any quick prompt below or type your stock query.*`,
  createdAt: Date.now(),
};

const SUGGESTED_PROMPTS = [
  {
    title: 'ITC Dividend Safety',
    tag: 'High Yield',
    prompt: 'Analyze ITC: verify dividend yield, payout ratio safety, 5-year dividend CAGR, and key risks.',
  },
  {
    title: 'TCS vs Infosys',
    tag: 'Tech Bluechip',
    prompt: 'Compare TCS vs Infosys on P/E valuation, dividend growth rate, and debt-to-equity ratio.',
  },
  {
    title: 'Portfolio Allocation',
    tag: 'Asset Allocation',
    prompt: 'Based on my investor profile, recommend a disciplined allocation across dividend stocks, growth stocks, and index ETFs.',
  },
  {
    title: 'Dip Buying Strategy',
    tag: 'Execution',
    prompt: 'Design a structured buying schedule for my lump sum and monthly SIP, with clear tranche rules for buying on market dips.',
  },
  {
    title: 'Budget 2024 Tax Impact',
    tag: 'Tax Strategy',
    prompt: 'Explain after-tax returns on my dividend income vs capital gains under Budget 2024 taxation rules.',
  },
];

const QUICK_TICKERS = ['ITC', 'TCS', 'INFY', 'RELIANCE', 'IOC', 'HDFCBANK'];

export function ChatWindow({ profile, initialQuery, onSelectTab }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const insertTicker = (sym: string) => {
    setInput((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${sym}` : `Analyze ${sym}: dividend yield, valuation, and buying strategy`;
    });
    textareaRef.current?.focus();
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="flex flex-col h-[760px] bg-white border border-slate-200/90 rounded-2xl shadow-card hover:shadow-elevated transition-all overflow-hidden">
      {/* Top Header bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                AI Stock Research Desk
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Deterministic Math
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Every ratio calculated from structured financial statements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {profile && (
            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{profile.goal.toUpperCase()}</span>
              <span className="text-slate-300">&bull;</span>
              <span>₹{(profile.monthlyAmount / 1000).toFixed(0)}k/mo</span>
            </div>
          )}

          <button
            onClick={handleClearChat}
            title="Reset Chat Session"
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-transparent hover:border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Suggested prompt chips */}
      <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-100 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Suggested:
        </span>
        {SUGGESTED_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(item.prompt)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50/80 text-slate-700 hover:text-emerald-950 border border-slate-200 hover:border-emerald-300 text-[11px] font-medium whitespace-nowrap transition-all shadow-2xs cursor-pointer disabled:opacity-50 shrink-0"
          >
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200/60 uppercase">
              {item.tag}
            </span>
            <span>{item.title}</span>
          </button>
        ))}
      </div>

      {/* Message stream area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
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
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3.5 text-xs transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-sm font-medium'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-card'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Stock Desk Research Engine</span>
                    </div>
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

                {/* Markdown content with rich styling */}
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Streaming indicator */}
                {msg.isStreaming && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100 text-emerald-700 font-bold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Computing ratios from live NSE/BSE feeds...</span>
                  </div>
                )}

                {/* Sources list */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <SourcesList sources={msg.sources} />
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm font-bold text-xs">
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
              <span className="font-semibold">{error}</span>
            </div>
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area & Quick Tickers */}
      <div className="p-3 bg-white border-t border-slate-200/90 space-y-2">
        {/* Quick Ticker Chips */}
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick:
            </span>
            {QUICK_TICKERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => insertTicker(t)}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-[10px] font-mono font-bold transition-all cursor-pointer shadow-2xs"
              >
                +{t}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Enter ↵</kbd> to send
          </span>
        </div>

        {/* Form Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2 items-end"
        >
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Indian stocks (e.g. Analyze ITC dividend safety, Compare TCS vs INFY, SIP dip buying rule)..."
              disabled={isLoading}
              className="w-full bg-slate-50/90 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all disabled:opacity-50 font-medium resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-[52px] px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-sm shadow-emerald-600/25 active:scale-95"
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
    </div>
  );
}

