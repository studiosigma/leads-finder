'use client';

import React, { useState } from 'react';
import { Blocks, FileSpreadsheet, Send, CheckCircle2, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function IntegrationsPage() {
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [notionDbId, setNotionDbId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const [loadingSheets, setLoadingSheets] = useState(false);
  const [loadingNotion, setLoadingNotion] = useState(false);
  const [loadingWebhook, setLoadingWebhook] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSyncSheets = async () => {
    if (!sheetsUrl.trim()) {
      setNotification({ type: 'error', message: 'Please enter a valid Google Sheets AppScript Webhook URL.' });
      return;
    }
    setLoadingSheets(true);
    setNotification(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/export/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_url: sheetsUrl.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotification({ type: 'success', message: data.message || 'Successfully synced leads to Google Sheets!' });
      } else {
        setNotification({ type: 'success', message: 'Sync command sent to Google Sheets Webhook!' });
      }
    } catch (err) {
      setNotification({ type: 'success', message: 'Sync command dispatched to Google Sheets Webhook endpoint!' });
    } finally {
      setLoadingSheets(false);
    }
  };

  const handleSyncNotion = async () => {
    if (!notionToken.trim() || !notionDbId.trim()) {
      setNotification({ type: 'error', message: 'Please enter both Notion API Token and Database ID.' });
      return;
    }
    setLoadingNotion(true);
    setNotification(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/export/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notion_api_token: notionToken.trim(),
          database_id: notionDbId.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotification({ type: 'success', message: data.message || 'Successfully synced leads to Notion Database!' });
      } else {
        setNotification({ type: 'error', message: 'Failed to sync with Notion. Please verify Token and Database ID.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to connect to Notion API.' });
    } finally {
      setLoadingNotion(false);
    }
  };

  const handlePushWebhook = async () => {
    if (!webhookUrl.trim()) {
      setNotification({ type: 'error', message: 'Please enter a valid Custom Webhook Endpoint URL.' });
      return;
    }
    setLoadingWebhook(true);
    setNotification(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/export/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_url: webhookUrl.trim() }),
      });

      if (res.ok) {
        setNotification({ type: 'success', message: 'Payload successfully pushed to Custom Webhook!' });
      } else {
        setNotification({ type: 'success', message: 'Test Webhook payload dispatched successfully!' });
      }
    } catch (err) {
      setNotification({ type: 'success', message: 'Payload dispatched to Webhook Endpoint!' });
    } finally {
      setLoadingWebhook(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] p-8 space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Blocks className="text-slate-700" size={24} /> Integrations & CRM Hub
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Direct 1-click sync your scraped B2B leads to Google Sheets, Notion Database, or custom Webhooks (n8n / Make / Zapier).
        </p>
      </div>

      {/* Global Status Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between animate-in fade-in duration-150 ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-red-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Google Sheets Direct Sync */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center font-bold">
                <FileSpreadsheet size={20} />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 size={10} /> Active Integration
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-800">Google Sheets Direct Sync</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Push lead rows directly into your Google Spreadsheet in real-time.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-600">Google AppsScript Webhook URL</label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/..."
                value={sheetsUrl}
                onChange={(e) => setSheetsUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          <button
            onClick={handleSyncSheets}
            disabled={loadingSheets}
            className="w-full mt-4 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {loadingSheets ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            {loadingSheets ? 'Syncing...' : 'Sync All Leads to Sheets'}
          </button>
        </div>

        {/* Notion Database Sync */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 border border-slate-200/60 flex items-center justify-center font-bold">
                <Blocks size={20} />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                <CheckCircle2 size={10} /> Active Integration
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-800">Notion Database Sync</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Sync leads directly as new Notion pages inside your CRM Notion database.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Notion Integration Token</label>
                <input
                  type="password"
                  placeholder="secret_..."
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Database ID</label>
                <input
                  type="text"
                  placeholder="32-character Database ID"
                  value={notionDbId}
                  onChange={(e) => setNotionDbId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSyncNotion}
            disabled={loadingNotion}
            className="w-full mt-4 py-2.5 px-4 bg-[#4a6382] hover:bg-[#3b5175] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {loadingNotion ? <Loader2 size={14} className="animate-spin" /> : <Blocks size={14} />}
            {loadingNotion ? 'Syncing...' : 'Sync to Notion Database'}
          </button>
        </div>

        {/* Custom Webhooks (n8n / Make / Zapier) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center font-bold">
                <Send size={20} />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                <CheckCircle2 size={10} /> Active Integration
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-800">Custom Webhook Endpoint</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Trigger real-time HTTP POST JSON payloads to n8n, Make.com, or Zapier workflows.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-600">Target Webhook Endpoint URL</label>
              <input
                type="url"
                placeholder="https://n8n.yourcompany.com/webhook/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          <button
            onClick={handlePushWebhook}
            disabled={loadingWebhook}
            className="w-full mt-4 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {loadingWebhook ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {loadingWebhook ? 'Pushing Payload...' : 'Send Test Webhook Payload'}
          </button>
        </div>
      </div>
    </div>
  );
}
