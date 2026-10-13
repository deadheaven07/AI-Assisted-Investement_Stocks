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
    <div className="mt-3 pt-3 border-t border-slate-200 text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 transition-colors font-medium cursor-pointer"
        aria-expanded={isOpen}
      >
        <Database className="w-3.5 h-3.5 text-emerald-600" />
        <span>Verified Sources & Tool Logs ({sources.length})</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2.5 flex flex-wrap gap-2 animate-fadeIn">
          {sources.map((source, idx) => {
            const isLocalTool = source.url.startsWith('#');
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 hover:border-emerald-400 transition-colors shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {isLocalTool ? (
                  <span className="font-mono text-[11px] text-slate-700 font-medium">
                    {source.title}
                  </span>
                ) : (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:underline max-w-[280px] truncate font-medium"
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
