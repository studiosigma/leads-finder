import React from 'react';
import { Mail, Phone, Globe, CheckCircle2, Clock } from 'lucide-react';

export type FilterChipType = 'ALL' | 'HAS_EMAIL' | 'HAS_PHONE' | 'HAS_WEBSITE' | 'READY' | 'FOLLOW_UP';

interface FilterChipsProps {
  activeFilter: FilterChipType;
  onFilterChange: (filter: FilterChipType) => void;
  counts: {
    all: number;
    hasEmail: number;
    hasPhone: number;
    hasWebsite: number;
    ready: number;
    followUp: number;
  };
}

export const FilterChips = ({ activeFilter, onFilterChange, counts }: FilterChipsProps) => {
  const chips: { id: FilterChipType; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'ALL', label: 'All Leads', icon: CheckCircle2, count: counts.all },
    { id: 'HAS_EMAIL', label: 'Has Email', icon: Mail, count: counts.hasEmail },
    { id: 'HAS_PHONE', label: 'Has Phone', icon: Phone, count: counts.hasPhone },
    { id: 'HAS_WEBSITE', label: 'Has Website', icon: Globe, count: counts.hasWebsite },
    { id: 'READY', label: 'Status: Ready', icon: CheckCircle2, count: counts.ready },
    { id: 'FOLLOW_UP', label: 'Status: Follow Up', icon: Clock, count: counts.followUp },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const Icon = chip.icon;
        const isActive = activeFilter === chip.id;

        return (
          <button
            key={chip.id}
            onClick={() => onFilterChange(chip.id)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <Icon size={14} className={isActive ? 'text-white' : 'text-zinc-400'} />
            <span>{chip.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-blue-700 text-white' : 'bg-zinc-100 text-zinc-500'
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
