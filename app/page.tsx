'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { ProfileForm } from '@/components/ProfileForm';
import { ChatWindow } from '@/components/ChatWindow';
import { SipCalculator } from '@/components/SipCalculator';
import {
  TrendingUp,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | undefined>();
  const [activeTab, setActiveTab] = useState<'chat' | 'calculator'>('chat');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">Stock Desk</h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  NSE / BSE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Quantitative Research & Dividend Investing Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg flex gap-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'chat'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>AI Research</span>
              </button>
              <button
                onClick={() => setActiveTab('calculator')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'calculator'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>SIP Calculator</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              <Building2 className="w-3 h-3 text-emerald-400" />
              <span>Data Layer: Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Investor Profile & Quick Stocks */}
          <div className="lg:col-span-4 space-y-6">
            <ProfileForm onProfileChange={(p) => setProfile(p)} />

            {/* Quick Stocks Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="font-semibold text-slate-200">Monitored Indian Stocks</span>
                <span className="text-[10px] text-slate-400">Structured Feeds</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { sym: 'ITC', name: 'ITC Ltd', yield: '3.04%', tag: 'FMCG / High Div' },
                  { sym: 'TCS', name: 'TCS', yield: '1.77%', tag: 'IT Services' },
                  { sym: 'INFY', name: 'Infosys', yield: '2.44%', tag: 'IT Bluechip' },
                  { sym: 'RELIANCE', name: 'Reliance Ind', yield: '0.35%', tag: 'Conglomerate' },
                  { sym: 'IOC', name: 'Indian Oil', yield: '7.02%', tag: 'PSU Energy' },
                  { sym: 'HDFCBANK', name: 'HDFC Bank', yield: '1.16%', tag: 'Banking' },
                ].map((s) => (
                  <div
                    key={s.sym}
                    className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{s.sym}</span>
                      <span className="text-emerald-400 text-[11px] font-mono">{s.yield}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{s.name}</div>
                    <div className="text-[9px] text-slate-500 mt-1">{s.tag}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Chat Window or SIP Calculator */}
          <div className="lg:col-span-8">
            {activeTab === 'chat' ? (
              <ChatWindow profile={profile} />
            ) : (
              <SipCalculator
                initialLumpSum={profile?.lumpSum}
                initialMonthlySip={profile?.monthlyAmount}
                initialHorizon={profile?.horizonYears}
              />
            )}
          </div>
        </div>
      </main>

      {/* Persistent SEBI Disclaimer Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Educational Information Only</strong>, not investment advice. Not SEBI-registered. Verify all data on NSE/BSE before investing.
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Stock Desk &bull; Powered by Google Gemini &amp; Live Indian Market Data
          </div>
        </div>
      </footer>
    </div>
  );
}
