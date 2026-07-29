'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, MessageCircle, Check, Loader2, RefreshCw, Building2, MapPin, Tag, SearchX, Search as SearchIcon, Send, Wand2 } from 'lucide-react';

export default function AiPitchPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  
  const [pitchTone, setPitchTone] = useState<'persuasive' | 'formal' | 'casual'>('persuasive');
  const [myOffer, setMyOffer] = useState('');

  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [waScript, setWaScript] = useState('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const demoLeads = [
    { id: 'demo-1', name: 'RSUD Kabupaten Bekasi', category: 'Rumah Sakit & Kesehatan', location: 'Tambun Selatan, Bekasi', phone: '+62 21-8832-1920', email: 'info@rsudkabbekasi.id', website: 'rsudkabbekasi.id' },
    { id: 'demo-2', name: 'PT Gunung Raja Paksi Tbk', category: 'Manufaktur & Industry', location: 'Tambun Selatan, Bekasi', phone: '+62 21-8983-0000', email: 'info@gunungrajapaksi.com', website: 'gunungrajapaksi.com' },
    { id: 'demo-3', name: 'RS Hermina Grand Wisata', category: 'Rumah Sakit & Kesehatan', location: 'Tambun Selatan, Bekasi', phone: '+62 21-8265-1212', email: 'callcenter@herminahospitals.com', website: 'herminahospitals.com' },
  ];

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/leads`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setLeads(data);
            setSelectedLead(data[0]);
            updatePitchForLead(data[0], pitchTone, myOffer);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
      }
    }
    fetchLeads();
  }, []);

  const handleLoadDemoLeads = () => {
    setLeads(demoLeads);
    setSelectedLead(demoLeads[0]);
    updatePitchForLead(demoLeads[0], pitchTone, myOffer);
  };

  const updatePitchForLead = (lead: any, tone: string, offer: string) => {
    if (!lead) return;
    const generated = generatePitchContent(lead, tone, offer);
    setSubject(generated.subject);
    setEmailBody(generated.email);
    setWaScript(generated.wa);
  };

  const generatePitchContent = (lead: any, tone: string, offer: string) => {
    const offerText = offer.trim() ? offer.trim() : 'Layanan Solusi B2B Growth & Efisiensi Operasional';
    const category = lead.category || 'Bisnis';
    const location = lead.location || 'Indonesia';
    const leadName = lead.name || 'Perusahaan';

    if (tone === 'formal') {
      return {
        subject: `Proposal Kemitraan Strategis: ${leadName} x ${offerText}`,
        email: `Kepada Yth. Manajemen & Tim Direksi\n${leadName}\nDi Tempat\n\nDengan hormat,\n\nSehubungan dengan pesatnya perkembangan sektor ${category} di wilayah ${location}, kami dari tim profesional ingin mengajukan penawaran kemitraan terkait ${offerText}.\n\nKami telah berpengalaman membantu perusahaan terkemuka dalam meningkatkan efisiensi dan ROI operasional. Boleh kami kirimkan ringkasan proposal 1 halaman atau menjadwalkan diskusi singkat selama 10 menit minggu ini?\n\nHormat kami,\n[Nama Anda]\n[Jabatan Anda]\n[Nama Perusahaan Anda]`,
        wa: `Selamat siang Bapak/Ibu Manajemen ${leadName}.\n\nPerkenalkan saya [Nama Anda]. Kami bergerak di bidang ${offerText} khusus sektor ${category}. Boleh kami kirimkan profil ringkas penawaran kami via WhatsApp ini?\n\nTerima kasih!`
      };
    } else if (tone === 'casual') {
      return {
        subject: `Peluang Kolaborasi Singkat untuk ${leadName}`,
        email: `Halo Tim ${leadName},\n\nSalam kenal! Kami sangat mengagumi kiprah ${leadName} di industri ${category} area ${location}.\n\nKami memiliki solusi ${offerText} yang dapat membantu tim Anda berkembang lebih cepat dan efisien. Apakah ada waktu luang sekitar 5 menit minggu ini untuk ngobrol santai?\n\nSalam hangat,\n[Nama Anda]`,
        wa: `Halo Kak! Salam kenal dari tim kami. Kami mengamati perkembangan ${leadName} di ${category}. Kami punya solusi ${offerText} yang cocok banget untuk skala bisnis Anda. Boleh diskusi santai sebentar?`
      };
    } else {
      return {
        subject: `Kerjasama Penawaran ${offerText} untuk ${leadName}`,
        email: `Halo Manajemen ${leadName},\n\nKami mengamati posisi kuat ${leadName} dalam sektor ${category} di ${location}.\n\nSistem ${offerText} kami terbukti mampu membantu meningkatkan produktivitas hingga 40% dan menghemat biaya operasional. Apakah Bapak/Ibu bersedia berdiskusi singkat 5 menit untuk melihat potensi penerapannya di ${leadName}?\n\nTerima kasih dan salam sukses,\n[Nama Anda]\nB2B Business Lead`,
        wa: `Halo Bapak/Ibu Manajemen ${leadName},\n\nKami ingin berbagi solusi penawaran ${offerText} khusus untuk sektor ${category}. Sudah banyak mitra kami di ${location} mengalami peningkatan efisiensi hingga 40%.\n\nBoleh kami kirimkan materi presentasi singkatnya?`
      };
    }
  };

  const handleGenerate = async () => {
    if (!selectedLead) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/generate-pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: selectedLead.name,
          category: selectedLead.category || 'Business',
          location: selectedLead.location || 'Indonesia',
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

    updatePitchForLead(selectedLead, pitchTone, myOffer);
    setLoading(false);
  };

  const handleSelectLead = (leadId: string) => {
    const found = leads.find((l) => l.id === leadId);
    if (found) {
      setSelectedLead(found);
      updatePitchForLead(found, pitchTone, myOffer);
    }
  };

  const handleToneChange = (tone: 'persuasive' | 'formal' | 'casual') => {
    setPitchTone(tone);
    if (selectedLead) {
      updatePitchForLead(selectedLead, tone, myOffer);
    }
  };

  const handlePresetOffer = (preset: string) => {
    setMyOffer(preset);
    if (selectedLead) {
      updatePitchForLead(selectedLead, pitchTone, preset);
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
    const phone = selectedLead?.phone ? selectedLead.phone.split(/[\n,]+/)[0].replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(waScript);
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
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

      {leads.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <SearchX size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No Target Leads Available for AI Pitching</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Run a search in <b>Find Leads</b> first or test with sample prospects below to generate personalized sales pitch scripts immediately!
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-5 py-2.5 bg-[#4a6382] hover:bg-[#3b5175] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <SearchIcon size={14} /> Search Real-time Leads
            </Link>
            <button
              onClick={handleLoadDemoLeads}
              className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <Wand2 size={14} className="text-emerald-600" /> Try Demo with Sample Prospects
            </button>
          </div>
        </div>
      ) : (
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
                    {l.name} ({l.category || 'Business'})
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
                  <span className="flex items-center gap-1"><Tag size={12} /> {selectedLead.category || 'Business'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {selectedLead.location || 'Indonesia'}</span>
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
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-600 block">Your Product / Value Offer</label>
              
              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1">
                {[
                  '⚙️ Solusi B2B Growth',
                  '🏥 Peralatan Medis & Alkes',
                  '🏭 Peralatan Industri & Pabrik',
                  '💻 Pengembangan Web & Software'
                ].map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handlePresetOffer(preset)}
                    className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200/80 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="Misal: Solusi Sistem Software HRD, Peralatan Medis Rumah Sakit, Jasa Kontraktor Pabrik..."
                value={myOffer}
                onChange={(e) => setMyOffer(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedLead}
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
                disabled={!selectedLead}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors disabled:opacity-40"
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
                    rows={4}
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
                    className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle size={14} className="fill-white" />
                    Kirim via WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
