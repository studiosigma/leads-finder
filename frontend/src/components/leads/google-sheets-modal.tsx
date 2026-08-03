'use client';

import React, { useState, useEffect } from 'react';
import { X, Table, Check, Copy, ExternalLink, Send, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncLeads?: (leads: any[]) => void;
}

const APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var leads = Array.isArray(data) ? data : (data.leads || [data]);
  
  // Create Headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp", "Nama Perusahaan", "Kategori", "Lokasi", 
      "WhatsApp / Telepon", "Email", "Status Deliverability", "Website", 
      "Tech Stack", "Decision Maker", "Jabatan", "Lead Score", "SIINas Verified"
    ]);
  }

  leads.forEach(function(l) {
    sheet.appendRow([
      new Date().toLocaleString("id-ID"),
      l.name || "-",
      l.category || "-",
      l.location || "-",
      l.phone || "-",
      l.email || "-",
      l.email_status || "UNVERIFIED",
      l.website || "-",
      Array.isArray(l.tech_stack) ? l.tech_stack.join(", ") : (l.tech_stack || "-"),
      l.decision_maker_name || "-",
      l.decision_maker_title || "-",
      l.lead_score || 0,
      l.is_siinas_verified ? "YA (SIINas)" : "TIDAK"
    ]);
  });

  return ContentService.createTextOutput(JSON.stringify({ status: "success", count: leads.length }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export const GoogleSheetsModal = ({ isOpen, onClose }: GoogleSheetsModalProps) => {
  if (!isOpen) return null;

  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedUrl = localStorage.getItem('leads_finder_gsheet_webhook') || '';
      const savedAuto = localStorage.getItem('leads_finder_gsheet_autosync') === 'true';
      setWebhookUrl(prev => prev !== savedUrl ? savedUrl : prev);
      setAutoSync(prev => prev !== savedAuto ? savedAuto : prev);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('leads_finder_gsheet_webhook', webhookUrl.trim());
    localStorage.setItem('leads_finder_gsheet_autosync', autoSync ? 'true' : 'false');
    onClose();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!webhookUrl.trim()) {
      setTestStatus('error');
      setTestMessage('Masukkan URL Webhook Google Sheets terlebih dahulu');
      return;
    }

    setTestStatus('testing');
    try {
      const samplePayload = [
        {
          name: "PT Sample Prospek (Test Sync)",
          category: "Manufaktur & Industry",
          location: "Bekasi, Jawa Barat",
          phone: "+628123456789",
          email: "test@sample.co.id",
          email_status: "DELIVERABLE",
          website: "https://www.sample.co.id",
          decision_maker_name: "Manager Purchasing",
          decision_maker_title: "Head of Procurement",
          lead_score: 100,
          is_siinas_verified: true
        }
      ];

      await fetch(webhookUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(samplePayload)
      });

      setTestStatus('success');
      setTestMessage('Test sync terkirim! Periksa spreadsheet Google Anda.');
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(`Gagal terhubung: ${e.message || 'Network error'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <Table size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                Integrasi Sync Google Sheets Real-Time
              </h3>
              <p className="text-xs text-slate-500 font-medium">Hubungkan spreadsheet Google Sheets tim sales Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Webhook Input */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
            🌐 Webhook URL Google Sheets (Google Apps Script / Make / Zapier):
          </label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        {/* Auto Sync Toggle */}
        <div className="flex items-center gap-2 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80">
          <input
            type="checkbox"
            id="autosync-toggle"
            checked={autoSync}
            onChange={(e) => setAutoSync(e.target.checked)}
            className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
          />
          <label htmlFor="autosync-toggle" className="text-xs font-bold text-emerald-900 cursor-pointer">
            ⚡ Otomatis Push Data Prospek Baru ke Google Sheets Setiap Selesai Pencarian
          </label>
        </div>

        {/* Test Connection Button & Status */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {testStatus === 'testing' ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            {testStatus === 'testing' ? 'Menguji...' : '🧪 Uji Koneksi Google Sheets'}
          </button>

          {testStatus === 'success' && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded flex items-center gap-1">
              <Check size={12} /> {testMessage}
            </span>
          )}
          {testStatus === 'error' && (
            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded flex items-center gap-1">
              <AlertCircle size={12} /> {testMessage}
            </span>
          )}
        </div>

        {/* Google Apps Script Code Helper */}
        <div className="space-y-1.5 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
              <Sparkles size={13} className="text-amber-500" /> Kode Script Google Apps Script (Gratis 0-Code):
            </span>
            <button
              onClick={handleCopyCode}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              {copiedCode ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copiedCode ? 'Kode Tersalin!' : 'Salin Kode Script'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Buka Google Sheets → pilih <strong>Extensions (Ekstensi)</strong> → <strong>Apps Script</strong> → Paste kode ini dan Klik <strong>Deploy as Web App</strong> (Anyone access).
          </p>
          <pre className="text-[10px] font-mono bg-slate-900 text-emerald-400 p-3 rounded-xl max-h-36 overflow-y-auto leading-relaxed border border-slate-800">
            {APPS_SCRIPT_TEMPLATE}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md hover:shadow-emerald-600/30 transition-all cursor-pointer"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
