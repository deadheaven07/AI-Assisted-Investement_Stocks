'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, InvestmentGoal, RiskLevel } from '@/lib/types';
import {
  User,
  Wallet,
  Calendar,
  ShieldCheck,
  Percent,
  Check,
  Coins,
  TrendingUp,
  Scale,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface ProfileFormProps {
  onProfileChange?: (profile: UserProfile) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  lumpSum: 200000,
  monthlyAmount: 15000,
  goal: 'mix',
  horizonYears: 7,
  riskComfort: 'medium',
  taxSlabPercent: 30,
  sectorsToAvoid: '',
};

export function ProfileForm({ onProfileChange }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('stock_desk_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile((prev) => ({ ...prev, ...parsed }));
        onProfileChange?.({ ...DEFAULT_PROFILE, ...parsed });
      } else {
        onProfileChange?.(DEFAULT_PROFILE);
      }
    } catch {
      onProfileChange?.(DEFAULT_PROFILE);
    }
  }, [onProfileChange]);

  const handleChange = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    const updated = { ...profile, [key]: value };
    setProfile(updated);
    try {
      localStorage.setItem('stock_desk_profile', JSON.stringify(updated));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 1500);
    } catch {
      // ignore localStorage quota
    }
    onProfileChange?.(updated);
  };

  const goalOptions: { id: InvestmentGoal; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'dividend',
      label: 'Dividend Income',
      icon: <Coins className="w-3.5 h-3.5 text-emerald-600" />,
      desc: 'High payout & steady cash flows',
    },
    {
      id: 'growth',
      label: 'Capital Growth',
      icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />,
      desc: 'Compounding & capital appreciation',
    },
    {
      id: 'mix',
      label: 'Balanced Mix',
      icon: <Scale className="w-3.5 h-3.5 text-sky-600" />,
      desc: 'Dividend yield + equity upside',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-card hover:shadow-elevated transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Investor Profile</h2>
            <p className="text-[11px] text-slate-500 font-medium">Binds to every AI research prompt</p>
          </div>
        </div>

        {savedSuccess ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Check className="w-3 h-3" /> Saved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/60">
            Auto-saved
          </span>
        )}
      </div>

      <div className="space-y-4 text-xs">
        {/* Goal selector cards */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Investment Objective
          </label>
          <div className="grid grid-cols-3 gap-2">
            {goalOptions.map((opt) => {
              const active = profile.goal === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleChange('goal', opt.id)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    active
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                      : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    {opt.icon}
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                  </div>
                  <div className="font-bold text-[11px] text-slate-900 leading-tight">
                    {opt.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lump Sum & Monthly SIP */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <Wallet className="w-3 h-3 text-emerald-600" />
                Lump Sum (₹)
              </label>
              <span className="text-[10px] font-mono text-slate-600 font-semibold">
                ₹{(profile.lumpSum / 100000).toFixed(1)}L
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="10000"
              value={profile.lumpSum}
              onChange={(e) => handleChange('lumpSum', Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold"
            />
            <div className="flex gap-1 mt-1.5">
              {[50000, 100000, 200000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleChange('lumpSum', amt)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all ${
                    profile.lumpSum === amt
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ₹{(amt / 100000).toFixed(amt >= 100000 ? 0 : 1)}L
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <Calendar className="w-3 h-3 text-emerald-600" />
                Monthly SIP (₹)
              </label>
              <span className="text-[10px] font-mono text-slate-600 font-semibold">
                ₹{(profile.monthlyAmount / 1000).toFixed(0)}k/mo
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="1000"
              value={profile.monthlyAmount}
              onChange={(e) => handleChange('monthlyAmount', Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold"
            />
            <div className="flex gap-1 mt-1.5">
              {[5000, 15000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleChange('monthlyAmount', amt)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all ${
                    profile.monthlyAmount === amt
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ₹{amt / 1000}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Horizon & Risk */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700">Horizon</label>
              <span className="text-[10px] font-mono text-slate-600 font-bold">
                {profile.horizonYears} Years
              </span>
            </div>
            <select
              value={profile.horizonYears}
              onChange={(e) => handleChange('horizonYears', Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
            >
              {[1, 3, 5, 7, 10, 15, 20].map((yr) => (
                <option key={yr} value={yr}>
                  {yr} {yr === 1 ? 'Year' : 'Years'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Risk Comfort</label>
            <select
              value={profile.riskComfort}
              onChange={(e) => handleChange('riskComfort', e.target.value as RiskLevel)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="low">Low (Conservative / Bluechip)</option>
              <option value="medium">Medium (Balanced Growth)</option>
              <option value="high">High (Aggressive / High Alpha)</option>
            </select>
          </div>
        </div>

        {/* Tax Slab & Excluded Sectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1">
              <Percent className="w-3 h-3 text-indigo-600" />
              Tax Slab Rate
            </label>
            <select
              value={profile.taxSlabPercent}
              onChange={(e) => handleChange('taxSlabPercent', Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value={0}>0% (Exempt)</option>
              <option value={5}>5%</option>
              <option value={10}>10%</option>
              <option value={15}>15%</option>
              <option value={20}>20%</option>
              <option value={30}>30% (Standard Highest)</option>
              <option value={39}>39% (High Surcharge)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Sectors to Avoid
            </label>
            <input
              type="text"
              placeholder="e.g. Tobacco, PSUs, Real Estate"
              value={profile.sectorsToAvoid}
              onChange={(e) => handleChange('sectorsToAvoid', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
