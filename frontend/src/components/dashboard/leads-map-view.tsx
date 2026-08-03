'use client';

import React, { useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Globe, ExternalLink, MessageSquare } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  category?: string;
  location?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

interface LeadsMapViewProps {
  leads: Lead[];
  onPitchWA?: (lead: Lead) => void;
}

// Approximate lat/lng geocoder for Indonesian cities/regions
function getCityLatLng(locationStr: string = ''): [number, number] {
  const loc = locationStr.toLowerCase();
  if (loc.includes('bekasi')) return [-6.2383, 106.9756];
  if (loc.includes('cikarang')) return [-6.3044, 107.1565];
  if (loc.includes('tambun')) return [-6.2625, 107.0658];
  if (loc.includes('karawang')) return [-6.3072, 107.2944];
  if (loc.includes('bandung')) return [-6.9175, 107.6191];
  if (loc.includes('bali') || loc.includes('denpasar') || loc.includes('ubud')) return [-8.4095, 115.1889];
  if (loc.includes('surabaya')) return [-7.2575, 112.7521];
  if (loc.includes('tangerang')) return [-6.1783, 106.6319];
  if (loc.includes('depok')) return [-6.4025, 106.7942];
  if (loc.includes('bogor')) return [-6.5971, 106.7996];
  if (loc.includes('semarang')) return [-6.9667, 110.4167];
  if (loc.includes('yogyakarta') || loc.includes('jogja')) return [-7.7956, 110.3695];
  return [-6.2088, 106.8456]; // Jakarta default
}

export default function LeadsMapView({ leads, onPitchWA }: LeadsMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Load Leaflet CSS and JS dynamically
    const leafletCssId = 'leaflet-css-cdn';
    if (!document.getElementById(leafletCssId)) {
      const link = document.createElement('link');
      link.id = leafletCssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const leafletJsId = 'leaflet-js-cdn';
    let script = document.getElementById(leafletJsId) as HTMLScriptElement;

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      // Calculate center point
      const firstLoc = leads[0]?.location || 'Bekasi';
      const center = getCityLatLng(firstLoc);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current).setView(center, 12);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Custom Pin Icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: #0284c7; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      const bounds: any[] = [];

      leads.forEach((lead, idx) => {
        const baseCoords = getCityLatLng(lead.location || firstLoc);
        // Add subtle offset for overlapping pins
        const latOffset = (Math.sin(idx * 1.7) * 0.012) + (Math.cos(idx * 0.8) * 0.005);
        const lngOffset = (Math.cos(idx * 1.7) * 0.012) + (Math.sin(idx * 0.8) * 0.005);
        const coords: [number, number] = [baseCoords[0] + latOffset, baseCoords[1] + lngOffset];

        bounds.push(coords);

        const phoneFormatted = lead.phone && lead.phone !== 'N/A' && lead.phone !== '-' ? lead.phone : '';
        const waUrl = phoneFormatted ? `https://wa.me/${phoneFormatted.replace(/[^0-9]/g, '')}` : '#';

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 240px;">
            <div style="font-weight: 700; font-size: 13px; color: #1e293b; margin-bottom: 2px;">${lead.name}</div>
            <div style="font-size: 11px; color: #0284c7; font-weight: 600; margin-bottom: 6px;">${lead.category || 'Entitas Bisnis'}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px; line-height: 1.3;">📍 ${lead.address || lead.location || 'Indonesia'}</div>
            <div style="display: flex; gap: 6px; margin-top: 8px;">
              ${phoneFormatted ? `<a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background-color: #10b981; color: white; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 4px;">💬 Chat WA</a>` : ''}
              ${lead.website && lead.website !== 'N/A' ? `<a href="${lead.website}" target="_blank" rel="noopener noreferrer" style="background-color: #f1f5f9; color: #334155; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none; border: 1px solid #cbd5e1;">🌐 Web</a>` : ''}
            </div>
          </div>
        `;

        L.marker(coords, { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    };

    if ((window as any).L) {
      initMap();
    } else if (!script) {
      script = document.createElement('script');
      script.id = leafletJsId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      script.addEventListener('load', initMap);
    }
  }, [leads]);

  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/90 text-xs font-bold text-slate-700 shadow-xs z-[1000] flex items-center gap-1.5">
        <MapPin size={14} className="text-sky-600" />
        <span>Peta Visual Prospek ({leads.length} Pin)</span>
      </div>
    </div>
  );
}
