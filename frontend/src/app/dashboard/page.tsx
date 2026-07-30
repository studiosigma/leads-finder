'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ResultCard } from '@/components/leads/result-card';
import { DataTable } from '@/components/leads/data-table';
import { MapView } from '@/components/leads/map-view';
import { ImportModal } from '@/components/leads/import-modal';
import { BulkActionsBar } from '@/components/leads/bulk-actions-bar';
import { WebhookModal } from '@/components/leads/webhook-modal';
import { AiPitchModal } from '@/components/leads/ai-pitch-modal';
import { StatTile } from '@/components/dashboard/stat-tile';
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts';
import { ScrapingHistoryTable, ScrapingSession } from '@/components/dashboard/scraping-history-table';
import { KanbanBoard } from '@/components/dashboard/kanban-board';
import { Search, Filter, Download, LayoutGrid, Table, Database, SearchX, MapPin, Upload, Search as SearchIcon, Clock, Sparkles, PieChart, BarChart3, X, Trash2, Columns } from 'lucide-react';

export default function DashboardPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'history'>('leads');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'card' | 'map'>('kanban');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [webhookModalLead, setWebhookModalLead] = useState<any | null>(null);
  const [aiPitchModalLead, setAiPitchModalLead] = useState<any | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Scraping Sessions State
  const [sessions, setSessions] = useState<ScrapingSession[]>([]);
  const [activeSessionFilter, setActiveSessionFilter] = useState<ScrapingSession | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const isLegacySyntheticLead = (lead: any) => {
    if (!lead || !lead.name) return true;
    const nameLower = lead.name.toLowerCase();
    const emailLower = (lead.email || '').toLowerCase();
    return (
      nameLower.includes('sekolahan') ||
      emailLower.includes('sekolahan.co.id') ||
      nameLower.includes('nusantara sekolahan') ||
      nameLower.includes('sentra sekolahan') ||
      nameLower.includes('mitra utama sekolahan') ||
      nameLower.includes('karya mandiri sekolahan') ||
      nameLower.includes('surya baru sekolahan') ||
      /pabrik\s+\d+/i.test(nameLower) ||
      /pusat\s+\d+/i.test(nameLower)
    );
  };

  const handleClearDatabaseCache = () => {
    setLeads([]);
    setSessions([]);
    localStorage.removeItem('lfe_active_leads');
    localStorage.removeItem('lfe_scraping_sessions');
  };

  useEffect(() => {
    let combinedLeads: any[] = [];

    // 1. Load active leads from localStorage
    try {
      const savedActive = localStorage.getItem('lfe_active_leads');
      if (savedActive) {
        const parsed = JSON.parse(savedActive);
        if (Array.isArray(parsed)) {
          combinedLeads = [...parsed];
        }
      }
    } catch (e) {
      console.error('Error loading active leads:', e);
    }

    // 2. Load all past sessions from localStorage & extract leads from every session
    try {
      const savedSessions = JSON.parse(localStorage.getItem('lfe_scraping_sessions') || '[]');
      setSessions(savedSessions);

      const existingIds = new Set(combinedLeads.map((l) => l.id));
      savedSessions.forEach((sess: ScrapingSession) => {
        if (sess.leads && Array.isArray(sess.leads)) {
          sess.leads.forEach((l: any) => {
            if (l.id && !existingIds.has(l.id)) {
              existingIds.add(l.id);
              combinedLeads.push(l);
            }
          });
        }
      });
    } catch (e) {
      console.error('Error loading sessions:', e);
    }

    const cleanLeads = combinedLeads.filter((l) => !isLegacySyntheticLead(l));
    setLeads(cleanLeads);
    setLoading(false);

    // 3. Fetch from Backend API without overwriting local storage
    async function fetchBackendLeads() {
      try {
        const response = await fetch(`${API_BASE}/api/v1/leads`);
        if (response.ok) {
          const backendData = await response.json();
          if (Array.isArray(backendData) && backendData.length > 0) {
            const cleanBackend = backendData.filter((b: any) => !isLegacySyntheticLead(b));
            setLeads((prev) => {
              const prevIds = new Set(prev.map((l) => l.id));
              const merged = [...prev, ...cleanBackend.filter((b: any) => !prevIds.has(b.id))];
              localStorage.setItem('lfe_active_leads', JSON.stringify(merged));
              return merged;
            });
          }
        }
      } catch (error) {
        // silent fallback
      }
    }

    fetchBackendLeads();
  }, []);

  const handleStatusChange = (leadId: string, newStatus: string) => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
      try {
        localStorage.setItem('lfe_active_leads', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    localStorage.setItem('lfe_scraping_sessions', JSON.stringify(updated));
    if (activeSessionFilter?.id === sessionId) {
      setActiveSessionFilter(null);
    }
  };

  const handleInspectSession = (sess: ScrapingSession) => {
    setActiveSessionFilter(sess);
    setActiveTab('leads');
    if (sess.leads && sess.leads.length > 0) {
      setLeads((prev) => {
        const cleanSessLeads = sess.leads!.filter((l) => !isLegacySyntheticLead(l));
        const existingIds = new Set(prev.map((l) => l.id));
        const newLeads = cleanSessLeads.filter((l) => !existingIds.has(l.id));
        return [...newLeads, ...prev];
      });
    }
  };

  const totalLeads = leads.length;
  const emailsFound = leads.filter((l) => l.email && l.email !== 'N/A' && l.email !== '-').length;
  const phonesFound = leads.filter((l) => l.phone && l.phone !== 'N/A' && l.phone !== '-').length;
  const websitesFound = leads.filter((l) => l.website && l.website !== 'N/A' && l.website !== '-').length;

  const emailRate = totalLeads > 0 ? Math.round((emailsFound / totalLeads) * 100) : 0;
  const phoneRate = totalLeads > 0 ? Math.round((phonesFound / totalLeads) * 100) : 0;
  const webRate = totalLeads > 0 ? Math.round((websitesFound / totalLeads) * 100) : 0;

  const handleImportSuccess = (importedLeads: any[]) => {
    setLeads((prev) => {
      const updated = [...importedLeads, ...prev].filter((l) => !isLegacySyntheticLead(l));
      localStorage.setItem('lfe_active_leads', JSON.stringify(updated));
      return updated;
    });
  };

  const displayLeads = (activeSessionFilter && activeSessionFilter.leads && activeSessionFilter.leads.length > 0
    ? activeSessionFilter.leads
    : leads).filter((l) => !isLegacySyntheticLead(l));

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
            Real-time metric overview, central database, and scraping history logs.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {leads.length > 0 && (
            <button
              onClick={handleClearDatabaseCache}
              className="px-3 py-2 bg-slate-200/80 hover:bg-red-100 hover:text-red-700 border border-slate-300/80 text-slate-600 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
              title="Clear old cached data"
            >
              <Trash2 size={14} /> Clear Cache
            </button>
          )}

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

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile label="Total Leads" value={totalLeads.toString()} trend={totalLeads > 0 ? `${totalLeads} Total` : 'Ready'} />
        <StatTile label="Emails Found" value={emailsFound.toString()} trend={`${emailRate}% Verified`} />
        <StatTile label="Phone Found" value={phonesFound.toString()} trend={`${phoneRate}% WhatsApp`} />
        <StatTile label="Website Found" value={websitesFound.toString()} trend={`${webRate}% Active`} />
      </div>

      {/* Visual Pie & Bar Chart Analytics */}
      <AnalyticsCharts leads={leads} />

      {/* Main View Tab Switcher: All Collected Leads vs Scraping History Logs */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pt-2 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'leads'
                ? 'bg-[#4a6382] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/90'
            }`}
          >
            <Database size={14} /> All Collected Leads ({displayLeads.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#4a6382] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/90'
            }`}
          >
            <Clock size={14} /> Scraping History Logs ({sessions.length} Sessions)
          </button>
        </div>

        {activeSessionFilter && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl text-xs font-bold text-blue-900">
            <span>Filter Session: "{activeSessionFilter.query}"</span>
            <button
              onClick={() => setActiveSessionFilter(null)}
              className="text-blue-500 hover:text-blue-700 font-bold p-0.5"
              title="Clear Session Filter"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Tab Content Section */}
      {activeTab === 'history' ? (
        <ScrapingHistoryTable
          sessions={sessions}
          onSelectSession={handleInspectSession}
          onDeleteSession={handleDeleteSession}
        />
      ) : (
        /* Database Controls Toolbar */
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-base font-bold text-slate-800">
              {activeSessionFilter ? `Session Leads: "${activeSessionFilter.query}"` : 'All Collected Leads'} ({filteredLeads.length})
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
                  onClick={() => setViewMode('kanban')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="CRM Sales Pipeline Kanban Board"
                >
                  <Columns size={14} /> Kanban Pipeline
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
                {(['ALL', 'READY', 'CONTACTED', 'QUALIFIED', 'WON'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
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
          {displayLeads.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <SearchX size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Database is Currently Empty</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  No B2B leads collected yet. You can start a real-time business prospect search or upload an existing CSV spreadsheet to auto-enrich data.
                </p>
              </div>

              {/* Quick Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/"
                  className="px-5 py-2.5 bg-[#4a6382] hover:bg-[#3b5175] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                >
                  <SearchIcon size={14} /> Start Real-time Lead Search
                </Link>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
                >
                  <Upload size={14} /> Import CSV & Auto-Enrich
                </button>
              </div>
            </div>
          ) : viewMode === 'kanban' ? (
            <KanbanBoard
              leads={filteredLeads}
              onStatusChange={handleStatusChange}
              onOpenAiPitchModal={setAiPitchModalLead}
            />
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
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLeads.map((lead: any, idx: number) => (
                <ResultCard key={lead.id || idx} lead={lead} />
              ))}
            </div>
          )}
        </div>
      )}

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
