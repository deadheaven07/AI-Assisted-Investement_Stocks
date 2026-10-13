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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide">Investor Profile</h2>
            <p className="text-[11px] text-slate-400">Sent with all AI research queries</p>
          </div>
        </div>

        {savedSuccess ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <Save className="w-3 h-3" /> Auto-saved
          </span>
        )}
      </div>

      <div className="space-y-4 text-xs">
        {/* Lump Sum & Monthly SIP */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1 font-medium text-slate-300 mb-1">
              <Wallet className="w-3 h-3 text-emerald-400" />
              Lump Sum (₹)
            </label>
            <input
              type="number"
              min="0"
              step="5000"
              value={profile.lumpSum}
              onChange={(e) => handleChange('lumpSum', Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-1 mt-1">
              {[50000, 100000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleChange('lumpSum', amt)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  ₹{(amt / 100000).toFixed(amt >= 100000 ? 0 : 1)}L
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 font-medium text-slate-300 mb-1">
              <Calendar className="w-3 h-3 text-emerald-400" />
              Monthly SIP (₹)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={profile.monthlyAmount}
              onChange={(e) => handleChange('monthlyAmount', Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-1 mt-1">
              {[5000, 15000, 30000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleChange('monthlyAmount', amt)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
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
            <label className="block font-medium text-slate-300 mb-1">Primary Goal</label>
            <select
              value={profile.goal}
              onChange={(e) => handleChange('goal', e.target.value as InvestmentGoal)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="dividend">Dividend Income</option>
              <option value="growth">Capital Growth</option>
              <option value="mix">Balanced (Growth + Dividend)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Horizon (Years)</label>
            <input
              type="number"
              min="1"
              max="40"
              value={profile.horizonYears}
              onChange={(e) => handleChange('horizonYears', Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Risk & Tax Slab */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1 font-medium text-slate-300 mb-1">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              Risk Comfort
            </label>
            <select
              value={profile.riskComfort}
              onChange={(e) => handleChange('riskComfort', e.target.value as RiskLevel)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="low">Low (Conservative)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Aggressive)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 font-medium text-slate-300 mb-1">
              <Percent className="w-3 h-3 text-indigo-400" />
              Tax Slab (%)
            </label>
            <select
              value={profile.taxSlabPercent}
              onChange={(e) => handleChange('taxSlabPercent', Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
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
          <label className="block font-medium text-slate-300 mb-1">
            Sectors to Avoid <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Tobacco, Real Estate, PSUs"
            value={profile.sectorsToAvoid}
            onChange={(e) => handleChange('sectorsToAvoid', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
