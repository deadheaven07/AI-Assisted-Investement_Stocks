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
} from 'lucide-react';

interface ChatWindowProps {
  profile?: UserProfile;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Hello! I am **Stock Desk**, your AI research assistant for Indian (NSE & BSE) stock and dividend investing.

I compute numbers from verified structured market feeds rather than guessing. Tell me what you'd like to analyze:
- **Analyze dividend payers** (e.g., *ITC, IOC, TCS, Infosys*)
- **Evaluate valuation & debt** (*P/E, Debt-to-Equity, Payout Ratio*)
- **Portfolio allocation** tailored to your profile (Lump sum, SIP, Tax slab)
- **Buying schedule & Dip-buying rules**

*What would you like to explore today?*`,
  createdAt: Date.now(),
};

const SUGGESTED_PROMPTS = [
  'Analyze ITC: dividend yield, payout safety, and 5-year dividend trend',
  'Compare TCS vs INFY: valuation, P/E, debt, and dividend growth',
  'Recommend allocation for my profile across dividend stocks, growth & ETFs',
  'How are dividends and equity capital gains taxed under Budget 2024?',
];

export function ChatWindow({ profile }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
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
      // ignore parse errors
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      try {
        localStorage.setItem('stock_desk_chat_history', JSON.stringify(messages));
      } catch {
        // ignore quota errors
      }
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
    try {
      localStorage.removeItem('stock_desk_chat_history');
    } catch {
      // ignore
    }
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
        throw new Error(errJson.error || `Server returned error (${res.status})`);
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
              // ignore parse errors for partial chunks
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
                  `⚠️ **Error encountered**: ${errMsg}\n\nPlease check your configuration or click "Retry".`,
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
    <div className="flex flex-col h-[700px] bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-wide">
              Stock Desk Assistant
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live NSE/BSE Function Calling</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Clear conversation history"
          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-medium">Clear</span>
        </button>
      </div>

      {/* Suggested prompts pills */}
      <div className="px-5 py-2.5 bg-slate-50/40 border-b border-slate-100 overflow-x-auto flex gap-2 no-scrollbar">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => sendMessage(prompt)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200/80 whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer font-medium"
          >
            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
            {prompt}
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
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-xs font-normal'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                {/* Markdown content */}
                <div className="prose prose-slate prose-xs max-w-none break-words">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 shadow-2xs">
                          <table className="min-w-full text-left text-xs divide-y divide-slate-200">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-slate-100 text-slate-700 font-semibold">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="py-2 px-3 text-[11px] uppercase tracking-wider text-slate-700">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="py-1.5 px-3 border-t border-slate-100 font-mono text-[11px] text-slate-800">
                          {children}
                        </td>
                      ),
                      p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
                      ),
                      code: ({ children }) => (
                        <code className="bg-slate-100 text-emerald-800 border border-slate-200/80 px-1 py-0.5 rounded text-[11px] font-mono">
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
                  <span className="inline-block w-2 h-3.5 ml-1 bg-emerald-500 animate-pulse align-middle" />
                )}

                {/* Sources list */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <SourcesList sources={msg.sources} />
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Global Error Banner with Retry */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 text-[11px] font-semibold transition-colors cursor-pointer"
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
        className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Indian stocks, dividend yields, P/E, buying schedule..."
          disabled={isLoading}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-2xs"
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
