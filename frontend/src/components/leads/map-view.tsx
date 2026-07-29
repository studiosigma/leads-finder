'use client';

import React, { useState } from 'react';
import { MapPin, Globe, Phone, Mail, ExternalLink, MessageCircle, Building2, Layers } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  category: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  whatsapp_url?: string;
  gmaps_url?: string;
  status: string;
}

interface MapViewProps {
  leads: Lead[];
}

export const MapView = ({ leads }: MapViewProps) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(leads[0] || null);

  const getEmbedMapUrl = (lead: Lead | null) => {
    if (!lead) return 'https://maps.google.com/maps?q=Indonesia&t=&z=5&ie=UTF8&iwloc=&output=embed';
    const query = encodeURIComponent(`${lead.name} ${lead.location}`);
    return `https://maps.google.com/maps?q=${query}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  };

  const getGmapsUrl = (name: string, location: string, gmapsUrl?: string) => {
    if (gmapsUrl && gmapsUrl.startsWith('http')) return gmapsUrl;
    const query = encodeURIComponent(`${name} ${location}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs font-sans grid grid-cols-1 lg:grid-cols-3 min-h-[560px]">
      
      {/* Real Live Google Maps View Panel */}
      <div className="lg:col-span-2 bg-slate-900 relative flex flex-col justify-between overflow-hidden min-h-[420px]">
        
        {/* Map Header Overlay */}
        <div className="flex items-center justify-between z-10 bg-slate-950/85 backdrop-blur-md p-3.5 border-b border-slate-800 text-white shrink-0">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-red-500" />
            <span className="text-xs font-extrabold tracking-tight">
              Live Google Maps Embed View ({leads.length} Locations)
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md">
            ● Google Maps Active
          </span>
        </div>

        {/* Live Google Maps iFrame View */}
        <div className="flex-1 w-full relative bg-slate-800">
          {selectedLead ? (
            <iframe
              title={`Map View for ${selectedLead.name}`}
              src={getEmbedMapUrl(selectedLead)}
              className="w-full h-full border-0 min-h-[380px]"
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 p-12 text-center">
              <MapPin size={32} className="text-slate-600" />
              <p className="text-xs font-bold">Select a lead below to render live Google Maps location</p>
            </div>
          )}
        </div>

        {/* Horizontal Pin Selector Bar */}
        <div className="z-10 bg-slate-950/90 backdrop-blur-md p-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1 pl-1">
            <Layers size={12} /> Select Pin:
          </span>
          {leads.map((lead, idx) => {
            const isSelected = selectedLead?.id === lead.id;
            return (
              <button
                key={lead.id || idx}
                onClick={() => setSelectedLead(lead)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/60 scale-105'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <MapPin size={12} className={isSelected ? 'text-white' : 'text-red-400'} />
                <span className="truncate max-w-[140px]">{lead.name}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Selected Business Location Inspector Panel */}
      <div className="p-6 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200/80 flex flex-col justify-between space-y-6">
        {selectedLead ? (
          <div className="space-y-5">
            <div>
              <span className="inline-block bg-slate-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider mb-2">
                {selectedLead.category || 'Business'}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {selectedLead.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-red-500 shrink-0" />
                <span>{selectedLead.location}</span>
              </p>
            </div>

            {/* Business Contact Cards */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200">
              
              {/* Phone / WA */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Phone & WhatsApp</span>
                {selectedLead.phone && selectedLead.phone !== 'N/A' && selectedLead.phone !== '-' ? (
                  <div className="space-y-1">
                    {String(selectedLead.phone).split(/[\n,]+/).map((p, i) => {
                      const cleanP = p.trim();
                      if (!cleanP) return null;
                      return (
                        <div key={i} className="flex items-center justify-between text-xs font-mono font-bold text-slate-800">
                          <span>{cleanP}</span>
                          <a
                            href={`https://wa.me/${cleanP.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-[11px]"
                          >
                            <MessageCircle size={14} className="fill-emerald-500" /> Chat
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-bold">-</span>
                )}
              </div>

              {/* Website */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Official Website</span>
                {selectedLead.website && selectedLead.website !== 'N/A' && selectedLead.website !== '-' ? (
                  <a
                    href={selectedLead.website.startsWith('http') ? selectedLead.website : `https://${selectedLead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 truncate"
                  >
                    <Globe size={12} /> {selectedLead.website}
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 font-bold">-</span>
                )}
              </div>

              {/* Verified Email */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Corporate Email</span>
                {selectedLead.email && selectedLead.email !== 'N/A' && selectedLead.email !== '-' ? (
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="text-xs font-bold font-mono text-slate-800 hover:text-blue-600 block truncate"
                  >
                    {selectedLead.email}
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 font-bold">-</span>
                )}
              </div>

            </div>

            {/* Direct Google Maps External Trigger */}
            <a
              href={getGmapsUrl(selectedLead.name, selectedLead.location, selectedLead.gmaps_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-[#4a6382] hover:bg-[#3b5175] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <ExternalLink size={14} /> Open Full View in Google Maps App
            </a>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-xs font-medium">
            Select a lead pin to inspect location details.
          </div>
        )}
      </div>

    </div>
  );
};
