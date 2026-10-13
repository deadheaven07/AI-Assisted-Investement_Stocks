'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, InvestmentGoal, RiskLevel } from '@/lib/types';
import {
  Wallet,
  Calendar,
  ShieldCheck,
  Percent,
  Check,
  Coins,
  TrendingUp,
  Scale,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface ProfileFormProps {
  onProfileChange?: (profile: UserProfile) => void;
  isCollapsedDefault?: boolean;
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

export function ProfileForm({ onProfileChange, isCollapsedDefault = false }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isCollapsedDefault);

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
      setTimeout(() => setSavedSuccess(false), 1200);
    } catch {
      // ignore
    }
    onProfileChange?.(updated);
  };

  const goalOptions: { id: InvestmentGoal; label: string; icon: React.ReactNode; desc: string; badge: string }[] = [
    {
      id: 'dividend',
      label: 'Dividend Income',
      icon: <Coins className="w-4 h-4 text-emerald-600" />,
      desc: 'High payouts & steady quarterly cash flow',
      badge: 'Cash Flow',
    },
    {
      id: 'growth',
      label: 'Capital Growth',
      icon: <TrendingUp className="w-4 h-4 text-indigo-600" />,
      desc: 'Long term bluechip equity compounding',
      badge: 'Compounding',
    },
    {
      id: 'mix',
      label: 'Balanced Mix',
      icon: <Scale className="w-4 h-4 text-sky-600" />,
      desc: 'Dividend yield + steady equity capital upside',
      badge: 'Recommended',
    },
  ];

  const riskOptions: { id: RiskLevel; label: string; desc: string }[] = [
    { id: 'low', label: 'Conservative', desc: 'Large Cap / Bluechips' },
    { id: 'medium', label: 'Moderate', desc: 'Balanced / Index' },
    { id: 'high', label: 'Aggressive', desc: 'Growth / High Beta' },
  ];

  const horizonOptions = [3, 5, 7, 10, 15, 20];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-card hover:shadow-elevated transition-all overflow-hidden">
      {/* Header Bar with Accordion Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90 cursor-pointer select-none border-b border-slate-100 transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">Investor Profile</h2>
              {savedSuccess ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-fadeIn">
                  <Check className="w-2.5 h-2.5" /> Saved
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Live Context
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {profile.goal.toUpperCase()} &bull; ₹{(profile.lumpSum / 100000).toFixed(1)}L Lump &bull; ₹{(profile.monthlyAmount / 1000).toFixed(0)}k/mo &bull; {profile.horizonYears}Y
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={isExpanded ? 'Collapse Profile' : 'Expand Profile'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Form Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 text-xs animate-fadeIn">
          {/* 1. Goal Selector Cards */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Primary Objective
            </label>
            <div className="grid grid-cols-3 gap-2">
              {goalOptions.map((opt) => {
                const active = profile.goal === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('goal', opt.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs ring-1 ring-emerald-500/30'
                        : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      {opt.icon}
                      {active ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shadow-xs" />
                      ) : (
                        <span className="text-[9px] text-slate-400 font-semibold">{opt.badge}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-[11px] text-slate-900 leading-tight">
                        {opt.label}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5 leading-snug line-clamp-1">
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Lump Sum & Monthly SIP */}
          <div className="grid grid-cols-2 gap-3">
            {/* Lump Sum */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                  <Wallet className="w-3 h-3 text-emerald-600" />
                  Lump Sum
                </label>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                  ₹{(profile.lumpSum / 100000).toFixed(1)}L
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="10000"
                value={profile.lumpSum}
                onChange={(e) => handleChange('lumpSum', Math.max(0, Number(e.target.value)))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              />
              <div className="flex gap-1 mt-1.5">
                {[50000, 100000, 200000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleChange('lumpSum', amt)}
                    className={`text-[9px] flex-1 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      profile.lumpSum === amt
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
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  Monthly SIP
                </label>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                  ₹{(profile.monthlyAmount / 1000).toFixed(0)}k/mo
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="1000"
                value={profile.monthlyAmount}
                onChange={(e) => handleChange('monthlyAmount', Math.max(0, Number(e.target.value)))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              />
              <div className="flex gap-1 mt-1.5">
                {[5000, 10000, 15000, 25000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleChange('monthlyAmount', amt)}
                    className={`text-[9px] flex-1 py-0.5 rounded font-bold transition-all cursor-pointer ${
                      profile.monthlyAmount === amt
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ₹{amt / 1000}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Horizon Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Investment Horizon
              </label>
              <span className="text-[11px] font-mono font-bold text-slate-800">
                {profile.horizonYears} Years
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {horizonOptions.map((yr) => {
                const active = profile.horizonYears === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleChange('horizonYears', yr)}
                    className={`py-1 rounded-lg text-center font-bold text-xs transition-all cursor-pointer border ${
                      active
                        ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {yr}Y
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Risk Comfort Tabs */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Risk Appetite
            </label>
            <div className="grid grid-cols-3 gap-2">
              {riskOptions.map((opt) => {
                const active = profile.riskComfort === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('riskComfort', opt.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold shadow-2xs ring-1 ring-indigo-500/20'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] font-bold leading-tight">{opt.label}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5 truncate">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Tax Slab & Excluded Sectors */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
            <div>
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                <Percent className="w-3 h-3 text-indigo-600" />
                Tax Slab Rate
              </label>
              <select
                value={profile.taxSlabPercent}
                onChange={(e) => handleChange('taxSlabPercent', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value={0}>0% (Tax Exempt)</option>
                <option value={10}>10% Bracket</option>
                <option value={15}>15% Bracket</option>
                <option value={20}>20% Bracket</option>
                <option value={30}>30% (Standard High)</option>
                <option value={39}>39% (High Surcharge)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Sectors to Avoid
              </label>
              <input
                type="text"
                placeholder="e.g. Tobacco, PSUs"
                value={profile.sectorsToAvoid}
                onChange={(e) => handleChange('sectorsToAvoid', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

