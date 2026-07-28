import React from 'react';
import { Mail, Phone, Globe, MapPin, Send, CheckCircle2, AlertTriangle, MessageCircle, Linkedin, Instagram, Facebook, Sparkles } from 'lucide-react';

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
  const isAllSelected = leads.length > 0 && selectedIds.length === leads.length;

  const calculateConfidence = (lead: Lead) => {
    let score = 30; // base score for business existence
    if (lead.website && lead.website !== 'N/A') score += 20;
    if (lead.email && lead.email !== 'N/A') score += 25;
    if (lead.phone && lead.phone !== 'N/A') score += 15;
    if (lead.whatsapp_url) score += 10;
    return Math.min(score, 100);
  };

  const formatWebsiteUrl = (url: string) => {
    if (!url || url === 'N/A') return '#';
    if (url.startsWith && url.startsWith('http')) return url;
    return `https://${url}`;
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider">
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </th>
              <th className="p-3.5 min-w-[200px]">Company / Business Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Location</th>
              <th className="p-3.5">Website</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Phone & WhatsApp</th>
              <th className="p-3.5">Completeness</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {leads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);
              const score = calculateConfidence(lead);

              return (
                <tr
                  key={lead.id}
                  className={`hover:bg-blue-50/40 transition-colors ${
                    isSelected ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <td className="p-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(lead.id)}
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </td>
                  <td className="p-3.5 font-bold text-zinc-900">
                    <div className="flex flex-col">
                      <span>{lead.name}</span>
                      {lead.sources && lead.sources.length > 0 && (
                        <span className="text-[10px] text-zinc-400 font-normal">
                          {lead.sources.join(', ')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-zinc-600">
                    <span className="bg-zinc-100 px-2 py-0.5 rounded text-[11px] font-medium text-zinc-700">
                      {lead.category || 'Business'}
                    </span>
                  </td>
                  <td className="p-3.5 text-zinc-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-zinc-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{lead.location}</span>
                    </span>
                  </td>
                  <td className="p-3.5">
                    {lead.website && lead.website !== 'N/A' ? (
                      <a
                        href={formatWebsiteUrl(lead.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 max-w-[140px] truncate"
                      >
                        <Globe size={12} className="shrink-0" />
                        <span className="truncate">{lead.website}</span>
                      </a>
                    ) : (
                      <span className="text-zinc-400">N/A</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {lead.email && lead.email !== 'N/A' ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-blue-600 hover:underline flex items-center gap-1 max-w-[150px] truncate font-medium"
                      >
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </a>
                    ) : (
                      <span className="text-zinc-400">N/A</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-col gap-1">
                      {lead.phone && lead.phone !== 'N/A' ? (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-zinc-700 hover:text-blue-600 flex items-center gap-1 font-mono text-[11px]"
                        >
                          <Phone size={12} className="text-zinc-400 shrink-0" />
                          <span>{lead.phone}</span>
                        </a>
                      ) : (
                        <span className="text-zinc-400">N/A</span>
                      )}
                      {lead.whatsapp_url && (
                        <a
                          href={lead.whatsapp_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:underline font-semibold"
                        >
                          <MessageCircle size={10} className="text-emerald-600 fill-emerald-600" /> Chat WhatsApp
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            score === 100 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500">{score}%</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        lead.status === 'READY'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {lead.status === 'READY' ? (
                        <CheckCircle2 size={10} />
                      ) : (
                        <AlertTriangle size={10} />
                      )}
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onOpenAiPitchModal && (
                        <button
                          onClick={() => onOpenAiPitchModal(lead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md text-[11px] font-semibold text-blue-700 transition-colors"
                        >
                          <Sparkles size={10} /> AI Pitch
                        </button>
                      )}
                      <button
                        onClick={() => onOpenWebhookModal(lead)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md text-[11px] font-semibold text-zinc-700 transition-colors"
                      >
                        <Send size={10} /> Push
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


