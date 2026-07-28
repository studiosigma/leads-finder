'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, Megaphone, Blocks, BarChart3, Settings, Moon } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Find Leads', icon: Search, path: '/' },
    { name: 'Campaigns', icon: Megaphone, path: '#' },
    { name: 'Integrations', icon: Blocks, path: '#' },
    { name: 'Analytics', icon: BarChart3, path: '#' },
    { name: 'Settings', icon: Settings, path: '#' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200/80 h-screen p-5 flex flex-col bg-[#f8fafc] shrink-0 sticky top-0 font-sans">
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white shadow-sm">
          <Moon size={18} className="fill-slate-100 text-slate-800" />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">LFE</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (item.path === '/' && pathname === '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-slate-200/70 text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-slate-900' : 'text-slate-400'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
