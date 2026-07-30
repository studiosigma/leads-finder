'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Database, Sparkles, Blocks, Clock, Settings, Megaphone, ShieldCheck } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Find Leads', icon: Search, path: '/' },
    { name: 'Leads Database', icon: Database, path: '/dashboard' },
    { name: 'AI Pitch Studio', icon: Sparkles, path: '/ai-pitch' },
    { name: 'Broadcast Studio', icon: Megaphone, path: '/broadcast' },
    { name: 'Integrations & CRM', icon: Blocks, path: '/integrations' },
    { name: 'Scheduled Scraping', icon: Clock, path: '/schedules' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200/80 h-screen p-5 flex flex-col bg-[#f8fafc] shrink-0 sticky top-0 font-sans">
      {/* Brand Logo Header */}
      <Link href="/" className="flex items-center gap-3 px-2 mb-8 group">
        <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-slate-200/90 shadow-xs flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
          <img
            src="/logo.png"
            alt="LFE Brand Logo"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">LFE</span>
          <span className="text-[10px] text-slate-500 font-bold mt-1 tracking-wider">LEADS FINDER</span>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 ${
                isActive
                  ? 'bg-[#4a6382] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & GDPR/CCPA Compliance Disclaimer */}
      <div className="pt-4 border-t border-slate-200/80 px-2 text-[10px] text-slate-400 font-medium space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-600">Leads Finder v2.4</span>
          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold font-mono text-[9px]">
            Rate Limit: 60/m
          </span>
        </div>
        <div className="bg-slate-100/80 p-2 rounded-xl border border-slate-200/60 text-[9px] text-slate-500 leading-tight">
          <p className="font-bold text-slate-700 flex items-center gap-1 mb-0.5">
            <ShieldCheck size={11} className="text-emerald-600 shrink-0" /> GDPR & CCPA Compliant
          </p>
          Data extracted exclusively from public commercial registers & Google Maps in compliance with GDPR Art 6(1)(f).
        </div>
      </div>
    </aside>
  );
};
