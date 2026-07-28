'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, MessageCircle, Check, Loader2 } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  category: string;
  location: string;
  website?: string;
  email?: string;
  phone?: string;
  whatsapp_url?: string;
}

interface AiPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export const AiPitchModal = ({ isOpen, onClose, lead }: AiPitchModalProps) => {
  const [loading, setLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [myOffer, setMyOffer] = useState('');
  
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [waScript, setWaScript] = useState('');

  useEffect(() => {
    if (isOpen && lead) {
      generatePitch();
    }
  }, [isOpen, lead]);

  const generatePitch = async () => {
    if (!lead) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: lead.name,
          category: lead.category || 'Technology',
          location: lead.location || 'San Francisco, CA',
          website: lead.website,
          my_offer: myOffer || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pitch) {
          setSubject(data.pitch.subject || `Regarding ${lead.name} & [Your Product] : Synergy?`);
          setEmailBody(
            data.pitch.email_body ||
            `Hello Sarah,\n\nI noticed ${lead.name}'s focus on [Category]. We've helped similar San Francisco firms like [Example] achieve [Benefit].\n\n[Body text...]\n\nBest,\n[User Name]`
          );
          setWaScript(
            data.pitch.whatsapp_script ||
            `Hi Sarah! I saw ${lead.name}'s recent [Activity]. We should discuss...`
          );
        }
      } else {
        // Fallback mockup text exact to design
        setSubject(`Regarding ${lead.name} & [Your Product] : Synergy?`);
        setEmailBody(
          `Hello Sarah,\n\nI noticed ${lead.name}'s focus on [Category]. We've helped similar San Francisco firms like [Example] achieve [Benefit].\n\n[Body text...]\n\nBest,\n[User Name]`
        );
        setWaScript(
          `Hi Sarah! I saw ${lead.name}'s recent [Activity]. We should discuss...`
        );
      }
    } catch (err) {
      console.error('Error generating pitch:', err);
      setSubject(`Regarding ${lead.name} & [Your Product] : Synergy?`);
      setEmailBody(
        `Hello Sarah,\n\nI noticed ${lead.name}'s focus on [Category]. We've helped similar San Francisco firms like [Example] achieve [Benefit].\n\n[Body text...]\n\nBest,\n[User Name]`
      );
      setWaScript(
        `Hi Sarah! I saw ${lead.name}'s recent [Activity]. We should discuss...`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !lead) return null;

  const handleCopyEmail = () => {
    const fullEmailText = `Subject: ${subject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullEmailText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const phoneClean = (lead.phone || '15550192').replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(waScript);
    window.open(`https://wa.me/${phoneClean}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white/95 border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-sans">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white">
              <Sparkles size={14} />
            </div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              AI Cold Outreach Pitch Generator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <Loader2 size={24} className="animate-spin text-slate-700" />
              <p className="text-xs font-semibold">Crafting personalized pitch for {lead.name}...</p>
            </div>
          ) : (
            <>
              {/* Cold Email Subject Line */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Cold Email Subject Line</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 leading-relaxed">
                  {subject}
                </div>
              </div>

              {/* Email Body */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Body</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={7}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* WhatsApp Message Script */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">WhatsApp Message Script</label>
                <input
                  type="text"
                  value={waScript}
                  onChange={(e) => setWaScript(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white transition-all"
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <button
            onClick={handleCopyEmail}
            className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            {copiedEmail ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copiedEmail ? 'Copied!' : 'Copy Email'}
          </button>
          
          <button
            onClick={handleOpenWhatsApp}
            className="flex-1 py-2.5 px-4 bg-[#4a6382] hover:bg-[#3b5175] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <MessageCircle size={14} className="fill-white" />
            Open in WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
};
