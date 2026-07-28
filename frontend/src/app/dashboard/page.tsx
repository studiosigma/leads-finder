'use client';

import React, { useEffect, useState } from 'react';
import { ResultCard } from '@/components/leads/result-card';
import { DataTable } from '@/components/leads/data-table';
import { BulkActionsBar } from '@/components/leads/bulk-actions-bar';
import { WebhookModal } from '@/components/leads/webhook-modal';
import { AiPitchModal } from '@/components/leads/ai-pitch-modal';
import { StatTile } from '@/components/dashboard/stat-tile';
import { Search, Filter, Download, LayoutGrid, Table, Database } from 'lucide-react';

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
        if (response.ok) {
          const data = await response.json();
          setLeads(data && data.length > 0 ? data : []);
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  // Rich mock fallback if backend dataset is empty on client
  const defaultLeads = [
    { id: '1', name: 'Acme Corp', category: 'Technology', location: 'San Francisco, CA', website: 'acme.co', email: 'sarah@acme.co', phone: '+1 555-0192', status: 'READY' },
    { id: '2', name: 'Data Tech', category: 'Technology', location: 'San Francisco, CA', website: 'datatech.io', email: 'contact@datatech.io', phone: '+1 555-0192', status: 'READY' },
    { id: '3', name: 'Global Solutions', category: 'Marketing', location: 'San Francisco, CA', website: 'globalsol.com', email: 'info@globalsol.com', phone: '+1 555-0192', status: 'READY' },
    { id: '4', name: 'Apex Innovations', category: 'Technology', location: 'San Francisco, CA', website: 'apex.io', email: 'hello@apex.io', phone: '+1 555-0192', status: 'READY' },
    { id: '5', name: 'Bimrny Tech', category: 'Marketing', location: 'San Francisco, CA', website: 'bimrny.com', email: 'sales@bimrny.com', phone: '+1 555-0192', status: 'READY' },
    { id: '6', name: 'Glesan Tech', category: 'Technology', location: 'San Francisco, CA', website: 'glesan.io', email: 'info@glesan.io', phone: '+1 555-0192', status: 'READY' },
    { id: '7', name: 'Eech Liog', category: 'Marketing', location: 'San Francisco, CA', website: 'eech.com', email: 'hello@eech.com', phone: '+1 555-0192', status: 'READY' },
  ];

  const displayLeads = leads.length > 0 ? leads : defaultLeads;

  const totalLeads = displayLeads.length;
  const emailsFound = displayLeads.filter((l) => l.email && l.email !== 'N/A').length;
  const phonesFound = displayLeads.filter((l) => l.phone && l.phone !== 'N/A').length;
  const websitesFound = displayLeads.filter((l) => l.website && l.website !== 'N/A').length;

  const filteredLeads = displayLeads.filter((lead) => {
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

  const selectedLeadsObjects = displayLeads.filter((l) => selectedIds.includes(l.id));

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
        <a
          href="http://localhost:8000/api/v1/export/csv"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4a6382] hover:bg-[#3b5175] text-white text-xs font-bold rounded-xl transition-all shadow-xs self-start sm:self-auto"
        >
          <Download size={14} /> Export CSV
        </a>
      </div>

      {/* Analytics Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile label="Total Leads" value={totalLeads.toString()} trend="+100%" />
        <StatTile label="Emails Found" value={emailsFound.toString()} trend="+100%" />
        <StatTile label="Phone Found" value={phonesFound.toString()} trend="+100%" />
        <StatTile label="Website Found" value={websitesFound.toString()} trend="+100%" />
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

        {/* Data Table */}
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
