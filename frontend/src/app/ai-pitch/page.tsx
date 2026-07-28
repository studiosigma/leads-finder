'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, MessageCircle, Check, Loader2, Send } from 'lucide-react';

export default function AiPitchPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  
  const [myOffer, setMyOffer] = useState('');
  const [customBusiness, setCustomBusiness] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [waScript, setWaScript] = useState('');

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/leads');
        if (res.ok) {
          const data = await res.json();
          setLeads(data || []);
          if (data && data.length > 0) {
            setSelectedLead(data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
      }
    }
    fetchLeads();
  }, []);

  const handleGenerate = async () => {
    const businessName = selectedLead ? selectedLead.name : customBusiness;
    if (!businessName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          category: selectedLead ? selectedLead.category : (customCategory || 'Business'),
          location: selectedLead ? selectedLead.location : (customLocation || 'Indonesia'),
          website: selectedLead?.website,
          my_offer: myOffer || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pitch) {
          setSubject(data.pitch.subject);
          setEmailBody(data.pitch.email_body);
          setWaScript(data.pitch.whatsapp_script);
        }
      }
    } catch (err) {
      console.error('Error generating pitch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLead) {
      handleGenerate();
    }
  }, [selectedLead]);

  const handleCopyEmail = () => {
    const fullText = `Subject: ${subject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const phone = selectedLead?.phone ? selectedLead.phone.replace(/[^0-9]/g, '') : '628123456789';
    const text = encodeURIComponent(waScript);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] p-8 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="text-slate-700" size={24} /> AI Pitch Studio
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Generate high-converting Cold Email & WhatsApp Sales scripts powered by AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Select Target Lead & Offer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 h-fit">
          <h2 className="text-sm font-bold text-slate-800">1. Target Prospect</h2>

          {/* Select Existing Lead */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Select Saved Lead</label>
            <select
              value={selectedLead?.id || ''}
              onChange={(e) => {
                const found = leads.find((l) => l.id === e.target.value);
                if (found) setSelectedLead(found);
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.category || 'Business'})
                </option>
              ))}
            </select>
          </div>

          {/* Custom Offer Input */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-600">Your Product / Offer (Optional)</label>
            <textarea
              rows={3}
              placeholder="e.g. Website Redesign Services, SEO Optimization, B2B SaaS Software..."
              value={myOffer}
              onChange={(e) => setMyOffer(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#4a6382] hover:bg-[#3b5175] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? 'Generating...' : 'Generate New Pitch'}
          </button>
        </div>

        {/* Right Column: Generated Pitch Scripts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-800">2. Generated Sales Scripts</h2>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <Loader2 size={28} className="animate-spin text-slate-700" />
              <p className="text-xs font-semibold">AI is analyzing prospect & crafting message...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cold Email Subject Line */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Cold Email Subject Line</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800">
                  {subject || `Regarding ${selectedLead?.name || 'Prospect'} & Your Business`}
                </div>
              </div>

              {/* Email Body */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Body</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                />
              </div>

              {/* WhatsApp Message Script */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">WhatsApp Message Script</label>
                <input
                  type="text"
                  value={waScript}
                  onChange={(e) => setWaScript(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  onClick={handleCopyEmail}
                  className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  {copiedEmail ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedEmail ? 'Copied to Clipboard!' : 'Copy Email Script'}
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
          )}
        </div>
      </div>
    </div>
  );
}
