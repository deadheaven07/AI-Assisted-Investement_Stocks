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
import { Calculator, AlertTriangle } from 'lucide-react';

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
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-wide">
              SIP &amp; Lump Sum Growth Projection
            </h2>
            <p className="text-[11px] text-slate-500">
              Deterministic client-side compound interest engine (Annuity Due)
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200 self-start sm:self-auto">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Illustrative only, not a prediction
        </div>
      </div>

      {/* Input controls */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5 text-xs">
        <div>
          <label className="block text-slate-700 font-medium mb-1">Lump Sum (₹)</label>
          <input
            type="number"
            min="0"
            step="10000"
            value={lumpSum}
            onChange={(e) => setLumpSum(Math.max(0, Number(e.target.value)))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Monthly SIP (₹)</label>
          <input
            type="number"
            min="0"
            step="1000"
            value={monthlySip}
            onChange={(e) => setMonthlySip(Math.max(0, Number(e.target.value)))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Horizon (Years)</label>
          <input
            type="number"
            min="1"
            max="40"
            value={horizonYears}
            onChange={(e) => setHorizonYears(Math.max(1, Number(e.target.value)))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
          />
        </div>

        <div>
          <label className="block text-rose-700 font-medium mb-1">Bad Case (%)</label>
          <input
            type="number"
            min="0"
            max="50"
            step="0.5"
            value={badRate}
            onChange={(e) => setBadRate(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500 font-mono text-[11px]"
          />
        </div>

        <div>
          <label className="block text-sky-700 font-medium mb-1">Normal Case (%)</label>
          <input
            type="number"
            min="0"
            max="50"
            step="0.5"
            value={normalRate}
            onChange={(e) => setNormalRate(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500 font-mono text-[11px]"
          />
        </div>

        <div>
          <label className="block text-emerald-700 font-medium mb-1">Good Case (%)</label>
          <input
            type="number"
            min="0"
            max="50"
            step="0.5"
            value={goodRate}
            onChange={(e) => setGoodRate(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      {finalYear && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500">Total Invested</span>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {formatINR(finalYear.totalInvested)}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Over {finalYear.year} years</span>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-rose-700">
              Bad Outcome ({badRate}%)
            </span>
            <p className="text-lg font-bold text-rose-900 mt-1">
              {formatINR(finalYear.badCase)}
            </p>
            <span className="text-[10px] text-rose-600 font-medium">
              +{(finalYear.badCase - finalYear.totalInvested > 0 ? '+' : '')}
              {formatINR(finalYear.badCase - finalYear.totalInvested)} gain
            </span>
          </div>

          <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-sky-700">
              Normal Outcome ({normalRate}%)
            </span>
            <p className="text-lg font-bold text-sky-900 mt-1">
              {formatINR(finalYear.normalCase)}
            </p>
            <span className="text-[10px] text-sky-600 font-medium">
              +{formatINR(finalYear.normalCase - finalYear.totalInvested)} gain
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-700">
              Good Outcome ({goodRate}%)
            </span>
            <p className="text-lg font-bold text-emerald-900 mt-1">
              {formatINR(finalYear.goodCase)}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">
              +{formatINR(finalYear.goodCase - finalYear.totalInvested)} gain
            </span>
          </div>
        </div>
      )}

      {/* Recharts Line Chart */}
      <div className="h-64 w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 mb-5">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
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
                wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="totalInvested"
                name="Total Invested"
                stroke="#64748b"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="badCase"
                name={`Bad Case (${badRate}%)`}
                stroke="#e11d48"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="normalCase"
                name={`Normal Case (${normalRate}%)`}
                stroke="#0284c7"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="goodCase"
                name={`Good Case (${goodRate}%)`}
                stroke="#059669"
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
      <div className="overflow-x-auto max-h-56 rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Year</th>
              <th className="py-2.5 px-3 font-semibold">Invested Amount</th>
              <th className="py-2.5 px-3 text-rose-700 font-semibold">Bad ({badRate}%)</th>
              <th className="py-2.5 px-3 text-sky-700 font-semibold">Normal ({normalRate}%)</th>
              <th className="py-2.5 px-3 text-emerald-700 font-semibold">Good ({goodRate}%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px] bg-white">
            {data.map((row) => (
              <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                <td className="py-2 px-3 font-sans text-slate-800 font-medium">
                  {row.year === 0 ? 'Start (Yr 0)' : `Year ${row.year}`}
                </td>
                <td className="py-2 px-3 text-slate-700">{formatINR(row.totalInvested)}</td>
                <td className="py-2 px-3 text-rose-700">{formatINR(row.badCase)}</td>
                <td className="py-2 px-3 text-sky-700">{formatINR(row.normalCase)}</td>
                <td className="py-2 px-3 text-emerald-700 font-bold">
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
