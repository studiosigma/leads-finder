'use client';

import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageCircle, Sparkles, Building2, UserCheck, MapPin } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  category: string;
  location: string;
  website?: string;
  email?: string;
  phone: string;
  decision_maker_name?: string;
  decision_maker_title?: string;
  whatsapp_url?: string;
}

interface WhatsappPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

const PITCH_TEMPLATES = [
  {
    id: 'b2b-supply',
    label: '🎯 Penawaran Kerjasama B2B / Supplier',
    template: `Halo {contact},\n\nSalam kenal, saya dari tim B2B Solution.\nSaya melihat {company} di {location} yang bergerak di bidang {category}.\n\nKami bermaksud menawarkan solusi pasokan/kerjasama B2B yang dapat menghemat efisiensi operasional {company}.\n\nApakah kami bisa meminta waktu 5 menit untuk berdiskusi singkat?\nTerima kasih banyak.`
  },
  {
    id: 'product-offer',
    label: '🛍️ Penawaran Produk & Jasa Khusus',
    template: `Selamat Pagi/Siang {contact},\n\nSemoga {company} semakin sukses di {location}.\n\nKami ingin mengenalkan produk & layanan unggulan kami yang dirancang khusus untuk sektor {category}.\n\nApakah ada waktu yang pas minggu ini untuk kami presentasikan katalog singkatnya?\n\nSalam hangat.`
  },
  {
    id: 'partnership-invite',
    label: '🤝 Undangan Meeting Kemitraan Strategis',
    template: `Halo Tim {company},\n\nSalam hangat dari tim kami.\nKami mengikuti perkembangan {company} sebagai salah satu pelaku utama di industri {category} daerah {location}.\n\nKami bermaksud mengajukan kolaborasi kemitraan strategis yang saling menguntungkan.\n\nBolehkah kami kirimkan proposal singkatnya via WhatsApp ini?\nTerima kasih.`
  }
];

export const WhatsappPitchModal = ({ isOpen, onClose, lead }: WhatsappPitchModalProps) => {
  if (!isOpen || !lead) return null;

  const [selectedTemplateId, setSelectedTemplateId] = useState('b2b-supply');
  const [copied, setCopied] = useState(false);

  const contactName = lead.decision_maker_name || `Bpk/Ibu Pimpinan ${lead.name}`;
  const rawTemplate = PITCH_TEMPLATES.find(t => t.id === selectedTemplateId)?.template || PITCH_TEMPLATES[0].template;

  const formattedMessage = rawTemplate
    .replace(/\{company\}/g, lead.name)
    .replace(/\{location\}/g, lead.location || 'Indonesia')
    .replace(/\{category\}/g, lead.category || 'Bisnis')
    .replace(/\{contact\}/g, contactName);

  const [customMessage, setCustomMessage] = useState(formattedMessage);

  // Sync custom message when template changes
  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = PITCH_TEMPLATES.find(t => t.id === id)?.template || '';
    setCustomMessage(
      tmpl
        .replace(/\{company\}/g, lead.name)
        .replace(/\{location\}/g, lead.location || 'Indonesia')
        .replace(/\{category\}/g, lead.category || 'Bisnis')
        .replace(/\{contact\}/g, contactName)
    );
  };

  const cleanPhone = String(lead.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
  const waDirectUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(customMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                AI WhatsApp Outreach Studio
              </h3>
              <p className="text-xs text-slate-500 font-medium">Kirim penawaran B2B dipersonalisasi langsung ke WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lead Summary Info */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 truncate max-w-[240px]">
              <Building2 size={13} className="text-slate-500 shrink-0" /> {lead.name}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
              📱 +{formattedPhone}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1"><MapPin size={11} /> {lead.location}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><UserCheck size={11} /> {contactName}</span>
          </div>
        </div>

        {/* Template Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500" /> Pilih Template Pesan Sales:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {PITCH_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleTemplateSelect(tmpl.id)}
                className={`text-left text-xs p-2.5 rounded-xl border transition-all font-semibold flex items-center justify-between ${
                  selectedTemplateId === tmpl.id
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <span>{tmpl.label}</span>
                {selectedTemplateId === tmpl.id && <Check size={14} className="text-emerald-600 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Editable Message Preview */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-extrabold text-slate-800">Preview Pesan (Dapat Diedit):</label>
            <button
              onClick={handleCopy}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copied ? 'Tersalin!' : 'Salin Pesan'}
            </button>
          </div>
          <textarea
            rows={6}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed shadow-inner"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <a
            href={waDirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-2/3 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Send size={15} /> Kirim via WhatsApp Web
          </a>
        </div>
      </div>
    </div>
  );
};
