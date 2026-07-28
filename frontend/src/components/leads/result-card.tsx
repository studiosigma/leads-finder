'use client';

import React, { useState } from 'react';
import { Mail, Phone, Globe, MapPin, Send, MessageCircle, Linkedin, Instagram, Facebook, Sparkles } from 'lucide-react';
import { WebhookModal } from './webhook-modal';
import { AiPitchModal } from './ai-pitch-modal';

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
  status: 'READY' | 'FOLLOW UP' | string;
  sources?: string[];
}

export const ResultCard = ({ lead }: { lead: Lead }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiPitchOpen, setIsAiPitchOpen] = useState(false);

  const formatWebsiteUrl = (url: string) => {
    if (!url || url === 'N/A') return '#';
    if (url.startsWith && url.startsWith('http')) return url;
    return `https://${url}`;
  };

  return (
    <>
      <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200 group flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-base font-bold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {lead.name}
            </h3>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider shrink-0 ${
              lead.status === 'READY' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {lead.status}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 text-xs text-zinc-500">
            <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 font-medium">{lead.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> {lead.location}</span>
          </div>

          {/* Info Grid */}
          <div className="space-y-2 text-xs text-zinc-600">
            <a
              href={formatWebsiteUrl(lead.website)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 transition-colors ${
                lead.website && lead.website !== 'N/A' ? 'hover:text-blue-600' : 'text-zinc-400 pointer-events-none'
              }`}
            >
              <Globe size={14} className="text-zinc-400 shrink-0" />
              <span className="truncate">{lead.website || 'N/A'}</span>
            </a>

            <a
              href={lead.email && lead.email !== 'N/A' ? `mailto:${lead.email}` : '#'}
              className={`flex items-center gap-2 transition-colors ${
                lead.email && lead.email !== 'N/A' ? 'hover:text-blue-600' : 'text-zinc-400 pointer-events-none'
              }`}
            >
              <Mail size={14} className="text-zinc-400 shrink-0" />
              <span className="truncate">{lead.email || 'N/A'}</span>
            </a>

            <a
              href={lead.phone && lead.phone !== 'N/A' ? `tel:${lead.phone}` : '#'}
              className={`flex items-center gap-2 transition-colors ${
                lead.phone && lead.phone !== 'N/A' ? 'hover:text-blue-600' : 'text-zinc-400 pointer-events-none'
              }`}
            >
              <Phone size={14} className="text-zinc-400 shrink-0" />
              <span className="truncate">{lead.phone || 'N/A'}</span>
            </a>
          </div>

          {/* Social Profiles & WhatsApp Direct Chat */}
          {(lead.whatsapp_url || lead.linkedin_url || lead.instagram_url || lead.facebook_url) && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100">
              {lead.whatsapp_url && (
                <a
                  href={lead.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-bold transition-colors"
                >
                  <MessageCircle size={12} className="fill-emerald-600 text-emerald-600" /> WhatsApp
                </a>
              )}
              {lead.linkedin_url && (
                <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-600 p-1" title="LinkedIn Profile">
                  <Linkedin size={14} />
                </a>
              )}
              {lead.instagram_url && (
                <a href={lead.instagram_url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-pink-600 p-1" title="Instagram Profile">
                  <Instagram size={14} />
                </a>
              )}
              {lead.facebook_url && (
                <a href={lead.facebook_url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-700 p-1" title="Facebook Page">
                  <Facebook size={14} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-100">
          <button
            onClick={() => setIsAiPitchOpen(true)}
            className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles size={12} /> AI Pitch
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 text-xs bg-zinc-50 hover:bg-zinc-100 text-zinc-700 py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 border border-zinc-200"
          >
            <Send size={12} /> Webhook
          </button>
        </div>
      </div>

      <WebhookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lead={lead}
      />

      <AiPitchModal
        isOpen={isAiPitchOpen}
        onClose={() => setIsAiPitchOpen(false)}
        lead={lead}
      />
    </>
  );
};



