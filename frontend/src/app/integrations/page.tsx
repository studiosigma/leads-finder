'use client';

import React, { useState } from 'react';
import { Blocks, FileSpreadsheet, Send, CheckCircle2, ArrowRight } from 'lucide-react';

export default function IntegrationsPage() {
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [notionDbId, setNotionDbId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] p-8 space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Blocks className="text-slate-700" size={24} /> Integrations & CRM Hub
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Direct 1-click sync your scraped B2B leads to Google Sheets, Notion Database, or custom Webhooks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Google Sheets */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center font-bold">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Google Sheets Direct Sync</h2>
              <p className="text-xs text-slate-500 mt-1">
                Automatically push lead rows directly into your Google Spreadsheet via Webhook Script.
              </p>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              <CheckCircle2 size={12} /> Ready to Sync
            </span>
          </div>
        </div>

        {/* Notion Database */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 border border-slate-200/60 flex items-center justify-center font-bold">
              <Blocks size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Notion Database Sync</h2>
              <p className="text-xs text-slate-500 mt-1">
                Sync leads directly as new Notion pages inside your CRM Notion database.
              </p>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              <CheckCircle2 size={12} /> Ready to Sync
            </span>
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center font-bold">
              <Send size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Custom Webhooks (n8n / Make / Zapier)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Trigger real-time HTTP POST JSON payloads to any automation workflow.
              </p>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              <CheckCircle2 size={12} /> Ready to Push
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
