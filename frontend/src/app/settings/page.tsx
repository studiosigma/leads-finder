'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Database, Key } from 'lucide-react';

export default function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState('https://axkxjfmecmqnevkfawrc.supabase.co');
  const [rateLimit, setRateLimit] = useState('1.5');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] p-8 space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="text-slate-700" size={24} /> Settings & API Configuration
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage system configurations, database connections, and scraper engine rate limits.
        </p>
      </div>

      <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
        {/* Database Configuration */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Database size={16} className="text-slate-600" /> Database Connection (Supabase)
          </h2>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Supabase URL</label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Scraper Engine Limits */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck size={16} className="text-slate-600" /> Scraper Delay & Anti-Ban Rate Limit
          </h2>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Domain Request Delay (Seconds)</label>
            <input
              type="number"
              step="0.5"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <p className="text-[11px] text-slate-400">
              Recommended delay is 1.5 - 3.0 seconds per domain crawl to prevent IP bans.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="py-2.5 px-5 bg-[#4a6382] hover:bg-[#3b5175] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            {saved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
            {saved ? 'Configuration Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
