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
import { Sparkles, Plus, SlidersHorizontal, LayoutGrid, Table, Search as SearchIcon } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

export default function Home() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
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
    setShowSearchModal(false);

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

  // Default Mock leads if empty to match initial visual mockup
  const displayLeads = leads.length > 0 ? leads : [
    { id: '1', name: 'Acme Corp', category: 'Technology', location: 'San Francisco, CA', website: 'acme.co', email: 'sarah@acme.co', phone: '+1 555-0192', status: 'READY' },
    { id: '2', name: 'Data Tech', category: 'Technology', location: 'San Francisco, CA', website: 'datatech.io', email: 'contact@datatech.io', phone: '+1 555-0192', status: 'READY' },
    { id: '3', name: 'Global Solutions', category: 'Marketing', location: 'San Francisco, CA', website: 'globalsol.com', email: 'info@globalsol.com', phone: '+1 555-0192', status: 'READY' },
    { id: '4', name: 'Apex Innovations', category: 'Technology', location: 'San Francisco, CA', website: 'apex.io', email: 'hello@apex.io', phone: '+1 555-0192', status: 'READY' },
    { id: '5', name: 'Bimrny Tech', category: 'Marketing', location: 'San Francisco, CA', website: 'bimrny.com', email: 'sales@bimrny.com', phone: '+1 555-0192', status: 'READY' },
    { id: '6', name: 'Glesan Tech', category: 'Technology', location: 'San Francisco, CA', website: 'glesan.io', email: 'info@glesan.io', phone: '+1 555-0192', status: 'READY' },
    { id: '7', name: 'Eech Liog', category: 'Marketing', location: 'San Francisco, CA', website: 'eech.com', email: 'hello@eech.com', phone: '+1 555-0192', status: 'READY' },
  ];

  const filteredLeads = displayLeads.filter((lead) => {
    if (activeFilter === 'HAS_EMAIL') return lead.email && lead.email !== 'N/A';
    if (activeFilter === 'HAS_PHONE') return lead.phone && lead.phone !== 'N/A';
    if (activeFilter === 'HAS_WEBSITE') return lead.website && lead.website !== 'N/A';
    if (activeFilter === 'READY') return lead.status === 'READY';
    if (activeFilter === 'FOLLOW_UP') return lead.status === 'FOLLOW UP';
    return true;
  });

  const filterCounts = {
    all: displayLeads.length,
    hasEmail: displayLeads.filter((l) => l.email && l.email !== 'N/A').length,
    hasPhone: displayLeads.filter((l) => l.phone && l.phone !== 'N/A').length,
    hasWebsite: displayLeads.filter((l) => l.website && l.website !== 'N/A').length,
    ready: displayLeads.filter((l) => l.status === 'READY').length,
    followUp: displayLeads.filter((l) => l.status === 'FOLLOW UP').length,
  };

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

  const selectedLeadsObjects = displayLeads.filter((l) => selectedIds.includes(l.id));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 relative pb-28 font-sans">
      
      {/* Page Header (Matches Design Mockup 1:1) */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Leads</h1>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearchModal(!showSearchModal)}
            className="px-3.5 py-2 bg-slate-200/70 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 border border-slate-300/50"
          >
            <SlidersHorizontal size={14} /> Sint Leads
          </button>
          
          <button
            onClick={() => setShowSearchModal(true)}
            className="px-4 py-2 bg-[#4a6382] hover:bg-[#3b5175] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={16} /> Find Leads
          </button>
        </div>
      </div>

      {/* Search Input Bar Collapsible Modal / Bar */}
      {showSearchModal && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md space-y-3 animate-in fade-in duration-150">
          <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <SearchIcon size={14} className="text-slate-500" /> Enter Business Keywords / Location
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      {/* Progress Tracker Modal */}
      {isSearching && (
        <div className="pt-2">
          <ProgressTracker steps={searchSteps} />
        </div>
      )}

      {/* Filter Chips Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
        <FilterChips
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <div className="flex items-center bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Spreadsheet Table View"
            >
              <Table size={14} /> Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid size={14} /> Cards
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Data Table View */}
      {viewMode === 'table' ? (
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

      {/* AI Cold Outreach Pitch Generator Modal */}
      <AiPitchModal
        isOpen={Boolean(aiPitchModalLead)}
        onClose={() => setAiPitchModalLead(null)}
        lead={aiPitchModalLead}
      />
    </div>
  );
}
