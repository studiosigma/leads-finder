'use client';

import React from 'react';
import { Clock, Search, Download, Trash2, ArrowRight, MapPin, Database, CheckCircle2 } from 'lucide-react';

export interface ScrapingSession {
  id: string;
  query: string;
  timestamp: string;
  lead_count: number;
  location: string;
  sources: string[];
  status: string;
  leads?: any[];
}

interface ScrapingHistoryTableProps {
  sessions: ScrapingSession[];
  onSelectSession: (session: ScrapingSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const ScrapingHistoryTable = ({ sessions, onSelectSession, onDeleteSession }: ScrapingHistoryTableProps) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-xs font-sans">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <Clock size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Scraping History Logs</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Search session logs will automatically be recorded here whenever you perform a lead search or CSV import.
        </p>
      </div>
    );
  }

  const exportSessionCsv = (session: ScrapingSession) => {
    if (!session.leads || session.leads.length === 0) return;
    const headers = ['Company Name', 'Category', 'Location', 'Website', 'Email', 'Phone / WA', 'LinkedIn', 'Sources'];
    const rows = session.leads.map((l) => [
      `"${l.name || ''}"`,
      `"${l.category || ''}"`,
      `"${l.location || ''}"`,
      `"${l.website || ''}"`,
      `"${l.email || ''}"`,
      `"${String(l.phone || '').replace(/\n/g, ' / ')}"`,
      `"${l.linkedin_url || ''}"`,
      `"${(l.sources || ['Google Maps']).join(', ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_session_${session.query.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs font-sans">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#4a6382]" />
          <h3 className="text-xs font-extrabold text-slate-800">Scraping History Logs ({sessions.length} Sessions)</h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Auto Session Recording Active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-100/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Search Query Keyword</th>
              <th className="py-3 px-4">Target Region</th>
              <th className="py-3 px-4">Leads Extracted</th>
              <th className="py-3 px-4">Sources Priority</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((sess) => (
              <tr key={sess.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">
                  {sess.timestamp}
                </td>
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                  <Search size={13} className="text-[#4a6382] shrink-0" />
                  <span>"{sess.query}"</span>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  <span className="flex items-center gap-1 text-[11px]">
                    <MapPin size={12} className="text-red-500 shrink-0" /> {sess.location}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-800">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/80">
                    {sess.lead_count} Verified Leads
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {(sess.sources || ['Google Maps']).map((src, i) => (
                      <span
                        key={i}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          src.includes('Google Maps')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onSelectSession(sess)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-xs"
                      title="Filter Leads by this Session"
                    >
                      <Database size={12} /> Inspect Leads
                    </button>
                    {sess.leads && sess.leads.length > 0 && (
                      <button
                        onClick={() => exportSessionCsv(sess)}
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                        title="Export Session CSV"
                      >
                        <Download size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteSession(sess.id)}
                      className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                      title="Delete Session Log"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
