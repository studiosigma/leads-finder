import React from 'react';
import { Mail, Phone, Globe, CheckCircle2, Clock, Sparkles, Trophy, AlertTriangle, UserCheck } from 'lucide-react';

export type FilterChipType = 'ALL' | 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'HAS_EMAIL' | 'HAS_PHONE' | 'HAS_WEBSITE';

interface FilterChipsProps {
  activeFilter: FilterChipType;
  onFilterChange: (filter: FilterChipType) => void;
  counts: {
    all: number;
    newCount: number;
    contacted: number;
    qualified: number;
    won: number;
    hasEmail: number;
    hasPhone: number;
    hasWebsite: number;
  };
  page?: 'find_leads' | 'database';
}

export const FilterChips = ({ activeFilter, onFilterChange, counts, page = 'find_leads' }: FilterChipsProps) => {
  const allChips: { id: FilterChipType; label: string; icon: React.ElementType; count: number; category: 'channel' | 'crm' }[] = [
    { id: 'ALL', label: 'All Leads', icon: CheckCircle2, count: counts.all, category: 'channel' },
    { id: 'HAS_PHONE', label: 'Has Phone (WA)', icon: Phone, count: counts.hasPhone, category: 'channel' },
    { id: 'HAS_EMAIL', label: 'Has Email', icon: Mail, count: counts.hasEmail, category: 'channel' },
    { id: 'HAS_WEBSITE', label: 'Has Website', icon: Globe, count: counts.hasWebsite, category: 'channel' },
    { id: 'NEW', label: '🔵 New Lead', icon: Sparkles, count: counts.newCount, category: 'crm' },
    { id: 'CONTACTED', label: '🟡 Contacted', icon: Clock, count: counts.contacted, category: 'crm' },
    { id: 'QUALIFIED', label: '🟣 Qualified', icon: UserCheck, count: counts.qualified, category: 'crm' },
    { id: 'WON', label: '🟢 Won / Deal', icon: Trophy, count: counts.won, category: 'crm' },
  ];

  const chips = page === 'find_leads' 
    ? allChips.filter(c => c.category === 'channel')
    : allChips;

  return (
    <div className="flex flex-wrap items-center gap-2 font-sans">
      {chips.map((chip) => {
        const Icon = chip.icon;
        const isActive = activeFilter === chip.id;

        return (
          <button
            key={chip.id}
            onClick={() => onFilterChange(chip.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border cursor-pointer ${
              isActive
                ? 'bg-[#4a6382] text-white border-[#4a6382] shadow-xs'
                : 'bg-white border-slate-200/90 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
            <span>{chip.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
