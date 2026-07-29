'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, MessageCircle, Check, Loader2, RefreshCw, Building2, MapPin, Tag } from 'lucide-react';

const DEFAULT_LEADS = [
  { id: '1', name: 'Acme Corp', category: 'Technology', location: 'San Francisco, CA', website: 'acme.co', email: 'sarah@acme.co', phone: '+1 555-0192' },
  { id: '2', name: 'Data Tech', category: 'Technology', location: 'San Francisco, CA', website: 'datatech.io', email: 'contact@datatech.io', phone: '+1 555-0192' },
  { id: '3', name: 'Global Solutions', category: 'Marketing', location: 'San Francisco, CA', website: 'globalsol.com', email: 'info@globalsol.com', phone: '+1 555-0192' },
  { id: '4', name: 'Apex Innovations', category: 'Technology', location: 'San Francisco, CA', website: 'apex.io', email: 'hello@apex.io', phone: '+1 555-0192' },
  { id: '5', name: 'Bimrny Tech', category: 'Marketing', location: 'San Francisco, CA', website: 'bimrny.com', email: 'sales@bimrny.com', phone: '+1 555-0192' },
  { id: '6', name: 'Glesan Tech', category: 'Technology', location: 'San Francisco, CA', website: 'glesan.io', email: 'info@glesan.io', phone: '+1 555-0192' },
  { id: '7', name: 'Eech Liog', category: 'Marketing', location: 'San Francisco, CA', website: 'eech.com', email: 'hello@eech.com', phone: '+1 555-0192' },
];

export default function AiPitchPage() {
  const [leads, setLeads] = useState<any[]>(DEFAULT_LEADS);
  const [selectedLead, setSelectedLead] = useState<any>(DEFAULT_LEADS[0]);
  const [loading, setLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  
  const [pitchTone, setPitchTone] = useState<'persuasive' | 'formal' | 'casual'>('persuasive');
  const [myOffer, setMyOffer] = useState('');

  const [subject, setSubject] = useState(`Regarding ${DEFAULT_LEADS[0].name} & Growth Partnership : Synergy?`);
  const [emailBody, setEmailBody] = useState(
    `Hello Sarah,\n\nI noticed ${DEFAULT_LEADS[0].name}'s recent growth in ${DEFAULT_LEADS[0].category}. We have helped similar ${DEFAULT_LEADS[0].location} firms achieve significant conversion increases using our specialized B2B solution.\n\nWould you be open to a quick 5-minute chat next Tuesday to explore how we can replicate this for ${DEFAULT_LEADS[0].name}?\n\nBest regards,\n[Your Name]\nSales Director`
  );
  const [waScript, setWaScript] = useState(
    `Hi Sarah! I saw ${DEFAULT_LEADS[0].name}'s work in ${DEFAULT_LEADS[0].category}. We helped a similar firm in ${DEFAULT_LEADS[0].location} boost results by 40%. Would love to share a quick 2-minute demo with you!`
  );

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/leads');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setLeads(data);
            setSelectedLead(data[0]);
          }
        }
      } catch (err) {
        console.error('Using default fallback leads dataset:', err);
      }
    }
    fetchLeads();
  }, []);

  const generatePitchContent = (lead: any, tone: string, offer: string) => {
    const offerText = offer.trim() ? offer.trim() : 'our B2B Growth Platform';
    const category = lead.category || 'Technology';
    const location = lead.location || 'San Francisco, CA';

    if (tone === 'formal') {
      return {
        subject: `Executive Proposal: ${lead.name} x ${offerText}`,
        email: `Dear Decision Maker,\n\nI am reaching out regarding ${lead.name}'s ongoing initiatives within the ${category} sector in ${location}.\n\nOur team specializes in providing ${offerText} tailored to market leaders. We would welcome the opportunity to submit a brief preliminary proposal.\n\nSincerely,\n[Your Name]\n[Your Title]`,
        wa: `Good day. I am writing regarding ${lead.name}'s initiatives in ${category}. We specialize in ${offerText}. May I share a 1-page overview with your team?`
      };
    } else if (tone === 'casual') {
      return {
        subject: `Quick question for ${lead.name} team!`,
        email: `Hi there,\n\nCame across ${lead.name} while researching top ${category} companies in ${location}. Really impressed by your work!\n\nWe build ${offerText} that helps teams like yours scale faster without the headache. Worth a quick 5-min chat this week?\n\nCheers,\n[Your Name]`,
        wa: `Hey! Loved ${lead.name}'s presence in ${category}. We help ${location} companies with ${offerText}. Open to a quick chat?`
      };
    } else {
      return {
        subject: `Regarding ${lead.name} & ${offerText} : Synergy?`,
        email: `Hello Sarah,\n\nI noticed ${lead.name}'s strong positioning in ${category}. We've helped similar ${location} firms achieve a 40%+ increase in ROI using ${offerText}.\n\nWould you be open to a brief 5-minute exchange next week to see how this applies to ${lead.name}?\n\nBest regards,\n[Your Name]\nB2B Outreach Manager`,
        wa: `Hi Sarah! I saw ${lead.name}'s impressive work in ${category}. We helped a team in ${location} boost ROI by 40% using ${offerText}. Would love to share a quick 2-min demo with you!`
      };
    }
  };

  const handleGenerate = async () => {
    if (!selectedLead) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: selectedLead.name,
          category: selectedLead.category || 'Technology',
          location: selectedLead.location || 'San Francisco, CA',
          website: selectedLead.website,
          my_offer: myOffer || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pitch) {
          setSubject(data.pitch.subject);
          setEmailBody(data.pitch.email_body);
          setWaScript(data.pitch.whatsapp_script);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Using client-side pitch generator fallback:', err);
    }

    // Client-side fallback generation
    const generated = generatePitchContent(selectedLead, pitchTone, myOffer);
    setSubject(generated.subject);
    setEmailBody(generated.email);
    setWaScript(generated.wa);
    setLoading(false);
  };

  const handleSelectLead = (leadId: string) => {
    const found = leads.find((l) => l.id === leadId);
    if (found) {
      setSelectedLead(found);
      const generated = generatePitchContent(found, pitchTone, myOffer);
      setSubject(generated.subject);
      setEmailBody(generated.email);
      setWaScript(generated.wa);
    }
  };

  const handleToneChange = (tone: 'persuasive' | 'formal' | 'casual') => {
    setPitchTone(tone);
    if (selectedLead) {
      const generated = generatePitchContent(selectedLead, tone, myOffer);
      setSubject(generated.subject);
      setEmailBody(generated.email);
      setWaScript(generated.wa);
    }
  };

  const handleCopyEmail = () => {
    const fullText = `Subject: ${subject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyWa = () => {
    navigator.clipboard.writeText(waScript);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const phone = selectedLead?.phone ? selectedLead.phone.replace(/[^0-9]/g, '') : '15550192';
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
        {/* Left Column: Select Target Lead & Pitch Customization */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 h-fit">
          <h2 className="text-sm font-bold text-slate-800">1. Target Prospect & Tone</h2>

          {/* Select Saved Lead */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Select Saved Lead</label>
            <select
              value={selectedLead?.id || ''}
              onChange={(e) => handleSelectLead(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.category || 'Technology'})
                </option>
              ))}
            </select>
          </div>

          {/* Target Lead Badge Summary */}
          {selectedLead && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Building2 size={14} className="text-slate-500" /> {selectedLead.name}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Tag size={12} /> {selectedLead.category || 'Technology'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {selectedLead.location || 'San Francisco, CA'}</span>
              </div>
            </div>
          )}

          {/* Pitch Tone Selector */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-600">Pitch Style & Tone</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleToneChange('persuasive')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
                  pitchTone === 'persuasive' ? 'bg-[#4a6382] text-white border-[#4a6382]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Persuasive
              </button>
              <button
                onClick={() => handleToneChange('formal')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
                  pitchTone === 'formal' ? 'bg-[#4a6382] text-white border-[#4a6382]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Executive
              </button>
              <button
                onClick={() => handleToneChange('casual')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
                  pitchTone === 'casual' ? 'bg-[#4a6382] text-white border-[#4a6382]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Casual
              </button>
            </div>
          </div>

          {/* Custom Offer Input */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-600">Your Product / Offer (Optional)</label>
            <textarea
              rows={3}
              placeholder="e.g. Website Redesign Services, B2B Growth Platform, SEO Automation..."
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
            {loading ? 'Regenerating Pitch...' : 'Regenerate Pitch'}
          </button>
        </div>

        {/* Right Column: Generated Pitch Scripts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">2. Generated Sales Scripts</h2>
            <button
              onClick={handleGenerate}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <Loader2 size={28} className="animate-spin text-slate-700" />
              <p className="text-xs font-semibold">AI is analyzing prospect & crafting personalized message...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cold Email Subject Line */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Cold Email Subject Line</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 font-semibold">
                  {subject}
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
                <textarea
                  value={waScript}
                  onChange={(e) => setWaScript(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleCopyEmail}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  {copiedEmail ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedEmail ? 'Email Copied!' : 'Copy Email Script'}
                </button>

                <button
                  onClick={handleCopyWa}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  {copiedWa ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copiedWa ? 'WhatsApp Script Copied!' : 'Copy WhatsApp Script'}
                </button>

                <button
                  onClick={handleOpenWhatsApp}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-[#4a6382] hover:bg-[#3b5175] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
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
