'use client';

import React, { useEffect, useState } from 'react';
import { ResultCard } from '@/components/leads/result-card';
import { DataTable } from '@/components/leads/data-table';
import { BulkActionsBar } from '@/components/leads/bulk-actions-bar';
import { WebhookModal } from '@/components/leads/webhook-modal';
import { AiPitchModal } from '@/components/leads/ai-pitch-modal';
import { StatTile } from '@/components/dashboard/stat-tile';
import { Search, Filter, Download, LayoutGrid, Table } from 'lucide-react';

export default function DashboardPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [webhookModalLead, setWebhookModalLead] = useState<any | null>(null);
  const [aiPitchModalLead, setAiPitchModalLead] = useState<any | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch('http://localhost:8000/api/v1/leads');
        const data = await response.json();
        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const totalLeads = leads.length;
  const emailsFound = leads.filter((l) => l.email && l.email !== 'N/A').length;
  const phonesFound = leads.filter((l) => l.phone && l.phone !== 'N/A').length;
  const websitesFound = leads.filter((l) => l.website && l.website !== 'N/A').length;

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

  if (loading) return <div className="p-10 text-center text-zinc-500 font-medium">Loading leads...</div>;

  return (
    <div className="p-8 bg-zinc-50 min-h-screen space-y-8 relative pb-28">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard & Analytics</h1>
          <p className="text-sm text-zinc-500">Real-time overview of collected B2B leads.</p>
        </div>
        <a
          href="http://localhost:8000/api/v1/export/csv"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition-colors self-start sm:self-auto"
        >
          <Download size={14} /> Export CSV
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatTile label="Total Leads" value={totalLeads.toString()} />
        <StatTile label="Emails Found" value={emailsFound.toString()} />
        <StatTile label="Phone Found" value={phonesFound.toString()} />
        <StatTile label="Website Found" value={websitesFound.toString()} />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold text-zinc-900">
            Collected Leads ({filteredLeads.length})
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
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

            {/* Search Filter */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-white border border-zinc-200 p-1 rounded-lg">
              <Filter size={14} className="text-zinc-400 ml-2" />
              {(['ALL', 'READY', 'FOLLOW UP'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-zinc-500 text-sm">
            No leads matching current filters.
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
      </div>

      <BulkActionsBar
        selectedLeads={selectedLeadsObjects}
        onClearSelection={() => setSelectedIds([])}
      />

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
    </div>
  );
}




