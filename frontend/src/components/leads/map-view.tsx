'use client';

import React, { useState } from 'react';
import { MapPin, Globe, Phone, Mail, ExternalLink, MessageCircle, Building2, Star } from 'lucide-react';

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

  const getGmapsUrl = (name: string, location: string, gmapsUrl?: string) => {
    if (gmapsUrl && gmapsUrl.startsWith('http')) return gmapsUrl;
    const query = encodeURIComponent(`${name} ${location}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs font-sans grid grid-cols-1 lg:grid-cols-3 min-h-[520px]">
      
      {/* Map Interactive Visual Representation Panel */}
      <div className="lg:col-span-2 bg-slate-900 p-6 relative flex flex-col justify-between overflow-hidden min-h-[380px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        
        {/* Map Header Overlay */}
        <div className="flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 text-white">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-red-400" />
            <span className="text-xs font-bold">Interactive Lead Map Pins ({leads.length} Locations)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
            GPS Grid View
          </span>
        </div>

        {/* Pin Markers Grid */}
        <div className="my-auto py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-10">
          {leads.map((lead, idx) => {
            const isSelected = selectedLead?.id === lead.id;
            return (
              <button
                key={lead.id || idx}
                onClick={() => setSelectedLead(lead)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400/50 shadow-lg scale-105'
                    : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-slate-700/80 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`p-1 rounded-md ${isSelected ? 'bg-white/20' : 'bg-slate-700/60'}`}>
                    <MapPin size={14} className={isSelected ? 'text-white' : 'text-red-400'} />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-900 text-slate-400'}`}>
                    #{idx + 1}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold truncate">{lead.name}</h4>
                  <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    {lead.location}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Map Footer Overlay */}
        <div className="z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
          <span>Click any pin to inspect detailed business location</span>
          <span className="font-mono text-slate-500">Google Maps Geocoding Engine</span>
        </div>
      </div>

      {/* Selected Location Card Inspector Panel */}
      <div className="p-6 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200/80 flex flex-col justify-between space-y-6">
        {selectedLead ? (
          <div className="space-y-5">
            <div>
              <span className="inline-block bg-slate-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider mb-2">
                {selectedLead.category || 'Business'}
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
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

            {/* Direct Google Maps Action Trigger */}
            <a
              href={getGmapsUrl(selectedLead.name, selectedLead.location, selectedLead.gmaps_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-[#4a6382] hover:bg-[#3b5175] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <ExternalLink size={14} /> Open Location in Google Maps
            </a>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-xs font-medium">
            Select a pin location marker on the map to inspect business details.
          </div>
        )}
      </div>

    </div>
  );
};
