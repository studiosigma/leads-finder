'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, MessageCircle, Mail, Send, CheckCircle2, Users, Tag, Sparkles, Loader2, Play, Pause, ShieldCheck, AlertCircle, SearchX } from 'lucide-react';

export default function BroadcastPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [audienceFilter, setAudienceFilter] = useState<'ALL' | 'READY' | 'HAS_PHONE' | 'HAS_EMAIL'>('ALL');
  
  const [delaySeconds, setDelaySeconds] = useState<number>(10);
  const [messageTemplate, setMessageTemplate] = useState<string>(
    `Halo {{company_name}},\n\nSaya melihat kiprah luar biasa {{company_name}} di bidang {{category}} daerah {{location}}.\n\nKami memiliki solusi B2B penawaran khusus yang dapat meningkatkan pertumbuhan omset bisnis Anda secara signifikan.\n\nBoleh kami kirimkan ringkasan proposal 1 halaman via WhatsApp/Email ini?\n\nTerima kasih!`
  );

  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastProgress, setBroadcastProgress] = useState<number>(0);
  const [currentSendingLead, setCurrentSendingLead] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/leads`);
        if (res.ok) {
          const data = await res.json();
          setLeads(data || []);
        }
      } catch (err) {
        console.error('Error fetching broadcast leads:', err);
      }
    }
    fetchLeads();
  }, []);

  const targetLeads = leads.filter((l) => {
    if (audienceFilter === 'HAS_PHONE') return l.phone && l.phone !== 'N/A' && l.phone !== '-';
    if (audienceFilter === 'HAS_EMAIL') return l.email && l.email !== 'N/A' && l.email !== '-';
    return true;
  });

  const sampleLead = targetLeads[0] || null;

  const renderParsedMessage = (lead: any) => {
    if (!lead) return 'No sample lead selected from database.';
    return messageTemplate
      .replace(/{{company_name}}/g, lead.name || 'Perusahaan Anda')
      .replace(/{{category}}/g, lead.category || 'Bisnis')
      .replace(/{{location}}/g, lead.location || 'Indonesia')
      .replace(/{{website}}/g, lead.website || '-')
      .replace(/{{email}}/g, lead.email || '-')
      .replace(/{{phone}}/g, lead.phone || '-');
  };

  const insertVariable = (tag: string) => {
    setMessageTemplate((prev) => prev + ` ${tag}`);
  };

  const handleStartBroadcast = () => {
    if (targetLeads.length === 0) return;

    setIsBroadcasting(true);
    setBroadcastProgress(0);
    setNotification(null);

    let step = 0;
    const total = targetLeads.length;

    const interval = setInterval(() => {
      if (step >= total) {
        clearInterval(interval);
        setIsBroadcasting(false);
        setCurrentSendingLead(null);
        setBroadcastProgress(100);
        setNotification(`Successfully finished broadcast campaign to ${total} leads via ${channel.toUpperCase()}!`);
        return;
      }

      setCurrentSendingLead(targetLeads[step].name);
      step++;
      setBroadcastProgress(Math.round((step / total) * 100));
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] p-8 space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Megaphone className="text-slate-700" size={24} /> Broadcast Studio & Outreach Campaign
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage, personalize, and launch automated WhatsApp & Email broadcast campaigns to collected leads in your database.
        </p>
      </div>

      {/* Alert Notification */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
        </div>
      )}

      {leads.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <SearchX size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Target Leads Available for Broadcast Campaign</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Please extract leads first using <b>Find Leads</b> to populate your central database. Once leads are saved, you can launch automated WhatsApp & Cold Email campaigns here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Campaign Setup & Target Audience */}
          <div className="space-y-6">
            
            {/* Channel Selector */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-800">1. Select Broadcast Channel</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setChannel('whatsapp')}
                  className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 ${
                    channel === 'whatsapp'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageCircle size={20} className={channel === 'whatsapp' ? 'fill-emerald-600 text-emerald-600' : 'text-slate-500'} />
                  <span>WhatsApp Broadcast</span>
                </button>

                <button
                  onClick={() => setChannel('email')}
                  className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 ${
                    channel === 'email'
                      ? 'bg-slate-100 border-[#4a6382] text-slate-800 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Mail size={20} className={channel === 'email' ? 'text-[#4a6382]' : 'text-slate-500'} />
                  <span>Cold Email Campaign</span>
                </button>
              </div>
            </div>

            {/* Target Audience Selector */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Users size={16} className="text-slate-600" /> Target Audience
                </h2>
                <span className="text-xs font-extrabold text-[#4a6382] bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {targetLeads.length} Leads
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Audience Filter</label>
                <select
                  value={audienceFilter}
                  onChange={(e: any) => setAudienceFilter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
                >
                  <option value="ALL">All Database Leads ({leads.length})</option>
                  <option value="READY">Verified Ready Leads Only</option>
                  <option value="HAS_PHONE">Has WhatsApp Phone Only</option>
                  <option value="HAS_EMAIL">Has Verified Email Only</option>
                </select>
              </div>

              {/* Anti-Ban Interval Delay */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>Anti-Ban Broadcast Delay</span>
                  <span className="font-bold text-slate-800">{delaySeconds}s / msg</span>
                </label>
                <select
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
                >
                  <option value={5}>5 Seconds Delay (Fast)</option>
                  <option value={10}>10 Seconds Delay (Recommended)</option>
                  <option value={15}>15 Seconds Delay (Safe Anti-Ban)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Right Column: Template Editor & Personalization Preview */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Template Editor */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800">2. Broadcast Message Template</h2>
                <span className="text-[11px] text-slate-400">Insert variables to personalize</span>
              </div>

              {/* Insertion Variable Tags */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => insertVariable('{{company_name}}')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
                >
                  + {"{{company_name}}"}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{{category}}')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
                >
                  + {"{{category}}"}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{{location}}')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
                >
                  + {"{{location}}"}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{{website}}')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
                >
                  + {"{{website}}"}
                </button>
              </div>

              <textarea
                rows={6}
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
              />
            </div>

            {/* Live Personalization Preview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles size={16} className="text-slate-600" /> Live Sample Personalization Preview
              </h2>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs font-sans text-slate-800 whitespace-pre-wrap leading-relaxed">
                {sampleLead ? (
                  <>
                    <div className="text-[11px] font-bold text-slate-500 border-b border-slate-200 pb-1 mb-2">
                      Recipient: {sampleLead.name} ({sampleLead.category || 'Business'} - {sampleLead.location || 'Indonesia'})
                    </div>
                    {renderParsedMessage(sampleLead)}
                  </>
                ) : (
                  <div className="text-slate-400 font-medium py-4 text-center">
                    No lead available for live preview.
                  </div>
                )}
              </div>

              {/* Launch Campaign Control Bar */}
              <div className="pt-2 flex items-center justify-between gap-4">
                {isBroadcasting ? (
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-[#4a6382]" /> Sending to: {currentSendingLead || 'Processing...'}
                      </span>
                      <span>{broadcastProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#4a6382] h-full transition-all duration-300 rounded-full" style={{ width: `${broadcastProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleStartBroadcast}
                    disabled={targetLeads.length === 0}
                    className="w-full py-3 px-6 bg-[#4a6382] hover:bg-[#3b5175] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Send size={16} />
                    Launch {channel === 'whatsapp' ? 'WhatsApp' : 'Cold Email'} Broadcast Campaign ({targetLeads.length} Leads)
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
