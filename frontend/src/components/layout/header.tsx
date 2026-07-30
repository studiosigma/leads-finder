'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, CheckCircle2, X, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const Header = () => {
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; count: number } | null>(null);
  const [unreadCount, setUnreadCount] = useState(1);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  useEffect(() => {
    // Listen to background scraping completion events across pages
    const checkBackgroundStatus = () => {
      try {
        const savedSessions = JSON.parse(localStorage.getItem('lfe_scraping_sessions') || '[]');
        if (savedSessions.length > 0) {
          const latest = savedSessions[0];
          const lastNotified = localStorage.getItem('lfe_last_notified_session');
          if (latest.id !== lastNotified) {
            setActiveToast({
              id: latest.id,
              title: latest.query,
              count: latest.lead_count || latest.leads?.length || 0,
            });
            setUnreadCount((prev) => prev + 1);
            localStorage.setItem('lfe_last_notified_session', latest.id);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    const interval = setInterval(checkBackgroundStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200/80 bg-[#f8fafc] px-8 flex items-center justify-between sticky top-0 z-20 font-sans">
      {/* Search Input */}
      <div className="relative w-80">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search collected leads or keywords..."
          className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200/60 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 relative">
        {/* Floating Global Toast Notification */}
        {activeToast && (
          <div className="fixed top-4 right-24 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 max-w-md">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div className="flex-1 text-xs">
              <p className="font-extrabold text-white flex items-center gap-1">
                Scraping Autopilot Finished! <Sparkles size={12} className="text-amber-400" />
              </p>
              <p className="text-slate-300 text-[11px]">
                Found <strong>{activeToast.count} leads</strong> for "{activeToast.title}".
              </p>
            </div>
            <Link
              href="/dashboard"
              onClick={() => setActiveToast(null)}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors shrink-0"
            >
              View <ArrowRight size={12} />
            </Link>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationsDropdown(!showNotificationsDropdown);
              setUnreadCount(0);
            }}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-ping" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotificationsDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3 z-50 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800">Scraping Notifications</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Background Runner Active</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
                  <p className="font-bold text-slate-800">Background Scraping Active</p>
                  <p className="text-[11px] text-slate-500">You can freely navigate away. New leads auto-sync to Leads Database.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden ring-2 ring-white shadow-xs flex items-center justify-center text-slate-700 font-bold text-xs">
            <span className="bg-gradient-to-tr from-slate-700 to-slate-900 text-white w-full h-full flex items-center justify-center">
              M
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
