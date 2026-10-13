'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ShieldCheck,
  Filter,
  Search,
  Award,
  Coins,
  Scale,
} from 'lucide-react';

export interface ScreenerStock {
  sym: string;
  name: string;
  sector: string;
  price: string;
  change: string;
  isPositive: boolean;
  yield: string;
  payout: string;
  cagr: string;
  pe: string;
  debtToEquity: string;
  status: 'Aristocrat' | 'Compounding' | 'Value High Yield' | 'Bluechip';
}

export const SCREENER_STOCKS: ScreenerStock[] = [
  {
    sym: 'ITC',
    name: 'ITC Limited',
    sector: 'FMCG',
    price: '₹485.50',
    change: '+0.66%',
    isPositive: true,
    yield: '3.04%',
    payout: '88.7%',
    cagr: '7.8%',
    pe: '29.2',
    debtToEquity: '0.00',
    status: 'Aristocrat',
  },
  {
    sym: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'Information Tech',
    price: '₹4,120.00',
    change: '-0.30%',
    isPositive: false,
    yield: '1.77%',
    payout: '56.4%',
    cagr: '14.6%',
    pe: '31.8',
    debtToEquity: '0.08',
    status: 'Compounding',
  },
  {
    sym: 'INFY',
    name: 'Infosys Limited',
    sector: 'Information Tech',
    price: '₹1,885.00',
    change: '+0.96%',
    isPositive: true,
    yield: '2.44%',
    payout: '71.8%',
    cagr: '13.2%',
    pe: '29.4',
    debtToEquity: '0.09',
    status: 'Compounding',
  },
  {
    sym: 'IOC',
    name: 'Indian Oil Corporation',
    sector: 'PSU Energy',
    price: '₹142.50',
    change: '-0.56%',
    isPositive: false,
    yield: '7.02%',
    payout: '64.5%',
    cagr: '18.4%',
    pe: '9.2',
    debtToEquity: '0.85',
    status: 'Value High Yield',
  },
  {
    sym: 'RELIANCE',
    name: 'Reliance Industries Limited',
    sector: 'Energy & Retail',
    price: '₹2,840.00',
    change: '+0.51%',
    isPositive: true,
    yield: '0.35%',
    payout: '9.4%',
    cagr: '8.9%',
    pe: '26.8',
    debtToEquity: '0.44',
    status: 'Bluechip',
  },
  {
    sym: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    sector: 'Banking',
    price: '₹1,680.00',
    change: '+0.51%',
    isPositive: true,
    yield: '1.16%',
    payout: '22.0%',
    cagr: '21.5%',
    pe: '18.9',
    debtToEquity: '1.20',
    status: 'Bluechip',
  },
];

interface StockScreenerProps {
  onAnalyzeStock: (stock: ScreenerStock) => void;
  stocks?: ScreenerStock[];
}

export function StockScreener({ onAnalyzeStock, stocks }: StockScreenerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'yield' | 'pe' | 'cagr'>('yield');

  const stockList = stocks && stocks.length > 0 ? stocks : SCREENER_STOCKS;
  const sectors = ['All', 'FMCG', 'Information Tech', 'PSU Energy', 'Energy & Retail', 'Banking'];

  const filteredStocks = stockList.filter((stock) => {
    const matchesSearch =
      stock.sym.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'All' || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  }).sort((a, b) => {
    if (sortBy === 'yield') {
      return parseFloat(b.yield) - parseFloat(a.yield);
    }
    if (sortBy === 'pe') {
      return parseFloat(a.pe) - parseFloat(b.pe);
    }
    if (sortBy === 'cagr') {
      return parseFloat(b.cagr) - parseFloat(a.cagr);
    }
    return 0;
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Indian Equities Quantitative Screener
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Verified Dividend Yields, Payout Sustainability &amp; 5-Year CAGRs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            {filteredStocks.length} Securities Screened
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search symbol or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <div className="flex gap-1">
            {sectors.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSector(sec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSector === sec
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'yield' | 'pe' | 'cagr')}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-semibold focus:outline-none"
          >
            <option value="yield">Sort: Highest Yield</option>
            <option value="cagr">Sort: 5Y Div CAGR</option>
            <option value="pe">Sort: Lowest P/E</option>
          </select>
        </div>
      </div>

      {/* Screener Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
        <table className="w-full text-left text-xs divide-y divide-slate-200">
          <thead className="bg-slate-100/90 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Security</th>
              <th className="py-3 px-3">Live Price</th>
              <th className="py-3 px-3 text-emerald-800">Div Yield</th>
              <th className="py-3 px-3">Payout Ratio</th>
              <th className="py-3 px-3 text-indigo-800">5Y Div CAGR</th>
              <th className="py-3 px-3">P/E Ratio</th>
              <th className="py-3 px-3">D/E</th>
              <th className="py-3 px-4 text-right">Research Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px] bg-white">
            {filteredStocks.map((stock) => (
              <tr key={stock.sym} className="hover:bg-slate-50/90 transition-colors">
                <td className="py-3 px-4 font-sans">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{stock.sym}</span>
                        <span className="font-normal text-[10px] text-slate-500">
                          {stock.sector}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {stock.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900">{stock.price}</div>
                  <div
                    className={`text-[10px] font-bold flex items-center ${
                      stock.isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {stock.isPositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stock.change}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    {stock.yield}
                  </span>
                </td>
                <td className="py-3 px-3 font-medium text-slate-800">
                  {stock.payout}
                </td>
                <td className="py-3 px-3">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                    {stock.cagr}
                  </span>
                </td>
                <td className="py-3 px-3 font-medium text-slate-800">
                  {stock.pe}
                </td>
                <td className="py-3 px-3 font-medium text-slate-600">
                  {stock.debtToEquity}
                </td>
                <td className="py-3 px-4 text-right font-sans">
                  <button
                    type="button"
                    onClick={() => onAnalyzeStock(stock)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-3d-emerald font-bold text-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Analyze with AI</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
