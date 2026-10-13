'use client';

import React, { useState } from 'react';
import { GroundingSource } from '@/lib/types';
import { ExternalLink, Database, ChevronDown, ChevronUp } from 'lucide-react';

interface SourcesListProps {
  sources?: GroundingSource[];
}

export function SourcesList({ sources }: SourcesListProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
        aria-expanded={isOpen}
      >
        <Database className="w-3.5 h-3.5 text-emerald-400" />
        <span>Verified Sources & Tool Logs ({sources.length})</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2.5 flex flex-wrap gap-2 animate-fadeIn">
          {sources.map((source, idx) => {
            const isLocalTool = source.url.startsWith('#');
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-500/40 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {isLocalTool ? (
                  <span className="font-mono text-[11px] text-slate-300">
                    {source.title}
                  </span>
                ) : (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:underline max-w-[280px] truncate"
                  >
                    <span>{source.title}</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
