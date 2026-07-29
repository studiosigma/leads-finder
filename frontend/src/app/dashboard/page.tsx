'use client';

import React, { useEffect, useState } from 'react';
import { ResultCard } from '@/components/leads/result-card';
import { DataTable } from '@/components/leads/data-table';
import { MapView } from '@/components/leads/map-view';
import { ImportModal } from '@/components/leads/import-modal';
import { BulkActionsBar } from '@/components/leads/bulk-actions-bar';
import { WebhookModal } from '@/components/leads/webhook-modal';
import { AiPitchModal } from '@/components/leads/ai-pitch-modal';
import { StatTile } from '@/components/dashboard/stat-tile';
import { Search, Filter, Download, LayoutGrid, Table, Database, SearchX, MapPin, Upload } from 'lucide-react';

export default function DashboardPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'card' | 'table' | 'map'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [webhookModalLead, setWebhookModalLead] = useState<any | null>(null);
  const [aiPitchModalLead, setAiPitchModalLead] = useState<any | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch(`${API_BASE}/api/v1/leads`);
        if (response.ok) {
          const data = await response.json();
          setLeads(data || []);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const totalLeads = leads.length;
  const emailsFound = leads.filter((l) => l.email && l.email !== 'N/A' && l.email !== '-').length;
  const phonesFound = leads.filter((l) => l.phone && l.phone !== 'N/A' && l.phone !== '-').length;
  const websitesFound = leads.filter((l) => l.website && l.website !== 'N/A' && l.website !== '-').length;

  const handleImportSuccess = (importedLeads: any[]) => {
    setLeads((prev) => [...importedLeads, ...prev]);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus =
      statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.category?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

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

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium bg-[#f1f5f9] min-h-screen">Loading leads database...</div>;

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] p-8 space-y-6 relative pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Database className="text-slate-700" size={24} /> Leads Database & Analytics
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time metric overview and central database for collected B2B leads.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <Upload size={14} /> Import CSV & Enrich
          </button>
          
          <a
            href={`${API_BASE}/api/v1/export/csv`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4a6382] hover:bg-[#3b5175] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <Download size={14} /> Export CSV
          </a>
        </div>
      </div>

      {/* Analytics Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile label="Total Leads" value={totalLeads.toString()} trend="+0%" />
        <StatTile label="Emails Found" value={emailsFound.toString()} trend="+0%" />
        <StatTile label="Phone Found" value={phonesFound.toString()} trend="+0%" />
        <StatTile label="Website Found" value={websitesFound.toString()} trend="+0%" />
      </div>

      {/* Database Controls Toolbar */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-base font-bold text-slate-800">
            Collected Leads ({filteredLeads.length})
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Spreadsheet Table View"
              >
                <Table size={14} /> Table
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                  viewMode === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid size={14} /> Cards
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Interactive Map View"
              >
                <MapPin size={14} /> Map
              </button>
            </div>

            {/* Search Filter Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-200/90 p-1 rounded-xl">
              <Filter size={14} className="text-slate-400 ml-2" />
              {(['ALL', 'READY', 'FOLLOW UP'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    statusFilter === st
                      ? 'bg-[#4a6382] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table / Map View / Card Grid View */}
        {leads.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <SearchX size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Database is Currently Empty</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              No leads saved in database yet. Go to <b>Find Leads</b> to run your first real-time business prospect search or click <b>Import CSV</b> above.
            </p>
          </div>
        ) : viewMode === 'map' ? (
          <MapView leads={filteredLeads} />
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
      </div>

      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedLeads={selectedLeadsObjects}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      <WebhookModal
        isOpen={Boolean(webhookModalLead)}
        onClose={() => setWebhookModalLead(null)}
        lead={webhookModalLead}
      />

      <AiPitchModal
        isOpen={Boolean(aiPitchModalLead)}
        onClose={() => setAiPitchModalLead(null)}
        lead={aiPitchModalLead}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
