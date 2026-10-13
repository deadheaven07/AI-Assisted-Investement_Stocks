'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/lib/types';
import { ProfileForm } from '@/components/ProfileForm';
import { ChatWindow } from '@/components/ChatWindow';
import { SipCalculator } from '@/components/SipCalculator';
import { StockScreener, ScreenerStock } from '@/components/StockScreener';
import { SideDrawer } from '@/components/SideDrawer';
import {
  TrendingUp,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Layers,
  Sliders,
  ChevronRight,
  Coins,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Zap,
} from 'lucide-react';

interface LiveIndex {
  symbol: string;
  label: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

interface LiveStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  high52w: number | null;
  low52w: number | null;
  yield: string;
  payout: string;
  pe: string;
  cagr: string;
  sector: string;
}

const DEFAULT_INDICES: LiveIndex[] = [
  { symbol: '^NSEI', label: 'NIFTY 50', price: 22363.3, change: -157.1, changePercent: -0.7, isPositive: false },
  { symbol: '^BSESN', label: 'SENSEX', price: 71924.7, change: -547.6, changePercent: -0.76, isPositive: false },
  { symbol: '^NSEBANK', label: 'BANK NIFTY', price: 54918.0, change: -338.6, changePercent: -0.61, isPositive: false },
  { symbol: 'INR=X', label: 'USD/INR', price: 95.27, change: -0.49, changePercent: -0.51, isPositive: false },
];

const DEFAULT_STOCKS: LiveStock[] = [
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    price: 261.0,
    change: 3.1,
    changePercent: 1.2,
    isPositive: true,
    high52w: 426.4,
    low52w: 253.15,
    yield: '3.04%',
    payout: '88.7%',
    pe: '29.2',
    cagr: '7.8%',
    sector: 'FMCG',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    price: 2269.3,
    change: 144.3,
    changePercent: 6.79,
    isPositive: true,
    high52w: 3350.0,
    low52w: 1976.8,
    yield: '1.77%',
    payout: '56.4%',
    pe: '31.8',
    cagr: '14.6%',
    sector: 'Information Tech',
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    price: 1062.1,
    change: 42.1,
    changePercent: 4.13,
    isPositive: true,
    high52w: 1728.0,
    low52w: 980.4,
    yield: '2.44%',
    payout: '71.8%',
    pe: '29.4',
    cagr: '13.2%',
    sector: 'Information Tech',
  },
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    price: 1166.7,
    change: 7.8,
    changePercent: 0.67,
    isPositive: true,
    high52w: 1611.8,
    low52w: 1152.2,
    yield: '0.35%',
    payout: '9.4%',
    pe: '26.8',
    cagr: '8.9%',
    sector: 'Energy & Retail',
  },
  {
    symbol: 'IOC',
    name: 'Indian Oil Corporation',
    price: 126.14,
    change: 0.79,
    changePercent: 0.63,
    isPositive: true,
    high52w: 188.96,
    low52w: 125.0,
    yield: '7.02%',
    payout: '64.5%',
    pe: '9.2',
    cagr: '18.4%',
    sector: 'PSU Energy',
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    price: 714.0,
    change: 9.1,
    changePercent: 1.29,
    isPositive: true,
    high52w: 1020.5,
    low52w: 681.9,
    yield: '1.16%',
    payout: '22.0%',
    pe: '18.9',
    cagr: '21.5%',
    sector: 'Banking',
  },
];

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | undefined>();
  const [activeTab, setActiveTab] = useState<'chat' | 'calculator' | 'screener'>('chat');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [externalQuery, setExternalQuery] = useState<string | undefined>();

  // Live market data states
  const [indices, setIndices] = useState<LiveIndex[]>(DEFAULT_INDICES);
  const [stocks, setStocks] = useState<LiveStock[]>(DEFAULT_STOCKS);
  const [selectedStock, setSelectedStock] = useState<LiveStock>(DEFAULT_STOCKS[0]);
  const [isLiveRefreshing, setIsLiveRefreshing] = useState(false);
  const [marketStatus, setMarketStatus] = useState({
    isOpen: false,
    label: 'NSE / BSE Feed Live',
    exchange: 'NSE / BSE India',
    timestamp: new Date().toISOString(),
  });

  // Fetch live market data
  const fetchLiveMarketData = useCallback(async () => {
    try {
      setIsLiveRefreshing(true);
      const res = await fetch('/api/market/live');
      if (res.ok) {
        const data = await res.json();
        if (data.indices && data.indices.length > 0) {
          setIndices(data.indices);
        }
        if (data.stocks && data.stocks.length > 0) {
          setStocks(data.stocks);
          // Preserve selected stock selection
          const current = data.stocks.find((s: LiveStock) => s.symbol === selectedStock.symbol);
          if (current) setSelectedStock(current);
        }
        if (data.marketStatus) {
          setMarketStatus(data.marketStatus);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLiveRefreshing(false);
    }
  }, [selectedStock.symbol]);

  // Initial fetch and 30-second interval refresh
  useEffect(() => {
    fetchLiveMarketData();
    const interval = setInterval(fetchLiveMarketData, 30_000);
    return () => clearInterval(interval);
  }, [fetchLiveMarketData]);

  const triggerStockAnalysis = (stock: LiveStock | ScreenerStock) => {
    setActiveTab('chat');
    const priceText = typeof stock.price === 'number' ? `₹${stock.price.toFixed(2)}` : stock.price;
    setExternalQuery(
      `Analyze ${stock.sym || (stock as LiveStock).symbol} (${stock.name}): Current live price is ${priceText}. Verify dividend yield (${stock.yield}), payout safety (${stock.payout}), P/E valuation (${stock.pe}), and recommend a buying schedule.`
    );
    setTimeout(() => setExternalQuery(undefined), 100);
  };

  const handleAnalyzeFromSip = (sipPrompt: string) => {
    setActiveTab('chat');
    setExternalQuery(sipPrompt);
    setTimeout(() => setExternalQuery(undefined), 100);
  };

  return (
    <div className="min-h-screen bg-mesh-luminous text-slate-900 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* 1. Indian Market Live Ticker Strip with 3D Depth */}
      <div className="bg-slate-950 text-slate-200 text-[11px] py-1.5 px-4 overflow-hidden border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar font-mono text-[11px]">
            {indices.map((idx) => (
              <div key={idx.symbol} className="flex items-center gap-2 shrink-0">
                <span className="text-slate-400 font-bold">{idx.label}</span>
                <span className="text-white font-semibold">
                  {idx.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`font-bold flex items-center ${
                    idx.isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {idx.isPositive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {idx.changePercent >= 0 ? '+' : ''}
                  {idx.changePercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 text-[10px] text-slate-400 font-sans shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-300">{marketStatus.label}</span>
            </div>

            <button
              onClick={fetchLiveMarketData}
              disabled={isLiveRefreshing}
              title="Refresh live prices"
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLiveRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Header with 3D Elevation */}
      <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/20 transform hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">Stock Desk</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/90 uppercase tracking-wide shadow-2xs">
                  NSE / BSE Feeds
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Quantitative Stock &amp; Dividend Intelligence &bull; Live Mathematical Grounding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Tabs with 3D Tactile Pills */}
            <div className="bg-slate-100/90 border border-slate-200/90 p-1 rounded-2xl flex gap-1 shadow-inner">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>AI Research</span>
              </button>

              <button
                onClick={() => setActiveTab('calculator')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'calculator'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>SIP Engine</span>
              </button>

              <button
                onClick={() => setActiveTab('screener')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'screener'
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Screener</span>
              </button>
            </div>

            {/* Side Drawer Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-card hover:shadow-elevated transition-all cursor-pointer text-xs font-bold active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Settings Drawer</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Investor Profile & 3D Monitored Stocks Card */}
            <div className="lg:col-span-4 space-y-5">
              {/* Profile Card with Quick Drawer Trigger */}
              <div className="card-3d rounded-2xl p-4">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
                      <Sliders className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">Investor Profile</span>
                      <p className="text-[10px] text-slate-500 font-medium">Active Research Context</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                  >
                    Edit in Drawer &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Lump Sum</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      ₹{((profile?.lumpSum || 200000) / 100000).toFixed(1)} Lakh
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Monthly SIP</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      ₹{((profile?.monthlyAmount || 15000) / 1000).toFixed(0)}k/mo
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Goal</span>
                    <span className="font-bold text-slate-800 text-xs capitalize">
                      {profile?.goal || 'Balanced Mix'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Tax Bracket</span>
                    <span className="font-bold text-indigo-700 text-xs">
                      {profile?.taxSlabPercent ?? 30}% Slab
                    </span>
                  </div>
                </div>
              </div>

              {/* 3D Interactive Stock Inspector Card */}
              <div className="card-3d rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">Live Indian Bluechips</span>
                      <p className="text-[10px] text-slate-500 font-medium">Direct Yahoo Finance stream</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {stocks.length} Live
                  </span>
                </div>

                {/* Stock Chips Grid */}
                <div className="grid grid-cols-3 gap-1.5 mb-3.5">
                  {stocks.map((s) => {
                    const isSelected = selectedStock.symbol === s.symbol;
                    return (
                      <button
                        key={s.symbol}
                        type="button"
                        onClick={() => setSelectedStock(s)}
                        className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 shadow-md ring-1 ring-emerald-500/20 transform -translate-y-0.5'
                            : 'bg-slate-50/80 border-slate-200/70 hover:bg-slate-100/80 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="font-black text-xs text-slate-900 leading-none">
                          {s.symbol}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700 font-bold mt-1">
                          ₹{s.price.toFixed(1)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Stock Live Card with 3D Depth */}
                {selectedStock && (
                  <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-slate-900">
                            {selectedStock.symbol}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                            {selectedStock.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {selectedStock.sector}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-sm text-slate-900">
                          ₹{selectedStock.price.toFixed(2)}
                        </div>
                        <div
                          className={`text-[10px] font-mono font-bold flex items-center justify-end ${
                            selectedStock.isPositive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {selectedStock.isPositive ? '+' : ''}
                          {selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 my-2.5 text-center">
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Yield</span>
                        <span className="text-[11px] font-mono font-bold text-emerald-700">
                          {selectedStock.yield}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Payout</span>
                        <span className="text-[11px] font-mono font-bold text-slate-800">
                          {selectedStock.payout}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">5Y CAGR</span>
                        <span className="text-[11px] font-mono font-bold text-indigo-700">
                          {selectedStock.cagr}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">P/E</span>
                        <span className="text-[11px] font-mono font-bold text-slate-800">
                          {selectedStock.pe}
                        </span>
                      </div>
                    </div>

                    {/* 1-Click 3D Button AI Trigger */}
                    <button
                      type="button"
                      onClick={() => triggerStockAnalysis(selectedStock)}
                      className="w-full mt-1 py-2 px-3 btn-3d-emerald rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Analyze {selectedStock.symbol} with AI Desk</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Chat Window */}
            <div className="lg:col-span-8">
              <ChatWindow
                profile={profile}
                initialQuery={externalQuery}
                onSelectTab={setActiveTab}
              />
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="max-w-5xl mx-auto card-3d rounded-2xl">
            <SipCalculator
              initialLumpSum={profile?.lumpSum}
              initialMonthlySip={profile?.monthlyAmount}
              initialHorizon={profile?.horizonYears}
              onAnalyzeWithAi={handleAnalyzeFromSip}
            />
          </div>
        )}

        {activeTab === 'screener' && (
          <div className="max-w-6xl mx-auto card-3d rounded-2xl">
            <StockScreener
              onAnalyzeStock={triggerStockAnalysis}
              stocks={stocks.map((s) => ({
                sym: s.symbol,
                name: s.name,
                sector: s.sector,
                price: `₹${s.price.toFixed(2)}`,
                change: `${s.change >= 0 ? '+' : ''}${s.change.toFixed(2)}%`,
                isPositive: s.isPositive,
                yield: s.yield,
                payout: s.payout,
                cagr: s.cagr,
                pe: s.pe,
                debtToEquity: '0.00',
                status: 'Aristocrat',
              }))}
            />
          </div>
        )}
      </main>

      {/* Side Drawer Component */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        profile={profile}
        onProfileChange={(p) => setProfile(p)}
        liveMarketStatus={marketStatus}
        onRefreshMarket={fetchLiveMarketData}
        isRefreshingMarket={isLiveRefreshing}
      />

      {/* 4. Persistent Compliance Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Educational Tool Only</strong> &bull; Not SEBI-registered investment advice. Sourced via live Yahoo Finance NSE/BSE feeds.
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


