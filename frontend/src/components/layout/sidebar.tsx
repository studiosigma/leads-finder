import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Search, Database, Download, Settings } from 'lucide-react';

export const Sidebar = () => {
  const menuItems = [
    { name: 'Search', icon: Search, path: '/' },
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Export CSV', icon: Download, path: 'http://localhost:8000/api/v1/export/csv' },
  ];

  return (
    <div className="w-64 border-r border-zinc-200 h-screen p-6 flex flex-col bg-white shrink-0 sticky top-0">
      <div className="text-xl font-bold mb-10 text-zinc-900 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-blue-600"></span> Leads Finder
      </div>
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            target={item.path.startsWith('http') ? '_blank' : '_self'}
            className="flex items-center gap-3 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg transition-colors font-medium text-sm"
          >
            <item.icon size={18} />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

