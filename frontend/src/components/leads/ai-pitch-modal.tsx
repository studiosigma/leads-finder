import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, X, MessageCircle, Mail, RefreshCw } from 'lucide-react';

interface AiPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
}

export const AiPitchModal = ({ isOpen, onClose, lead }: AiPitchModalProps) => {
  const [loading, setLoading] = useState(false);
  const [offerText, setOfferText] = useState('');
  const [pitchData, setPitchData] = useState<any | null>(null);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);

  useEffect(() => {
    if (isOpen && lead) {
      handleGeneratePitch();
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  const handleGeneratePitch = async () => {
    setLoading(true);
    setPitchData(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: lead.name,
          category: lead.category,
          location: lead.location,
          website: lead.website,
          my_offer: offerText.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.pitch) {
        setPitchData(data.pitch);
      }
    } catch (err) {
      console.error('Error generating AI pitch:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'subject' | 'body' | 'wa') => {
    navigator.clipboard.writeText(text);
    if (type === 'subject') {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } else if (type === 'body') {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    } else if (type === 'wa') {
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 2000);
    }
  };

  const openWhatsAppWithScript = () => {
    if (!pitchData) return;
    const phone = lead.phone ? lead.phone.replace(/[^\d]/g, '') : '';
    const textEncoded = encodeURIComponent(pitchData.whatsapp_script);
    const targetUrl = lead.whatsapp_url ? `${lead.whatsapp_url}?text=${textEncoded}` : (phone ? `https://wa.me/${phone}?text=${textEncoded}` : `https://wa.me/?text=${textEncoded}`);
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">AI Cold Outreach Pitch</h3>
              <p className="text-xs text-zinc-500">Personalized for {lead.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Optional Custom Offer Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Custom product/service offer (e.g. 'Software POS Restoran')..."
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleGeneratePitch}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
          >
            {loading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />} Re-Generate
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-500 text-xs font-medium space-y-2">
            <RefreshCw size={24} className="animate-spin mx-auto text-blue-600" />
            <p>AI is generating personalized sales pitch for {lead.name}...</p>
          </div>
        ) : pitchData ? (
          <div className="space-y-4">
            {/* Cold Email Pitch */}
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <Mail size={14} className="text-blue-600" /> Cold Email Draft
                </span>
                <button
                  onClick={() => copyToClipboard(`${pitchData.email_subject}\n\n${pitchData.email_body}`, 'body')}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-white px-2 py-1 rounded border border-zinc-200"
                >
                  {copiedBody ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  {copiedBody ? 'Copied Email' : 'Copy Email'}
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-zinc-500 font-medium">Subject: </span>
                  <span className="font-semibold text-zinc-900">{pitchData.email_subject}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-zinc-200 text-zinc-700 whitespace-pre-line leading-relaxed font-sans">
                  {pitchData.email_body}
                </div>
              </div>
            </div>

            {/* WhatsApp Pitch */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <MessageCircle size={14} className="text-emerald-600 fill-emerald-600" /> WhatsApp Script
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyToClipboard(pitchData.whatsapp_script, 'wa')}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-white px-2 py-1 rounded border border-emerald-200"
                  >
                    {copiedWa ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    {copiedWa ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={openWhatsAppWithScript}
                    className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <MessageCircle size={12} className="fill-white" /> Open WhatsApp
                  </button>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs text-zinc-800 whitespace-pre-line leading-relaxed font-sans">
                {pitchData.whatsapp_script}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
