'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Database, Sparkles, Blocks, Clock, Settings, Megaphone, ShieldCheck, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lfe_sidebar_collapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const nextState = !prev;
      try {
        localStorage.setItem('lfe_sidebar_collapsed', String(nextState));
      } catch (e) {
        // ignore
      }
      return nextState;
    });
  };

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
    <aside
      className={`border-r border-slate-200/80 h-screen flex flex-col bg-[#f8fafc] shrink-0 sticky top-0 font-sans transition-all duration-300 relative ${
        isCollapsed ? 'w-20 p-3' : 'w-64 p-5'
      }`}
    >
      {/* Brand Logo & Collapse Toggle Header */}
      <div className="flex items-center justify-between mb-8 px-1">
        <Link href="/" className="flex items-center gap-3 group overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-slate-200/90 shadow-xs flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="LFE Brand Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in duration-200">
              <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none">LEADS FINDER</span>
            </div>
          )}
        </Link>

        {/* Collapse Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
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
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 ${
                isCollapsed ? 'justify-center px-0' : 'px-3.5'
              } ${
                isActive
                  ? 'bg-[#4a6382] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & GDPR/CCPA Compliance Disclaimer */}
      {!isCollapsed ? (
        <div className="pt-4 border-t border-slate-200/80 px-1 text-[10px] text-slate-400 font-medium space-y-1.5 animate-in fade-in duration-200">
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
            Public commercial registers & Google Maps compliance.
          </div>
        </div>
      ) : (
        <div className="pt-4 border-t border-slate-200/80 text-center">
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
            60/m
          </span>
        </div>
      )}
    </aside>
  );
};
