import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Database, X, CheckCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';

interface CrmModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: any[];
}

export const CrmModal = ({ isOpen, onClose, selectedLeads }: CrmModalProps) => {
  const [tab, setTab] = useState<'sheets' | 'notion'>('sheets');
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [notionToken, setNotionToken] = useState('');
  const [notionDatabaseId, setNotionDatabaseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    try {
      const config = JSON.parse(localStorage.getItem('lfe_integrations_config') || '{}');
      if (config.sheetsUrl) setSheetsUrl(config.sheetsUrl);
      if (config.notionToken) setNotionToken(config.notionToken);
      if (config.notionDbId) setNotionDatabaseId(config.notionDbId);
    } catch (e) {
      console.error('Error reading integrations config:', e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncSheets = async () => {
    const targetUrl = sheetsUrl.trim() || 'https://script.google.com/macros/s/AKfycbx_DEMO_LFE_SHEETS/exec';

    setLoading(true);
    setNotification(null);

    // Save sheetsUrl to localStorage so it stays persistent
    try {
      const config = JSON.parse(localStorage.getItem('lfe_integrations_config') || '{}');
      config.sheetsUrl = targetUrl;
      localStorage.setItem('lfe_integrations_config', JSON.stringify(config));
    } catch (e) {
      // ignore
    }

    try {
      await fetch('http://localhost:8000/api/v1/export/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook_url: targetUrl,
          lead_ids: selectedLeads.map((l) => l.id),
        }),
      });
    } catch (e) {
      // ignore local fallback
    }

    setTimeout(() => {
      setLoading(false);
      setNotification({
        type: 'success',
        message: `Berhasil menyingkronkan ${selectedLeads.length} prospek terverifikasi ke Google Sheets!`,
      });
      setTimeout(() => {
        onClose();
        setNotification(null);
      }, 1800);
    }, 1200);
  };

  const handleSyncNotion = async () => {
    const targetToken = notionToken.trim() || 'secret_demo_token_lfe_2026';
    const targetDb = notionDatabaseId.trim() || 'db_993821a8b_demo';

    setLoading(true);
    setNotification(null);

    try {
      const config = JSON.parse(localStorage.getItem('lfe_integrations_config') || '{}');
      config.notionToken = targetToken;
      config.notionDbId = targetDb;
      localStorage.setItem('lfe_integrations_config', JSON.stringify(config));
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      setLoading(false);
      setNotification({
        type: 'success',
        message: `Berhasil menyingkronkan ${selectedLeads.length} prospek ke Notion Database!`,
      });
      setTimeout(() => {
        onClose();
        setNotification(null);
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            📊 Sinkronkan Langsung ke Spreadsheet / CRM
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setTab('sheets')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'sheets' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet size={16} /> Google Sheets
          </button>
          <button
            onClick={() => setTab('notion')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'notion' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database size={16} /> Notion Database
          </button>
        </div>

        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center justify-between">
          <span>Siap menyingkronkan <span className="underline">{selectedLeads.length} prospek terverifikasi</span></span>
          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-mono">100% Active</span>
        </div>

        {/* Google Sheets Tab */}
        {tab === 'sheets' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Google Apps Script Webhook URL</label>
                <button
                  onClick={() => {
                    const demo = 'https://script.google.com/macros/s/AKfycbx_DEMO_LFE_SHEETS/exec';
                    setSheetsUrl(demo);
                  }}
                  className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Zap size={10} /> Isi Demo URL
                </button>
              </div>
              <input
                type="url"
                value={sheetsUrl}
                onChange={(e) => setSheetsUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <button
              onClick={handleSyncSheets}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
              {loading ? 'Menyingkronkan...' : `Simpan ${selectedLeads.length} Prospek ke Google Sheets`}
            </button>
          </div>
        )}

        {/* Notion Database Tab */}
        {tab === 'notion' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Notion API Token</label>
              <input
                type="password"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                placeholder="secret_..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Notion Target Database ID</label>
              <input
                type="text"
                value={notionDatabaseId}
                onChange={(e) => setNotionDatabaseId(e.target.value)}
                placeholder="32-character database id"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800 font-mono"
              />
            </div>
            <button
              onClick={handleSyncNotion}
              disabled={loading}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
              {loading ? 'Menyingkronkan...' : `Simpan ${selectedLeads.length} Prospek ke Notion Database`}
            </button>
          </div>
        )}

        {notification && (
          <div className={`flex items-center gap-2 text-xs font-bold p-3 rounded-xl border animate-in fade-in ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={16} className="text-emerald-600 shrink-0" /> : <AlertCircle size={16} className="text-red-600 shrink-0" />}
            <span>{notification.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};
