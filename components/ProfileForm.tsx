'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, InvestmentGoal, RiskLevel } from '@/lib/types';
import { User, Wallet, Calendar, ShieldAlert, Percent, Save, Check } from 'lucide-react';

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

  // Load from localStorage on mount
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
      // ignore localStorage quota errors
    }
    onProfileChange?.(updated);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-wide">Investor Profile</h2>
            <p className="text-[11px] text-slate-500">Sent with all AI research queries</p>
          </div>
        </div>

        {savedSuccess ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Save className="w-3 h-3" /> Auto-saved
          </span>
        )}
      </div>

      <div className="space-y-4 text-xs">
        {/* Lump Sum & Monthly SIP */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1 font-medium text-slate-700 mb-1">
              <Wallet className="w-3 h-3 text-emerald-600" />
              Lump Sum (₹)
            </label>
            <input
              type="number"
              min="0"
              step="5000"
              value={profile.lumpSum}
              onChange={(e) => handleChange('lumpSum', Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono text-[11px]"
            />
            <div className="flex gap-1 mt-1.5">
              {[50000, 100000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleChange('lumpSum', amt)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200/60 font-medium transition-colors"
                >
                  ₹{(amt / 100000).toFixed(amt >= 100000 ? 0 : 1)}L
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 font-medium text-slate-700 mb-1">
              <Calendar className="w-3 h-3 text-emerald-600" />
              Monthly SIP (₹)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={profile.monthlyAmount}
              onChange={(e) => handleChange('monthlyAmount', Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono text-[11px]"
            />
            <div className="flex gap-1 mt-1.5">
              {[5000, 15000, 30000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleChange('monthlyAmount', amt)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200/60 font-medium transition-colors"
                >
                  ₹{amt / 1000}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goal & Horizon */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Primary Goal</label>
            <select
              value={profile.goal}
              onChange={(e) => handleChange('goal', e.target.value as InvestmentGoal)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
            >
              <option value="dividend">Dividend Income</option>
              <option value="growth">Capital Growth</option>
              <option value="mix">Balanced (Growth + Dividend)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Horizon (Years)</label>
            <input
              type="number"
              min="1"
              max="40"
              value={profile.horizonYears}
              onChange={(e) => handleChange('horizonYears', Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all font-mono text-[11px]"
            />
          </div>
        </div>

        {/* Risk & Tax Slab */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1 font-medium text-slate-700 mb-1">
              <ShieldAlert className="w-3 h-3 text-amber-600" />
              Risk Comfort
            </label>
            <select
              value={profile.riskComfort}
              onChange={(e) => handleChange('riskComfort', e.target.value as RiskLevel)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
            >
              <option value="low">Low (Conservative)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Aggressive)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 font-medium text-slate-700 mb-1">
              <Percent className="w-3 h-3 text-indigo-600" />
              Tax Slab (%)
            </label>
            <select
              value={profile.taxSlabPercent}
              onChange={(e) => handleChange('taxSlabPercent', Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all font-medium"
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
        </div>

        {/* Sectors to Avoid */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Sectors to Avoid <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Tobacco, Real Estate, PSUs"
            value={profile.sectorsToAvoid}
            onChange={(e) => handleChange('sectorsToAvoid', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
