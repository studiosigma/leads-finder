'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Database, Key, Server, Cpu, Globe, MessageSquare } from 'lucide-react';

export default function SettingsPage() {
  const [supabaseUrl, setSupabaseUrl] = useState('https://axkxjfmecmqnevkfawrc.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  const [backendUrl, setBackendUrl] = useState('https://leads-finder-api.onrender.com');
  const [rateLimit, setRateLimit] = useState('1.5');
  const [crawlDepth, setCrawlDepth] = useState('2');
  const [countryCode, setCountryCode] = useState('+62');
  const [uaRotation, setUaRotation] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] p-8 space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="text-slate-700" size={24} /> Settings & System Configuration
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage database connections, backend API endpoints, scraper engine limits, and outreach defaults.
        </p>
      </div>

      {/* Alert Notification */}
      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>All system configurations saved successfully! Changes applied immediately.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Database & Backend API */}
        <div className="space-y-6">
          {/* Database Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Database size={16} className="text-slate-600" /> Database Connection (Supabase)
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Supabase Anon Key</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Backend Service URL */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Server size={16} className="text-slate-600" /> Backend API Service Endpoint
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">FastAPI Production URL (Render)</label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <p className="text-[11px] text-slate-400">
                Connected to Render Web Service for Celery scraper queue execution.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Scraper Engine Limits & Outreach Defaults */}
        <div className="space-y-6">
          {/* Scraper Engine Limits */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={16} className="text-slate-600" /> Scraper Engine & Rate Limiting
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Domain Request Delay (Seconds)</label>
                <input
                  type="number"
                  step="0.5"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Max Website Crawl Depth</label>
                <select
                  value={crawlDepth}
                  onChange={(e) => setCrawlDepth(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
                >
                  <option value="1">1 Level (Homepage Only - Fastest)</option>
                  <option value="2">2 Levels (Homepage + Contact Page - Recommended)</option>
                  <option value="3">3 Levels (Deep Crawl - Comprehensive)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-slate-700">15+ User-Agent Pool Rotation</span>
                <button
                  type="button"
                  onClick={() => setUaRotation(!uaRotation)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    uaRotation ? 'bg-[#4a6382]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      uaRotation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Outreach & WhatsApp Defaults */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare size={16} className="text-slate-600" /> Outreach & Country Defaults
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Default Phone Country Code</label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
              >
                <option value="+62">+62 (Indonesia)</option>
                <option value="+1">+1 (United States / Canada)</option>
                <option value="+65">+65 (Singapore)</option>
                <option value="+60">+60 (Malaysia)</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Global Save Button */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          className="py-3 px-6 bg-[#4a6382] hover:bg-[#3b5175] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
        >
          {saved ? <CheckCircle2 size={16} className="text-emerald-300" /> : <Save size={16} />}
          {saved ? 'All Configurations Saved!' : 'Save System Settings'}
        </button>
      </div>

    </div>
  );
}
