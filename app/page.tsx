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
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

interface MonitoredStock {
  sym: string;
  name: string;
  price: string;
  change: string;
  isPositive: boolean;
  yield: string;
  payout: string;
  cagr: string;
  pe: string;
  tag: string;
}

const MONITORED_STOCKS: MonitoredStock[] = [
  {
    sym: 'ITC',
    name: 'ITC Limited',
    price: '₹485.50',
    change: '+0.66%',
    isPositive: true,
    yield: '3.04%',
    payout: '88.7%',
    cagr: '7.8%',
    pe: '29.2',
    tag: 'FMCG Dividend Aristocrat',
  },
  {
    sym: 'TCS',
    name: 'Tata Consultancy Services',
    price: '₹4,120.00',
    change: '-0.30%',
    isPositive: false,
    yield: '1.77%',
    payout: '56.4%',
    cagr: '14.6%',
    pe: '31.8',
    tag: 'IT Bluechip Compounding',
  },
  {
    sym: 'INFY',
    name: 'Infosys Limited',
    price: '₹1,885.00',
    change: '+0.96%',
    isPositive: true,
    yield: '2.44%',
    payout: '71.8%',
    cagr: '13.2%',
    pe: '29.4',
    tag: 'Tech Dividend Growth',
  },
  {
    sym: 'IOC',
    name: 'Indian Oil Corporation',
    price: '₹142.50',
    change: '-0.56%',
    isPositive: false,
    yield: '7.02%',
    payout: '64.5%',
    cagr: '18.4%',
    pe: '9.2',
    tag: 'High Yield PSU Energy',
  },
  {
    sym: 'RELIANCE',
    name: 'Reliance Industries',
    price: '₹2,840.00',
    change: '+0.51%',
    isPositive: true,
    yield: '0.35%',
    payout: '9.4%',
    cagr: '8.9%',
    pe: '26.8',
    tag: 'Diversified Conglomerate',
  },
  {
    sym: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    price: '₹1,680.00',
    change: '+0.51%',
    isPositive: true,
    yield: '1.16%',
    payout: '22.0%',
    cagr: '21.5%',
    pe: '18.9',
    tag: 'Private Sector Banking',
  },
];

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | undefined>();
  const [activeTab, setActiveTab] = useState<'chat' | 'calculator'>('chat');
  const [selectedStock, setSelectedStock] = useState<MonitoredStock>(MONITORED_STOCKS[0]);
  const [externalQuery, setExternalQuery] = useState<string | undefined>();

  const triggerStockAnalysis = (stock: MonitoredStock) => {
    setActiveTab('chat');
    setExternalQuery(
      `Analyze ${stock.sym} (${stock.name}): verify dividend yield (${stock.yield}), payout safety (${stock.payout}), P/E valuation (${stock.pe}), and recommend a buying schedule.`
    );
    // Reset query trigger after dispatch
    setTimeout(() => setExternalQuery(undefined), 100);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* 1. Indian Market Live Ticker Strip */}
      <div className="bg-slate-900 text-slate-200 text-[11px] py-1.5 px-4 overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">NIFTY 50</span>
              <span className="text-white font-semibold">24,980.50</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                +0.42%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">SENSEX</span>
              <span className="text-white font-semibold">81,720.10</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                +0.38%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">BANK NIFTY</span>
              <span className="text-white font-semibold">51,450.25</span>
              <span className="text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                +0.65%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">INDIA VIX</span>
              <span className="text-white font-semibold">12.80</span>
              <span className="text-rose-400 font-bold flex items-center">
                <ArrowDownRight className="w-3 h-3" />
                -2.14%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">USD/INR</span>
              <span className="text-white font-semibold">₹84.05</span>
              <span className="text-slate-400">(-0.05%)</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">NSE / BSE Operational</span>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Header */}
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">Stock Desk</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/80 uppercase tracking-wide">
                  India Equities
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                AI Stock &amp; Dividend Research &bull; Grounded in Structured Market Feeds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="bg-slate-100/90 border border-slate-200 p-1 rounded-2xl flex gap-1 shadow-2xs">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>AI Research</span>
              </button>
              <button
                onClick={() => setActiveTab('calculator')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'calculator'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>SIP Engine</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-semibold shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Engine Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Investor Profile & Monitored Stocks */}
          <div className="lg:col-span-4 space-y-6">
            <ProfileForm onProfileChange={(p) => setProfile(p)} />

            {/* Interactive Stock Inspector Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">Monitored Indian Stocks</span>
                    <p className="text-[10px] text-slate-500 font-medium">Click to inspect or analyze</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  6 Tracked
                </span>
              </div>

              {/* Stock Chips */}
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {MONITORED_STOCKS.map((s) => {
                  const isSelected = selectedStock.sym === s.sym;
                  return (
                    <button
                      key={s.sym}
                      type="button"
                      onClick={() => setSelectedStock(s)}
                      className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 shadow-2xs'
                          : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="font-black text-xs text-slate-900 leading-none">
                        {s.sym}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-700 font-bold mt-1">
                        {s.yield}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Stock Live Card */}
              {selectedStock && (
                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-slate-900">
                          {selectedStock.sym}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                          {selectedStock.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {selectedStock.tag}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-slate-900">
                        {selectedStock.price}
                      </div>
                      <div
                        className={`text-[10px] font-mono font-bold ${
                          selectedStock.isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {selectedStock.change}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 my-2.5 text-center">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Yield</span>
                      <span className="text-[11px] font-mono font-bold text-emerald-700">
                        {selectedStock.yield}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Payout</span>
                      <span className="text-[11px] font-mono font-bold text-slate-800">
                        {selectedStock.payout}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">5Y CAGR</span>
                      <span className="text-[11px] font-mono font-bold text-indigo-700">
                        {selectedStock.cagr}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">P/E</span>
                      <span className="text-[11px] font-mono font-bold text-slate-800">
                        {selectedStock.pe}
                      </span>
                    </div>
                  </div>

                  {/* 1-Click AI trigger */}
                  <button
                    type="button"
                    onClick={() => triggerStockAnalysis(selectedStock)}
                    className="w-full mt-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze {selectedStock.sym} with AI Desk</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Chat Window or SIP Calculator */}
          <div className="lg:col-span-8">
            {activeTab === 'chat' ? (
              <ChatWindow profile={profile} initialQuery={externalQuery} />
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

      {/* 4. Persistent Compliance Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Educational Information Only</strong> &bull; Not SEBI-registered advisory. Verify all corporate filings on NSE/BSE before executing orders.
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Stock Desk &bull; Built with Google GenAI SDK &bull; NSE/BSE Equities
          </div>
        </div>
      </footer>
    </div>
  );
}
