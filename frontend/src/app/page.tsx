'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/components/leads/search-bar';
import { ProgressTracker } from '@/components/leads/progress-tracker';
import { ResultCard } from '@/components/leads/result-card';
import { DataTable } from '@/components/leads/data-table';
import { FilterChips, FilterChipType } from '@/components/leads/filter-chips';
import { BulkActionsBar } from '@/components/leads/bulk-actions-bar';
import { WebhookModal } from '@/components/leads/webhook-modal';
import { AiPitchModal } from '@/components/leads/ai-pitch-modal';
import { Sparkles, Download, RefreshCw, LayoutGrid, Table } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

export default function Home() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [activeFilter, setActiveFilter] = useState<FilterChipType>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [webhookModalLead, setWebhookModalLead] = useState<any | null>(null);
  const [aiPitchModalLead, setAiPitchModalLead] = useState<any | null>(null);

  const [searchSteps, setSearchSteps] = useState<Step[]>([
    { id: '1', label: 'Initiating Scraper Engine...', status: 'pending' },
    { id: '2', label: 'Extracting Google Maps & Business Directory...', status: 'pending' },
    { id: '3', label: 'Crawling Company Websites for Email & Phone...', status: 'pending' },
    { id: '4', label: 'Deduplicating & Saving Cleaned Leads...', status: 'pending' },
  ]);

  const fetchLeads = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data || []);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setCurrentQuery(query);

    setSearchSteps([
      { id: '1', label: 'Initiating Scraper Engine...', status: 'active' },
      { id: '2', label: 'Extracting Google Maps & Business Directory...', status: 'pending' },
      { id: '3', label: 'Crawling Company Websites for Email & Phone...', status: 'pending' },
      { id: '4', label: 'Deduplicating & Saving Cleaned Leads...', status: 'pending' },
    ]);

    try {
      const res = await fetch('http://localhost:8000/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 10 }),
      });

      const data = await res.json();
      const jobId = data.job_id;

      setSearchSteps([
        { id: '1', label: 'Initiating Scraper Engine...', status: 'completed' },
        { id: '2', label: `Extracting Places for "${query}"...`, status: 'active' },
        { id: '3', label: 'Crawling Company Websites for Email & Phone...', status: 'pending' },
        { id: '4', label: 'Deduplicating & Saving Cleaned Leads...', status: 'pending' },
      ]);

      let intervalId = setInterval(async () => {
        try {
          const statusRes = await fetch(`http://localhost:8000/api/v1/status/${jobId}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'SUCCESS' || statusData.status === 'completed' || statusData.result) {
            clearInterval(intervalId);

            setSearchSteps([
              { id: '1', label: 'Initiating Scraper Engine...', status: 'completed' },
              { id: '2', label: 'Extracting Google Maps & Places...', status: 'completed' },
              { id: '3', label: 'Crawling Websites for Contact Info...', status: 'completed' },
              { id: '4', label: 'Saved Cleaned Leads to Database!', status: 'completed' },
            ]);

            setTimeout(async () => {
              await fetchLeads();
              setIsSearching(false);
            }, 1000);
          } else {
            setSearchSteps([
              { id: '1', label: 'Initiating Scraper Engine...', status: 'completed' },
              { id: '2', label: 'Extracting Google Maps & Places...', status: 'completed' },
              { id: '3', label: 'Crawling Target Websites (In Progress)...', status: 'active' },
              { id: '4', label: 'Deduplicating & Saving Cleaned Leads...', status: 'pending' },
            ]);
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 2000);

      setTimeout(async () => {
        clearInterval(intervalId);
        await fetchLeads();
        setIsSearching(false);
      }, 25000);

    } catch (error) {
      console.error('Search error:', error);
      setIsSearching(false);
    }
  };

  // Filter Logic
  const filteredLeads = leads.filter((lead) => {
    if (activeFilter === 'HAS_EMAIL') return lead.email && lead.email !== 'N/A';
    if (activeFilter === 'HAS_PHONE') return lead.phone && lead.phone !== 'N/A';
    if (activeFilter === 'HAS_WEBSITE') return lead.website && lead.website !== 'N/A';
    if (activeFilter === 'READY') return lead.status === 'READY';
    if (activeFilter === 'FOLLOW_UP') return lead.status === 'FOLLOW UP';
    return true;
  });

  const filterCounts = {
    all: leads.length,
    hasEmail: leads.filter((l) => l.email && l.email !== 'N/A').length,
    hasPhone: leads.filter((l) => l.phone && l.phone !== 'N/A').length,
    hasWebsite: leads.filter((l) => l.website && l.website !== 'N/A').length,
    ready: leads.filter((l) => l.status === 'READY').length,
    followUp: leads.filter((l) => l.status === 'FOLLOW UP').length,
  };

  // Selection Logic
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  const selectedLeadsObjects = leads.filter((l) => selectedIds.includes(l.id));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative pb-28">
      {/* Hero Section */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
          <Sparkles size={14} /> AI B2B Prospecting & Scraping Platform
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl">
          Find Business Leads in Seconds
        </h1>
        <p className="text-zinc-600 max-w-2xl mx-auto text-sm">
          Scrape Google Maps, Search Engines, and company websites for verified emails, phone numbers, and location details automatically.
        </p>
      </div>

      {/* Search Input */}
      <div className="w-full">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Progress Tracker Modal / Card */}
      {isSearching && (
        <div className="pt-2">
          <ProgressTracker steps={searchSteps} />
        </div>
      )}

      {/* Filter Chips & View Mode Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-zinc-200">
        <FilterChips
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-zinc-200 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Spreadsheet Table View"
            >
              <Table size={14} /> Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'card' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid size={14} /> Cards
            </button>
          </div>

          <button
            onClick={fetchLeads}
            className="p-2 border border-zinc-200 bg-white rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors"
            title="Refresh Leads"
          >
            <RefreshCw size={14} />
          </button>

          <a
            href="http://localhost:8000/api/v1/export/csv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <Download size={14} /> Export CSV
          </a>
        </div>
      </div>

      {/* Results Display */}
      {filteredLeads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200 p-8 space-y-3">
          <p className="text-zinc-500 font-medium text-sm">No leads match current filter.</p>
          <p className="text-xs text-zinc-400">
            Type a query in the search bar above (e.g. <span className="italic">"Pabrik Plastik Bekasi"</span> or <span className="italic">"Hotel Bandung"</span>) to start scraping.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <DataTable
          leads={filteredLeads}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onOpenWebhookModal={setWebhookModalLead}
          onOpenAiPitchModal={setAiPitchModalLead}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead: any, idx: number) => (
            <ResultCard key={lead.id || idx} lead={lead} />
          ))}
        </div>
      )}

      {/* Bulk Actions Floating Bar */}
      <BulkActionsBar
        selectedLeads={selectedLeadsObjects}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Webhook Modal */}
      <WebhookModal
        isOpen={Boolean(webhookModalLead)}
        onClose={() => setWebhookModalLead(null)}
        lead={webhookModalLead}
      />

      {/* AI Pitch Modal */}
      <AiPitchModal
        isOpen={Boolean(aiPitchModalLead)}
        onClose={() => setAiPitchModalLead(null)}
        lead={aiPitchModalLead}
      />
    </div>
  );
}



