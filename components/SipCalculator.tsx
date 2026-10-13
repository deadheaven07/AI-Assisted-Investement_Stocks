'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { generateSipProjection, formatINR } from '@/lib/calc';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

interface SipCalculatorProps {
  initialLumpSum?: number;
  initialMonthlySip?: number;
  initialHorizon?: number;
}

export function SipCalculator({
  initialLumpSum = 100000,
  initialMonthlySip = 10000,
  initialHorizon = 10,
}: SipCalculatorProps) {
  const [mounted, setMounted] = useState(false);
  const [lumpSum, setLumpSum] = useState<number>(initialLumpSum);
  const [monthlySip, setMonthlySip] = useState<number>(initialMonthlySip);
  const [horizonYears, setHorizonYears] = useState<number>(initialHorizon);
  const [badRate, setBadRate] = useState<number>(6);
  const [normalRate, setNormalRate] = useState<number>(11);
  const [goodRate, setGoodRate] = useState<number>(15);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">
              SIP & Lump Sum Growth Projection
            </h2>
            <p className="text-[11px] text-slate-400">
              Deterministic client-side compound interest engine (Annuity Due)
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-medium border border-amber-500/20 self-start sm:self-auto">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          Illustrative only, not a prediction
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5 text-xs">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Lump Sum (₹)</label>
          <input
            type="number"
            min="0"
            step="10000"
            value={lumpSum}
            onChange={(e) => setLumpSum(Math.max(0, Number(e.target.value)))}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Monthly SIP (₹)</label>
          <input
            type="number"
            min="0"
            step="1000"
            value={monthlySip}
            onChange={(e) => setMonthlySip(Math.max(0, Number(e.target.value)))}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Horizon (Years)</label>
          <input
            type="number"
            min="1"
            max="40"
            value={horizonYears}
            onChange={(e) => setHorizonYears(Math.max(1, Number(e.target.value)))}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-rose-400 font-medium mb-1">Bad Case (%)</label>
          <input
            type="number"
            min="0"
            max="50"
            step="0.5"
            value={badRate}
            onChange={(e) => setBadRate(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <label className="block text-blue-400 font-medium mb-1">Normal Case (%)</label>
          <input
            type="number"
            min="0"
            max="50"
            step="0.5"
            value={normalRate}
            onChange={(e) => setNormalRate(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-emerald-400 font-medium mb-1">Good Case (%)</label>
          <input
            type="number"
            min="0"
            max="50"
            step="0.5"
            value={goodRate}
            onChange={(e) => setGoodRate(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      {finalYear && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <span className="text-[11px] font-medium text-slate-400">Total Capital Invested</span>
            <p className="text-lg font-bold text-slate-200 mt-1">
              {formatINR(finalYear.totalInvested)}
            </p>
            <span className="text-[10px] text-slate-500">Over {finalYear.year} years</span>
          </div>

          <div className="bg-slate-950 border border-rose-900/40 rounded-lg p-3">
            <span className="text-[11px] font-medium text-rose-400">
              Bad Outcome ({badRate}%)
            </span>
            <p className="text-lg font-bold text-rose-300 mt-1">
              {formatINR(finalYear.badCase)}
            </p>
            <span className="text-[10px] text-rose-400/80">
              +{(finalYear.badCase - finalYear.totalInvested > 0 ? '+' : '')}
              {formatINR(finalYear.badCase - finalYear.totalInvested)} gain
            </span>
          </div>

          <div className="bg-slate-950 border border-blue-900/40 rounded-lg p-3">
            <span className="text-[11px] font-medium text-blue-400">
              Normal Outcome ({normalRate}%)
            </span>
            <p className="text-lg font-bold text-blue-300 mt-1">
              {formatINR(finalYear.normalCase)}
            </p>
            <span className="text-[10px] text-blue-400/80">
              +{formatINR(finalYear.normalCase - finalYear.totalInvested)} gain
            </span>
          </div>

          <div className="bg-slate-950 border border-emerald-900/40 rounded-lg p-3">
            <span className="text-[11px] font-medium text-emerald-400">
              Good Outcome ({goodRate}%)
            </span>
            <p className="text-lg font-bold text-emerald-300 mt-1">
              {formatINR(finalYear.goodCase)}
            </p>
            <span className="text-[10px] text-emerald-400/80">
              +{formatINR(finalYear.goodCase - finalYear.totalInvested)} gain
            </span>
          </div>
        </div>
      )}

      {/* Recharts Line Chart */}
      <div className="h-64 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 mb-5">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(val) => `Yr ${val}`}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: unknown) => [
                  typeof value === 'number' ? formatINR(value) : String(value ?? ''),
                  '',
                ]}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="totalInvested"
                name="Total Invested"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="badCase"
                name={`Bad Case (${badRate}%)`}
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="normalCase"
                name={`Normal Case (${normalRate}%)`}
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="goodCase"
                name={`Good Case (${goodRate}%)`}
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            Loading interactive chart...
          </div>
        )}
      </div>

      {/* Projection Table */}
      <div className="overflow-x-auto max-h-56 rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
            <tr>
              <th className="py-2 px-3">Year</th>
              <th className="py-2 px-3">Invested Amount</th>
              <th className="py-2 px-3 text-rose-400">Bad ({badRate}%)</th>
              <th className="py-2 px-3 text-blue-400">Normal ({normalRate}%)</th>
              <th className="py-2 px-3 text-emerald-400">Good ({goodRate}%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {data.map((row) => (
              <tr key={row.year} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-1.5 px-3 font-sans text-slate-300 font-medium">
                  {row.year === 0 ? 'Start (Yr 0)' : `Year ${row.year}`}
                </td>
                <td className="py-1.5 px-3 text-slate-300">{formatINR(row.totalInvested)}</td>
                <td className="py-1.5 px-3 text-rose-300">{formatINR(row.badCase)}</td>
                <td className="py-1.5 px-3 text-blue-300">{formatINR(row.normalCase)}</td>
                <td className="py-1.5 px-3 text-emerald-300 font-semibold">
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
