'use client';

import React, { useEffect, useState } from 'react';
import { UserProfile } from '@/lib/types';
import { ProfileForm } from './ProfileForm';
import {
  X,
  Sliders,
  Radio,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Check,
  Layers,
  Database,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: UserProfile;
  onProfileChange?: (profile: UserProfile) => void;
  liveMarketStatus?: {
    isOpen: boolean;
    label: string;
    exchange: string;
    timestamp: string;
  };
  onRefreshMarket?: () => void;
  isRefreshingMarket?: boolean;
}

export function SideDrawer({
  isOpen,
  onClose,
  profile,
  onProfileChange,
  liveMarketStatus,
  onRefreshMarket,
  isRefreshingMarket = false,
}: SideDrawerProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'market' | 'about'>('profile');

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* 1. Backdrop Overlay with Frosted Glass */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* 2. Slide-over Side Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200/90 flex flex-col transform transition-transform duration-300 ease-out">
          {/* Top Drawer Header with 3D Depth */}
          <div className="p-5 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Control Desk &bull; Settings
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Portfolio configuration, tax rate &amp; live market feed
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Navigation Tabs */}
          <div className="px-5 pt-3 pb-2 bg-slate-50/70 border-b border-slate-200/80 flex gap-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80 ring-1 ring-emerald-500/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>Investor Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('market')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'market'
                  ? 'bg-white text-indigo-800 shadow-sm border border-slate-200/80 ring-1 ring-indigo-500/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-indigo-600" />
              <span>Live Feeds</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'about'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Compliance</span>
            </button>
          </div>

          {/* Drawer Body Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/30">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-900 leading-relaxed shadow-2xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dynamic System Context</span>
                  </div>
                  Every change here is saved instantly to local storage and injected directly into the Gemini quantitative research system prompt.
                </div>

                {/* Embedded ProfileForm */}
                <ProfileForm onProfileChange={onProfileChange} isCollapsedDefault={false} />
              </div>
            )}

            {activeTab === 'market' && (
              <div className="space-y-4 text-xs">
                {/* Live Feed Status Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-slate-900">NSE / BSE Connectivity</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Exchange:</span>
                      <span className="font-mono font-semibold text-slate-900">
                        {liveMarketStatus?.exchange || 'NSE / BSE India'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Market Status:</span>
                      <span className="font-semibold text-slate-900">
                        {liveMarketStatus?.label || 'Market Operational'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Source Engine:</span>
                      <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        Yahoo Finance Live API
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Last Updated:</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {liveMarketStatus?.timestamp
                          ? new Date(liveMarketStatus.timestamp).toLocaleTimeString()
                          : 'Just now'}
                      </span>
                    </div>
                  </div>

                  {/* Manual Refresh Button */}
                  <button
                    type="button"
                    onClick={onRefreshMarket}
                    disabled={isRefreshingMarket}
                    className="w-full mt-4 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-900/20 active:scale-98 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isRefreshingMarket ? 'animate-spin' : ''}`}
                    />
                    <span>{isRefreshingMarket ? 'Syncing Feeds...' : 'Sync Live Prices Now'}</span>
                  </button>
                </div>

                {/* Feed Info Note */}
                <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-600 leading-relaxed text-[11px]">
                  <strong>Feed Latency Note:</strong> Quotes are sourced directly from Yahoo Finance delayed ticker feeds (15-minute standard delay for free institutional streams, real-time where permitted).
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-card">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Statutory Disclaimer (SEBI Compliance)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Stock Desk is an educational quantitative calculation and analytics tool. It is <strong>not</strong> registered as an Investment Adviser or Research Analyst with SEBI. No output from this software constitutes financial advice, stock recommendations, or an offer to buy or sell securities.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-card">
                  <h3 className="font-bold text-slate-900 mb-2">Budget 2024 Tax Rules Built-in</h3>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc pl-4">
                    <li>
                      <strong>STCG (Sec. 111A)</strong>: Taxed at <strong>20%</strong> on equity held for &le; 12 months.
                    </li>
                    <li>
                      <strong>LTCG (Sec. 112A)</strong>: Taxed at <strong>12.5%</strong> on gains exceeding ₹1.25 Lakh per financial year.
                    </li>
                    <li>
                      <strong>Dividend Income</strong>: Added to total income and taxed at your marginal slab rate (0% to 39%).
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-white border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-[11px]">Stock Desk &bull; Institutional v2.0</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
