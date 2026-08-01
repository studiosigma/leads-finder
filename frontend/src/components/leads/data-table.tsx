import React, { useState, useMemo } from 'react';
import { Mail, Phone, Globe, MapPin, Send, MessageCircle, MoreHorizontal, Sparkles, CheckCircle2, ShieldCheck, ShieldAlert, ExternalLink, Linkedin, Shield, Trophy, ChevronLeft, ChevronRight, Zap, Copy, Check, Table } from 'lucide-react';
import { WhatsappPitchModal } from './whatsapp-pitch-modal';
import { GoogleSheetsModal } from './google-sheets-modal';

interface Lead {
  id: string;
  name: string;
  category: string;
  location: string;
  website: string;
  email: string;
  email_status?: string;
  email_score?: number;
  phone: string;
  whatsapp_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  gmaps_url?: string;
  decision_maker_name?: string;
  decision_maker_title?: string;
  decision_maker_linkedin?: string;
  status: string;
  sources?: string[];
}

interface DataTableProps {
  leads: Lead[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpenWebhookModal: (lead: Lead) => void;
  onOpenAiPitchModal?: (lead: Lead) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export const DataTable = ({
  leads,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onOpenWebhookModal,
  onOpenAiPitchModal,
  onStatusChange,
}: DataTableProps) => {
  // Big Data Virtualization / Windowing Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Optimistic UI State Store for 0ms status latency
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({});

  // WhatsApp Outreach Studio Modal State
  const [waModalLead, setWaModalLead] = useState<Lead | null>(null);

  // Google Sheets Integration State
  const [isGsheetsModalOpen, setIsGsheetsModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const handleSyncToGoogleSheets = async (targetLeads: Lead[]) => {
    const webhookUrl = localStorage.getItem('leads_finder_gsheet_webhook');
    if (!webhookUrl) {
      setIsGsheetsModalOpen(true);
      return;
    }

    setSyncStatus('syncing');
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetLeads)
      });
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (e) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  // Micro-interaction: Click-to-copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const totalLeads = leads.length;
  const totalPages = Math.ceil(totalLeads / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);

  // Compute active virtual window slice (Virtualization)
  const paginatedLeads = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return leads.slice(startIndex, startIndex + pageSize);
  }, [leads, safePage, pageSize]);

  const isAllSelected = paginatedLeads.length > 0 && paginatedLeads.every((l) => selectedIds.includes(l.id));

  const handleCopyText = (text: string, keyIdentifier: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyIdentifier);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.error('Error copying text:', e);
    }
  };

  const handleStatusUpdateOptimistic = (id: string, newStatus: string) => {
    // 1. Optimistic Update (0ms immediate UI reflection)
    setOptimisticStatuses((prev) => ({ ...prev, [id]: newStatus }));

    // 2. Dispatch background persistence sync
    if (onStatusChange) {
      onStatusChange(id, newStatus);
    }
  };

  const formatWebsiteUrl = (url?: string) => {
    if (!url || url === 'N/A' || url === '-') return null;
    if (url.startsWith('http')) return url;
    return `https://${url}`;
  };

  const getGmapsUrl = (name: string, location: string, gmapsUrl?: string) => {
    if (gmapsUrl && gmapsUrl.startsWith('http')) return gmapsUrl;
    const query = encodeURIComponent(`${name} ${location}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getAvatarLetter = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'B';
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      'bg-slate-900 text-white',
      'bg-blue-600 text-white',
      'bg-amber-600 text-white',
      'bg-teal-700 text-white',
      'bg-indigo-700 text-white',
      'bg-emerald-700 text-white'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  const getPhoneLabel = (phoneStr: string) => {
    const lower = phoneStr.toLowerCase();
    if (lower.includes('igd') || lower.includes('emergency')) return '🚨 Emergency / IGD';
    if (lower.includes('wa') || lower.includes('sales') || phoneStr.startsWith('+62 8') || phoneStr.startsWith('08')) return '💬 WA Direct';
    if (phoneStr.includes('+62 21') || phoneStr.includes('(021)')) return '📞 Landline Office';
    return '📞 Contact';
  };

  const getStatusBadgeStyle = (statusStr: string) => {
    const st = (statusStr || 'READY').toUpperCase();
    if (st === 'WON' || st === 'DEAL') return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    if (st === 'QUALIFIED') return 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
    if (st === 'CONTACTED' || st === 'FOLLOW UP') return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    if (st === 'LOST' || st === 'REJECTED') return 'bg-red-100 text-red-800 border-red-300 font-bold';
    return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
  };

  const selectedLeads = leads.filter((l) => selectedIds.includes(l.id));

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs font-sans space-y-0 relative">
      {/* Top Google Sheets Sync Action Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 ? (
            <button
              onClick={() => handleSyncToGoogleSheets(selectedLeads)}
              disabled={syncStatus === 'syncing'}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Table size={14} /> Sync {selectedIds.length} Selected to Google Sheets
            </button>
          ) : (
            <button
              onClick={() => handleSyncToGoogleSheets(leads)}
              disabled={syncStatus === 'syncing' || leads.length === 0}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Table size={14} className="text-emerald-600" /> Sync All ({leads.length}) to Google Sheets
            </button>
          )}

          {syncStatus === 'syncing' && (
            <span className="text-emerald-700 font-bold text-xs animate-pulse flex items-center gap-1">
              ⏳ Syncing data ke Google Sheets...
            </span>
          )}
          {syncStatus === 'success' && (
            <span className="text-emerald-700 font-extrabold text-xs flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded">
              ✅ Berhasil Ter-sync ke Google Sheets!
            </span>
          )}
          {syncStatus === 'error' && (
            <span className="text-rose-700 font-extrabold text-xs flex items-center gap-1 bg-rose-100 px-2 py-0.5 rounded">
              ❌ Gagal Sync (Periksa URL Webhook)
            </span>
          )}
        </div>

        <button
          onClick={() => setIsGsheetsModalOpen(true)}
          className="text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center gap-1.5 hover:underline cursor-pointer"
        >
          ⚙️ Setting Webhook Google Sheets
        </button>
      </div>

      <div className="overflow-x-auto max-h-[70vh]">
        <table className="w-full text-left text-xs border-collapse">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200/90 shadow-xs">
            <tr className="text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-10 text-center sticky left-0 z-30 bg-slate-50 border-r border-slate-200/60">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 text-slate-800 focus:ring-slate-500 h-4 w-4 cursor-pointer"
                />
              </th>
              {/* Sticky First Column: Company Name */}
              <th className="py-3.5 px-4 min-w-[210px] sticky left-10 z-30 bg-slate-50 border-r border-slate-200/60">
                Company Name
              </th>
              <th className="py-3.5 px-4 min-w-[170px]">Executive Contact</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 min-w-[140px]">Location</th>
              <th className="py-3.5 px-4">Website</th>
              <th className="py-3.5 px-4 min-w-[170px]">MX Verified Email</th>
              <th className="py-3.5 px-4 min-w-[190px]">Phone / WA Classifier</th>
              <th className="py-3.5 px-4">LinkedIn</th>
              <th className="py-3.5 px-4 min-w-[140px]">CRM Pipeline Stage</th>
              <th className="py-3.5 px-4 text-center min-w-[100px]">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedLeads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);
              const avatarClass = getAvatarBg(lead.name);
              const gmapsLink = getGmapsUrl(lead.name, lead.location, lead.gmaps_url);
              const webUrl = formatWebsiteUrl(lead.website);

              const activeStatus = optimisticStatuses[lead.id] || lead.status || 'READY';

              const hasValidEmail = lead.email && lead.email !== 'N/A' && lead.email !== '-';
              const hasValidPhone = lead.phone && lead.phone !== 'N/A' && lead.phone !== '-';
              const hasValidLinkedin = lead.linkedin_url && lead.linkedin_url !== 'N/A' && lead.linkedin_url !== '-';

              const emailCopyKey = `email-${lead.id}`;
              const isEmailCopied = copiedKey === emailCopyKey;

              return (
                <tr
                  key={lead.id}
                  className={`group hover:bg-slate-50/90 transition-colors ${
                    isSelected ? 'bg-slate-100/60' : ''
                  }`}
                >
                  {/* Sticky Checkbox Column */}
                  <td className="py-3.5 px-4 text-center sticky left-0 z-10 bg-white group-hover:bg-slate-50/90 border-r border-slate-100">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(lead.id)}
                      className="rounded border-slate-300 text-slate-800 focus:ring-slate-500 h-4 w-4 cursor-pointer"
                    />
                  </td>

                  {/* Sticky First Column: Company Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900 sticky left-10 z-10 bg-white group-hover:bg-slate-50/90 border-r border-slate-100 shadow-xs">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs ${avatarClass}`}>
                          {getAvatarLetter(lead.name)}
                        </div>
                        <span className="text-slate-900 font-extrabold text-xs truncate max-w-[170px]" title={lead.name}>
                          {lead.name || '-'}
                        </span>
                      </div>
                      {(lead as any).is_siinas_verified && (
                        <span className="ml-9 inline-flex items-center gap-1 text-[9px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/80 w-fit shadow-2xs">
                          🏛️ SIINas Kemenperin
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Executive Contact (Decision Maker) */}
                  <td className="py-3.5 px-4 text-slate-700">
                    {lead.decision_maker_name ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                          👤 {lead.decision_maker_name}
                        </span>
                        <span className="text-[10px] font-semibold text-[#4a6382] bg-slate-100 px-1.5 py-0.5 rounded w-fit border border-slate-200">
                          {lead.decision_maker_title || 'Owner / CEO'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">-</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="inline-block bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg text-[11px] border border-slate-200/60">
                      {lead.category && lead.category !== 'N/A' ? lead.category : '-'}
                    </span>
                  </td>

                  {/* Location & Google Maps Clickable Link */}
                  <td className="py-3.5 px-4 text-slate-500 font-normal">
                    {lead.location && lead.location !== 'N/A' ? (
                      <a
                        href={gmapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-blue-600 font-medium flex items-center gap-1 group/link truncate max-w-[150px]"
                        title="Open Exact Google Maps Coordinates"
                      >
                        <MapPin size={12} className="text-red-500 shrink-0" />
                        <span className="truncate text-slate-500">{lead.location}</span>
                        <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-400 font-bold">-</span>
                    )}
                  </td>

                  {/* Website Link */}
                  <td className="py-3.5 px-4">
                    {webUrl ? (
                      <a
                        href={webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-700 hover:text-blue-600 font-medium underline underline-offset-2 flex items-center gap-1"
                      >
                        <Globe size={12} className="text-slate-400" /> Link
                      </a>
                    ) : (
                      <span className="text-slate-400 font-bold">-</span>
                    )}
                  </td>

                  {/* Verified Email & Click-to-Copy Feature */}
                  <td className="py-3.5 px-4">
                    {hasValidEmail ? (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-slate-800 hover:text-blue-600 font-bold truncate max-w-[140px] block font-mono text-[11px] hover:underline"
                            title={`Send Email to ${lead.email}`}
                          >
                            {lead.email}
                          </a>
                          
                          <button
                            onClick={() => handleCopyText(lead.email, emailCopyKey)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                            title="Copy Email to Clipboard"
                          >
                            {isEmailCopied ? (
                              <span className="inline-flex items-center text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1 rounded animate-in fade-in">
                                <Check size={10} className="mr-0.5" /> Copied!
                              </span>
                            ) : (
                              <Copy size={11} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </div>

                        {lead.email_status === 'DELIVERABLE' || lead.email_status === 'VALID' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 w-fit">
                            <ShieldCheck size={11} className="text-emerald-600 shrink-0" /> 🟩 DELIVERABLE (Zero Bounce)
                          </span>
                        ) : lead.email_status === 'CATCH_ALL' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 w-fit">
                            <ShieldAlert size={11} className="text-amber-600 shrink-0" /> 🟨 CATCH-ALL (Risky)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80 w-fit">
                            <ShieldCheck size={11} className="text-slate-500 shrink-0" /> MX Active
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-bold">-</span>
                    )}
                  </td>

                  {/* Phone / WA Classifier with Click-to-Copy */}
                  <td className="py-3.5 px-4">
                    {hasValidPhone ? (
                      <div className="flex flex-col gap-1">
                        {(() => {
                          const phoneList = String(lead.phone).split(/[\n,]+/).map((p) => p.trim()).filter(Boolean);

                          return phoneList.map((pStr, idx) => {
                            const label = getPhoneLabel(pStr);
                            const cleanNum = pStr.replace(/[^0-9]/g, '');
                            const isFirst = idx === 0;
                            const phoneCopyKey = `phone-${lead.id}-${idx}`;
                            const isPhoneCopied = copiedKey === phoneCopyKey;

                            return (
                              <div key={idx} className="flex items-center justify-between gap-1 text-slate-800">
                                <div className="flex items-center gap-1">
                                  <a
                                    href={`tel:${cleanNum}`}
                                    className={`font-mono font-bold hover:text-blue-600 ${isFirst ? 'text-[11px] text-slate-900' : 'text-[10px] text-slate-600'}`}
                                    title={`Call ${pStr}`}
                                  >
                                    {pStr}
                                  </a>
                                  
                                  <button
                                    onClick={() => handleCopyText(cleanNum, phoneCopyKey)}
                                    className="text-slate-400 hover:text-slate-700 p-0.5"
                                    title="Copy Phone Number"
                                  >
                                    {isPhoneCopied ? (
                                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1 rounded">
                                        Copied!
                                      </span>
                                    ) : (
                                      <Copy size={10} className="opacity-50 group-hover:opacity-100" />
                                    )}
                                  </button>
                                </div>

                                <a
                                  href={`https://wa.me/${cleanNum}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:scale-110 transition-transform p-0.5"
                                  title="Open Direct WhatsApp Chat"
                                >
                                  <MessageCircle size={isFirst ? 15 : 13} className="fill-emerald-500 text-emerald-600 shrink-0" />
                                </a>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-bold">-</span>
                    )}
                  </td>

                  {/* LinkedIn Link */}
                  <td className="py-3.5 px-4">
                    {hasValidLinkedin ? (
                      <a
                        href={lead.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <Linkedin size={13} className="fill-blue-600 text-blue-600" /> LinkedIn
                      </a>
                    ) : (
                      <span className="text-slate-400 font-bold text-center block">-</span>
                    )}
                  </td>

                  {/* CRM Pipeline Stage Inline Dropdown Editing */}
                  <td className="py-3.5 px-4">
                    <select
                      value={activeStatus}
                      onChange={(e) => handleStatusUpdateOptimistic(lead.id, e.target.value)}
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer transition-all shadow-xs ${getStatusBadgeStyle(
                        activeStatus
                      )}`}
                    >
                      <option value="READY">🔵 New Lead</option>
                      <option value="CONTACTED">🟡 Contacted</option>
                      <option value="QUALIFIED">🟣 Qualified</option>
                      <option value="WON">🟢 Won / Deal</option>
                      <option value="LOST">🔴 Lost / Rejected</option>
                    </select>
                  </td>

                  {/* Hover Quick Actions Bar */}
                  <td className="py-3.5 px-4 text-center relative">
                    <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {hasValidPhone && (
                        <button
                          onClick={() => setWaModalLead(lead)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[10px] rounded-lg border border-emerald-200 flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer"
                          title="Open AI WhatsApp Outreach Studio"
                        >
                          <MessageCircle size={11} className="fill-emerald-500 text-emerald-600 shrink-0" /> Pitch WA
                        </button>
                      )}
                      {onOpenAiPitchModal && (
                        <button
                          onClick={() => onOpenAiPitchModal(lead)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-lg transition-colors"
                          title="Generate AI Cold Outreach Pitch"
                        >
                          <Sparkles size={14} className="text-amber-600 fill-amber-500" />
                        </button>
                      )}
                      <button
                        onClick={() => onOpenWebhookModal(lead)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-lg transition-colors"
                        title="Actions & Webhook Trigger"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Big Data Virtualization Pagination Controls */}
      <div className="px-4 py-3 bg-slate-50/90 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <span>
            Showing <strong className="text-slate-800">{totalLeads > 0 ? (safePage - 1) * pageSize + 1 : 0}</strong> -{' '}
            <strong className="text-slate-800">{Math.min(safePage * pageSize, totalLeads)}</strong> of{' '}
            <strong className="text-slate-800">{totalLeads}</strong> leads
          </span>

          <div className="flex items-center gap-1 ml-4">
            <span className="text-[11px] text-slate-400 font-semibold">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none text-xs cursor-pointer"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={safePage <= 1}
            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="px-3 py-1 font-bold text-slate-800 bg-white border border-slate-200 rounded-lg text-xs">
            Page {safePage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={safePage >= totalPages}
            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* AI WhatsApp Pitch Studio Modal */}
      <WhatsappPitchModal
        isOpen={!!waModalLead}
        onClose={() => setWaModalLead(null)}
        lead={waModalLead}
      />

      {/* Google Sheets Sync Setting Modal */}
      <GoogleSheetsModal
        isOpen={isGsheetsModalOpen}
        onClose={() => setIsGsheetsModalOpen(false)}
      />
    </div>
  );
};
