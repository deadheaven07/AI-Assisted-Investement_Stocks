'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { generateSipProjection, formatINR } from '@/lib/calc';
import {
  Calculator,
  AlertTriangle,
  Wallet,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Percent,
} from 'lucide-react';

interface SipCalculatorProps {
  initialLumpSum?: number;
  initialMonthlySip?: number;
  initialHorizon?: number;
  onAnalyzeWithAi?: (prompt: string) => void;
}

export function SipCalculator({
  initialLumpSum = 200000,
  initialMonthlySip = 15000,
  initialHorizon = 10,
  onAnalyzeWithAi,
}: SipCalculatorProps) {
  const [mounted, setMounted] = useState(false);
  const [lumpSum, setLumpSum] = useState<number>(initialLumpSum);
  const [monthlySip, setMonthlySip] = useState<number>(initialMonthlySip);
  const [horizonYears, setHorizonYears] = useState<number>(initialHorizon);
  const [badRate, setBadRate] = useState<number>(6);
  const [normalRate, setNormalRate] = useState<number>(12);
  const [goodRate, setGoodRate] = useState<number>(15);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync if profile props update
  useEffect(() => {
    if (initialLumpSum !== undefined) setLumpSum(initialLumpSum);
    if (initialMonthlySip !== undefined) setMonthlySip(initialMonthlySip);
    if (initialHorizon !== undefined) setHorizonYears(initialHorizon);
  }, [initialLumpSum, initialMonthlySip, initialHorizon]);

  const data = useMemo(() => {
    return generateSipProjection({
      lumpSum,
      monthlySip,
      horizonYears,
      badRatePercent: badRate,
      normalRatePercent: normalRate,
      goodRatePercent: goodRate,
    });
  }, [lumpSum, monthlySip, horizonYears, badRate, normalRate, goodRate]);

  const finalYear = data[data.length - 1];

  const handleSendToAi = () => {
    if (!onAnalyzeWithAi || !finalYear) return;
    const prompt = `Review my SIP and Lump Sum plan: Initial Lump Sum ${formatINR(lumpSum)}, Monthly SIP ${formatINR(monthlySip)}, over ${horizonYears} years. Target normal corpus is ${formatINR(finalYear.normalCase)} at ${normalRate}% CAGR (invested ${formatINR(finalYear.totalInvested)}). What specific Indian dividend aristocrats, growth leaders, and index ETFs should I allocate to reach this target while managing risk?`;
    onAnalyzeWithAi(prompt);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 shadow-2xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              SIP &amp; Wealth Growth Simulator
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Deterministic monthly compounding math &bull; Annuity Due Formula
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAnalyzeWithAi && (
            <button
              onClick={handleSendToAi}
              className="px-3.5 py-1.5 btn-3d-emerald rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Plan with AI</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Illustrative Math</span>
          </div>
        </div>
      </div>

      {/* Sliders and input controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
        {/* Lump Sum */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <label className="flex items-center gap-1 font-bold text-slate-700">
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              Lump Sum
            </label>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
              {formatINR(lumpSum)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2500000"
            step="25000"
            value={lumpSum}
            onChange={(e) => setLumpSum(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>₹0</span>
            <span>₹10L</span>
            <span>₹25L</span>
          </div>
          <div className="flex gap-1 mt-2">
            {[50000, 100000, 200000, 500000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setLumpSum(amt)}
                className={`text-[9px] flex-1 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  lumpSum === amt
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ₹{(amt / 100000).toFixed(amt >= 100000 ? 0 : 1)}L
              </button>
            ))}
          </div>
        </div>

        {/* Monthly SIP */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <label className="flex items-center gap-1 font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Monthly SIP
            </label>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
              {formatINR(monthlySip)}/mo
            </span>
          </div>
          <input
            type="range"
            min="1000"
            max="150000"
            step="1000"
            value={monthlySip}
            onChange={(e) => setMonthlySip(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>₹1k</span>
            <span>₹75k</span>
            <span>₹1.5L</span>
          </div>
          <div className="flex gap-1 mt-2">
            {[5000, 10000, 15000, 25000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setMonthlySip(amt)}
                className={`text-[9px] flex-1 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  monthlySip === amt
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ₹{amt / 1000}k
              </button>
            ))}
          </div>
        </div>

        {/* Horizon */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <label className="flex items-center gap-1 font-bold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Horizon
            </label>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
              {horizonYears} Years
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={horizonYears}
            onChange={(e) => setHorizonYears(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>1 Yr</span>
            <span>15 Yrs</span>
            <span>30 Yrs</span>
          </div>
          <div className="flex gap-1 mt-2">
            {[3, 5, 7, 10].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setHorizonYears(yr)}
                className={`text-[9px] flex-1 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  horizonYears === yr
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {yr}Y
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Return Rate Customizers */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/80">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mb-1">
            Conservative ({badRate}%)
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max="40"
              step="0.5"
              value={badRate}
              onChange={(e) => setBadRate(Number(e.target.value))}
              className="w-full bg-white border border-rose-200 rounded-lg px-2 py-1 text-rose-900 font-mono font-bold text-xs focus:outline-none"
            />
            <span className="text-xs font-bold text-rose-700">%</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-200/80">
          <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block mb-1">
            Historical Nifty ({normalRate}%)
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max="40"
              step="0.5"
              value={normalRate}
              onChange={(e) => setNormalRate(Number(e.target.value))}
              className="w-full bg-white border border-sky-200 rounded-lg px-2 py-1 text-sky-900 font-mono font-bold text-xs focus:outline-none"
            />
            <span className="text-xs font-bold text-sky-700">%</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
            High Growth ({goodRate}%)
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              max="40"
              step="0.5"
              value={goodRate}
              onChange={(e) => setGoodRate(Number(e.target.value))}
              className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1 text-emerald-900 font-mono font-bold text-xs focus:outline-none"
            />
            <span className="text-xs font-bold text-emerald-700">%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {finalYear && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Invested Outlay
            </span>
            <p className="text-xl font-black text-slate-900 mt-1 font-mono">
              {formatINR(finalYear.totalInvested)}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Principal committed</span>
          </div>

          <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                Bad ({badRate}%)
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                {(finalYear.badCase / Math.max(1, finalYear.totalInvested)).toFixed(1)}x
              </span>
            </div>
            <p className="text-xl font-black text-rose-950 mt-1 font-mono">
              {formatINR(finalYear.badCase)}
            </p>
            <span className="text-[10px] text-rose-600 font-medium flex items-center gap-0.5">
              <ArrowUpRight className="w-2.5 h-2.5" />
              +{formatINR(Math.max(0, finalYear.badCase - finalYear.totalInvested))} gain
            </span>
          </div>

          <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                Normal ({normalRate}%)
              </span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                {(finalYear.normalCase / Math.max(1, finalYear.totalInvested)).toFixed(1)}x
              </span>
            </div>
            <p className="text-xl font-black text-sky-950 mt-1 font-mono">
              {formatINR(finalYear.normalCase)}
            </p>
            <span className="text-[10px] text-sky-600 font-medium flex items-center gap-0.5">
              <ArrowUpRight className="w-2.5 h-2.5" />
              +{formatINR(Math.max(0, finalYear.normalCase - finalYear.totalInvested))} gain
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Good ({goodRate}%)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                {(finalYear.goodCase / Math.max(1, finalYear.totalInvested)).toFixed(1)}x
              </span>
            </div>
            <p className="text-xl font-black text-emerald-950 mt-1 font-mono">
              {formatINR(finalYear.goodCase)}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
              <ArrowUpRight className="w-2.5 h-2.5" />
              +{formatINR(Math.max(0, finalYear.goodCase - finalYear.totalInvested))} gain
            </span>
          </div>
        </div>
      )}

      {/* Recharts Area Chart */}
      <div className="h-72 w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 mb-6">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorGood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(val) => `Yr ${val}`}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(val) =>
                  val >= 10000000
                    ? `₹${(val / 10000000).toFixed(1)}Cr`
                    : `₹${(val / 100000).toFixed(0)}L`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  color: '#0f172a',
                }}
                formatter={(value: unknown) => [
                  typeof value === 'number' ? formatINR(value) : String(value ?? ''),
                  '',
                ]}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="goodCase"
                name={`Good Case (${goodRate}%)`}
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorGood)"
              />
              <Area
                type="monotone"
                dataKey="normalCase"
                name={`Normal Case (${normalRate}%)`}
                stroke="#0284c7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNormal)"
              />
              <Area
                type="monotone"
                dataKey="badCase"
                name={`Bad Case (${badRate}%)`}
                stroke="#e11d48"
                strokeWidth={1.5}
                fill="transparent"
              />
              <Area
                type="monotone"
                dataKey="totalInvested"
                name="Total Invested"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            Rendering interactive chart...
          </div>
        )}
      </div>

      {/* Projection Table */}
      <div className="overflow-x-auto max-h-56 rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3.5 font-bold">Timeline</th>
              <th className="py-2.5 px-3.5 font-bold">Invested Capital</th>
              <th className="py-2.5 px-3.5 text-rose-700 font-bold">Conservative ({badRate}%)</th>
              <th className="py-2.5 px-3.5 text-sky-700 font-bold">Average ({normalRate}%)</th>
              <th className="py-2.5 px-3.5 text-emerald-700 font-bold">High Growth ({goodRate}%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px] bg-white">
            {data.map((row) => (
              <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2 px-3.5 font-sans text-slate-900 font-bold">
                  {row.year === 0 ? 'Start (Day 1)' : `Year ${row.year}`}
                </td>
                <td className="py-2 px-3.5 text-slate-700 font-medium">
                  {formatINR(row.totalInvested)}
                </td>
                <td className="py-2 px-3.5 text-rose-700 font-semibold">
                  {formatINR(row.badCase)}
                </td>
                <td className="py-2 px-3.5 text-sky-700 font-semibold">
                  {formatINR(row.normalCase)}
                </td>
                <td className="py-2 px-3.5 text-emerald-700 font-bold">
                  {formatINR(row.goodCase)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

