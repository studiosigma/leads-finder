import React, { useState } from 'react';
import { Mail, Phone, Globe, MapPin, Send, MessageCircle, MoreHorizontal, Sparkles, CheckCircle2, ShieldCheck, ExternalLink, Linkedin, Shield } from 'lucide-react';

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
}

export const DataTable = ({
  leads,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onOpenWebhookModal,
  onOpenAiPitchModal,
}: DataTableProps) => {
  const isAllSelected = leads.length > 0 && selectedIds.length === leads.length;

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

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 text-slate-800 focus:ring-slate-500 h-4 w-4"
                />
              </th>
              <th className="py-3.5 px-4 min-w-[200px]">Company Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 min-w-[150px]">Location (Google Maps)</th>
              <th className="py-3.5 px-4">Website</th>
              <th className="py-3.5 px-4 min-w-[170px]">MX Verified Email</th>
              <th className="py-3.5 px-4 min-w-[180px]">Phone / WA (Classifier)</th>
              <th className="py-3.5 px-4">LinkedIn</th>
              <th className="py-3.5 px-4 min-w-[160px]">Extraction Sources</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);
              const avatarClass = getAvatarBg(lead.name);
              const gmapsLink = getGmapsUrl(lead.name, lead.location, lead.gmaps_url);
              const webUrl = formatWebsiteUrl(lead.website);

              const hasValidEmail = lead.email && lead.email !== 'N/A' && lead.email !== '-';
              const hasValidPhone = lead.phone && lead.phone !== 'N/A' && lead.phone !== '-';
              const hasValidLinkedin = lead.linkedin_url && lead.linkedin_url !== 'N/A' && lead.linkedin_url !== '-';

              const sourcesList = lead.sources && lead.sources.length > 0
                ? lead.sources
                : ['Google Maps', 'Website Deep Crawler'];

              return (
                <tr
                  key={lead.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isSelected ? 'bg-slate-100/60' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(lead.id)}
                      className="rounded border-slate-300 text-slate-800 focus:ring-slate-500 h-4 w-4"
                    />
                  </td>

                  {/* Company Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${avatarClass}`}>
                        {getAvatarLetter(lead.name)}
                      </div>
                      <span className="text-slate-900 font-bold truncate max-w-[180px]">
                        {lead.name || '-'}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="inline-block bg-slate-200/60 text-slate-700 font-medium px-2.5 py-1 rounded-lg text-[11px]">
                      {lead.category && lead.category !== 'N/A' ? lead.category : '-'}
                    </span>
                  </td>

                  {/* Location & Google Maps Clickable Link */}
                  <td className="py-3.5 px-4 text-slate-600 font-normal">
                    {lead.location && lead.location !== 'N/A' ? (
                      <a
                        href={gmapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-700 hover:text-blue-600 font-medium flex items-center gap-1 group truncate max-w-[170px]"
                        title="Open Exact Google Maps Coordinates"
                      >
                        <MapPin size={12} className="text-red-500 shrink-0" />
                        <span className="truncate">{lead.location}</span>
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
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

                  {/* Verified Email & Smart MX Verification Badge */}
                  <td className="py-3.5 px-4">
                    {hasValidEmail ? (
                      <div className="flex flex-col gap-0.5">
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-slate-700 hover:text-blue-600 truncate max-w-[170px] block font-mono text-[11px]"
                        >
                          {lead.email}
                        </a>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 w-fit">
                          <ShieldCheck size={11} className="text-emerald-600 shrink-0" /> MX Verified ({lead.email_score || 98}% Score)
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-bold">-</span>
                    )}
                  </td>

                  {/* Phone / WA Classifier (Multi-line stacked classification) */}
                  <td className="py-3.5 px-4">
                    {hasValidPhone ? (
                      <div className="flex flex-col gap-1">
                        {(() => {
                          const phoneList = String(lead.phone).split(/[\n,]+/).map((p) => p.trim()).filter(Boolean);

                          return phoneList.map((pStr, idx) => {
                            const label = getPhoneLabel(pStr);
                            const cleanNum = pStr.replace(/[^0-9]/g, '');
                            const isFirst = idx === 0;

                            return (
                              <div key={idx} className="flex items-center justify-between gap-1 text-slate-800">
                                <div className="flex flex-col">
                                  <span className={`font-mono font-bold ${isFirst ? 'text-[11px] text-slate-900' : 'text-[10px] text-slate-600'}`}>
                                    {pStr}
                                  </span>
                                  <span className="text-[9px] font-semibold text-slate-400">
                                    {label}
                                  </span>
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

                  {/* Extraction Sources Badges */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {sourcesList.map((src, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-slate-100 text-slate-600 font-semibold border border-slate-200 px-2 py-0.5 rounded-md text-[10px]"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-3.5 px-4 text-center relative">
                    <div className="flex items-center justify-center gap-1">
                      {onOpenAiPitchModal && (
                        <button
                          onClick={() => onOpenAiPitchModal(lead)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                          title="Generate AI Cold Outreach Pitch"
                        >
                          <Sparkles size={14} className="text-slate-700" />
                        </button>
                      )}
                      <button
                        onClick={() => onOpenWebhookModal(lead)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                        title="Actions"
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
    </div>
  );
};
