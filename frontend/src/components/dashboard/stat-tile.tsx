import React from 'react';
import { TrendingUp, Users, Mail, Phone, Globe } from 'lucide-react';

interface StatTileProps {
  label: string;
  value: string;
  trend?: string;
}

export const StatTile = ({ label, value, trend = '+100%' }: StatTileProps) => {
  const getIcon = () => {
    if (label.toLowerCase().includes('email')) return Mail;
    if (label.toLowerCase().includes('phone')) return Phone;
    if (label.toLowerCase().includes('website')) return Globe;
    return Users;
  };

  const Icon = getIcon();

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <div className="w-8 h-8 rounded-xl bg-slate-100/80 text-slate-700 flex items-center justify-center">
          <Icon size={16} />
        </div>
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <TrendingUp size={10} /> {trend}
        </span>
      </div>
    </div>
  );
};
