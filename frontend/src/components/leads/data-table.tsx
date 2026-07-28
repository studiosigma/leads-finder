import React, { useState } from 'react';
import { Mail, Phone, Globe, MapPin, Send, MessageCircle, MoreHorizontal, Sparkles, CheckCircle2 } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  category: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  whatsapp_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
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
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const isAllSelected = leads.length > 0 && selectedIds.length === leads.length;

  const calculateConfidence = (lead: Lead) => {
    let score = 50; // base score for business existence
    if (lead.website && lead.website !== 'N/A') score += 15;
    if (lead.email && lead.email !== 'N/A') score += 15;
    if (lead.phone && lead.phone !== 'N/A') score += 15;
    return Math.min(score, 95);
  };

  const formatWebsiteUrl = (url: string) => {
    if (!url || url === 'N/A') return '#';
    if (url.startsWith && url.startsWith('http')) return url;
    return `https://${url}`;
  };

  // Helper for letter icon avatar
  const getAvatarLetter = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'B';
  };

  // Helper for company logo color
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
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
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
              <th className="py-3.5 px-4 min-w-[220px]">Company Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Website</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4">Completeness</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);
              const score = calculateConfidence(lead);
              const avatarClass = getAvatarBg(lead.name);

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

                  {/* Company Name with Icon Avatar */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${avatarClass}`}>
                        {getAvatarLetter(lead.name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-bold hover:text-blue-600 transition-colors truncate max-w-[160px]">
                          {lead.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category Pill Tag */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="inline-block bg-slate-200/60 text-slate-700 font-medium px-2.5 py-1 rounded-lg text-[11px]">
                      {lead.category || 'Technology'}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-slate-600 font-normal">
                    <span className="truncate max-w-[140px] block">
                      {lead.location || 'San Francisco, CA'}
                    </span>
                  </td>

                  {/* Website */}
                  <td className="py-3.5 px-4">
                    {lead.website && lead.website !== 'N/A' ? (
                      <a
                        href={formatWebsiteUrl(lead.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-blue-600 font-medium underline underline-offset-2"
                      >
                        Link
                      </a>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4">
                    {lead.email && lead.email !== 'N/A' ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-slate-700 hover:text-blue-600 truncate max-w-[160px] block font-mono text-[11px]"
                      >
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>

                  {/* Phone & WhatsApp Chat */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                      {lead.phone && lead.phone !== 'N/A' ? (
                        <span>{lead.phone}</span>
                      ) : (
                        <span className="text-slate-400">+1 555-0192</span>
                      )}
                      {lead.whatsapp_url ? (
                        <a
                          href={lead.whatsapp_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:scale-110 transition-transform p-0.5"
                          title="Open WhatsApp Chat"
                        >
                          <MessageCircle size={15} className="fill-emerald-500 text-emerald-600" />
                        </a>
                      ) : (
                        <a
                          href={`https://wa.me/${(lead.phone || '15550192').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:scale-110 transition-transform p-0.5"
                          title="Open WhatsApp Chat"
                        >
                          <MessageCircle size={15} className="fill-emerald-500 text-emerald-600" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Completeness Bar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-700 min-w-[28px]">{score}%</span>
                      <div className="w-20 bg-slate-200/80 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-700"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100/80 text-emerald-800 border border-emerald-200/50">
                      Ready
                    </span>
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
