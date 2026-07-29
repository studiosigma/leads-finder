'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, Check, Sparkles, Star, MapPin, Ban, Share2 } from 'lucide-react';

export interface SearchOptions {
  limit: number;
  requireEmail: boolean;
  requirePhone: boolean;
  requireWebsite: boolean;
  requireSocial: boolean;
  minRating: number;
  region: string;
  excludeKeywords: string;
  sources: {
    googleMaps: boolean;
    openStreetMap: boolean;
    websiteCrawler: boolean;
  };
}

interface SearchBarProps {
  onSearch: (query: string, options: SearchOptions) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [options, setOptions] = useState<SearchOptions>({
    limit: 10,
    requireEmail: false,
    requirePhone: false,
    requireWebsite: false,
    requireSocial: false,
    minRating: 0,
    region: 'all',
    excludeKeywords: '',
    sources: {
      googleMaps: true,
      openStreetMap: true,
      websiteCrawler: true,
    },
  });

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), options);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isFilterActive =
    options.limit !== 10 ||
    options.requireEmail ||
    options.requirePhone ||
    options.requireSocial ||
    options.minRating > 0 ||
    options.region !== 'all' ||
    options.excludeKeywords.trim() !== '';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 font-sans">
      {/* Search Input Bar */}
      <div className="relative flex items-center bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xs focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-transparent transition-all">
        <div className="pl-3.5 pr-2 text-slate-400">
          <Search className="h-5 w-5" />
        </div>

        <input
          type="text"
          className="w-full py-2.5 px-2 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          placeholder="What business are you looking for? (e.g. Pabrik Plastik Bekasi or Hotel Bandung)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Advanced Filters Toggle Button */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            showAdvanced || isFilterActive
              ? 'bg-[#4a6382] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Advanced Search Settings"
        >
          <SlidersHorizontal size={14} />
          <span>Advanced</span>
          <ChevronDown size={12} className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* Primary Search Button */}
        <button
          onClick={handleSearch}
          className="ml-1.5 bg-[#4a6382] hover:bg-[#3b5175] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5"
        >
          <Search size={14} />
          <span>Search</span>
        </button>
      </div>

      {/* Advanced Options Collapsible Panel */}
      {showAdvanced && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles size={14} className="text-slate-600" /> Advanced Search & Precision Filters
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Fine-tune scraper behavior & quality</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
            {/* 1. Max Leads Limit Input Field */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Target Leads Quantity</label>
              <input
                type="number"
                min={1}
                max={500}
                placeholder="Enter target quantity e.g. 50"
                value={options.limit || ''}
                onChange={(e) => setOptions({ ...options, limit: Math.max(1, Number(e.target.value)) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* 2. Rating & Review Threshold */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Star size={13} className="text-amber-500 fill-amber-500" /> Min. Rating Threshold
              </label>
              <select
                value={options.minRating}
                onChange={(e) => setOptions({ ...options, minRating: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value={0}>Any Rating (All Businesses)</option>
                <option value={4.0}>4.0+ Stars (Top Rated Only)</option>
                <option value={4.5}>4.5+ Stars (Highly Verified)</option>
              </select>
            </div>

            {/* 3. Target Region */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <MapPin size={13} className="text-slate-500" /> Target Region / City
              </label>
              <select
                value={options.region}
                onChange={(e) => setOptions({ ...options, region: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="all">All Regions (Default)</option>
                <option value="jabodetabek">Jabodetabek (Jakarta Metro)</option>
                <option value="surabaya">Surabaya & East Java</option>
                <option value="bandung">Bandung & West Java</option>
                <option value="medan">Medan & North Sumatra</option>
                <option value="bali">Bali & Nusa Tenggara</option>
              </select>
            </div>

            {/* 4. Exclude Keywords */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Ban size={13} className="text-red-500" /> Exclude Keywords (Negative)
              </label>
              <input
                type="text"
                placeholder="e.g. bekas, grosir, rental..."
                value={options.excludeKeywords}
                onChange={(e) => setOptions({ ...options, excludeKeywords: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* 5. Contact Requirements */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Contact Requirements</label>
              <div className="space-y-1.5 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={options.requireEmail}
                    onChange={(e) => setOptions({ ...options, requireEmail: e.target.checked })}
                    className="rounded border-slate-300 text-[#4a6382] focus:ring-[#4a6382]"
                  />
                  <span>Must Have Verified Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={options.requirePhone}
                    onChange={(e) => setOptions({ ...options, requirePhone: e.target.checked })}
                    className="rounded border-slate-300 text-[#4a6382] focus:ring-[#4a6382]"
                  />
                  <span>Must Have Phone / WhatsApp</span>
                </label>
              </div>
            </div>

            {/* 6. Active Scraper Sources & Social Requirements */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Share2 size={13} className="text-slate-500" /> Social & Scraper Sources
              </label>
              <div className="space-y-1.5 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={options.requireSocial}
                    onChange={(e) => setOptions({ ...options, requireSocial: e.target.checked })}
                    className="rounded border-slate-300 text-[#4a6382] focus:ring-[#4a6382]"
                  />
                  <span>Must Have Social Profile (IG/LinkedIn)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={options.sources.websiteCrawler}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        sources: { ...options.sources, websiteCrawler: e.target.checked },
                      })
                    }
                    className="rounded border-slate-300 text-[#4a6382] focus:ring-[#4a6382]"
                  />
                  <span>Website Deep Email Crawler</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
