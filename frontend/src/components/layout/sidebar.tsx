'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Database, Sparkles, Blocks, Clock, Settings, Moon, Megaphone } from 'lucide-react';

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
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white shadow-sm">
          <Moon size={18} className="fill-slate-100 text-slate-800" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-slate-800 tracking-tight leading-none">LFE</span>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 tracking-wide">LEADS FINDER</span>
        </div>
      </div>

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

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-200/80 px-2 text-[11px] text-slate-400 font-medium">
        <p>Leads Finder v2.4</p>
        <p className="text-slate-400">100% Free & Open Engine</p>
      </div>
    </aside>
  );
};
