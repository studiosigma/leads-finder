'use client';

import React from 'react';
import { PieChart, BarChart3, MapPin, Tag } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  category: string;
  location: string;
}

interface AnalyticsChartsProps {
  leads: Lead[];
}

export const AnalyticsCharts = ({ leads }: AnalyticsChartsProps) => {
  if (!leads || leads.length === 0) return null;

  // 1. Calculate Category Counts & Percentages
  const categoryCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const cat = l.category && l.category !== 'N/A' ? l.category : 'General Business';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const total = leads.length;
  const categoryColors = ['#4a6382', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
  
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate Donut SVG Slices
  let cumulativePercent = 0;
  const donutSlices = sortedCategories.map(([cat, count], idx) => {
    const percent = count / total;
    const startAngle = cumulativePercent * 360;
    cumulativePercent += percent;
    const endAngle = cumulativePercent * 360;
    return { cat, count, percent: Math.round(percent * 100), color: categoryColors[idx % categoryColors.length], startAngle, endAngle };
  });

  // 2. Calculate Top Cities / Locations
  const locationCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const loc = l.location && l.location !== 'N/A' ? l.location.split(',')[0].trim() : 'Indonesia';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });

  const sortedLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-sans">
      
      {/* Category Donut Chart Widget */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <PieChart size={16} className="text-[#4a6382]" /> Industry Category Distribution
          </h3>
          <span className="text-[10px] font-bold text-slate-400">Categories</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
          {/* Custom SVG Donut Chart */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {donutSlices.map((slice, i) => {
                const strokeDasharray = `${slice.percent * 2.83} 283`;
                const strokeDashoffset = -donutSlices.slice(0, i).reduce((acc, s) => acc + s.percent * 2.83, 0);
                return (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="10"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-slate-800 leading-none">{total}</span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Leads</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2 flex-1 w-full">
            {sortedCategories.map(([cat, count], idx) => {
              const pct = Math.round((count / total) * 100);
              const color = categoryColors[idx % categoryColors.length];
              return (
                <div key={cat} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate max-w-[170px]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-slate-700 font-bold truncate">{cat}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-500">
                    <span>{count}</span>
                    <span className="text-slate-400">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Cities Bar Chart Widget */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <BarChart3 size={16} className="text-[#4a6382]" /> Top Prospect Regions & Cities
          </h3>
          <span className="text-[10px] font-bold text-slate-400">Geography</span>
        </div>

        <div className="space-y-3 pt-2">
          {sortedLocations.map(([city, count], idx) => {
            const pct = Math.round((count / total) * 100);
            return (
              <div key={city} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin size={12} className="text-red-500 shrink-0" /> {city}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-600">
                    {count} Leads <span className="text-slate-400 font-normal">({pct}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4a6382] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
