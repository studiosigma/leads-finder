import React, { useState } from 'react';
import { FileSpreadsheet, Database, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleSyncSheets = async () => {
    if (!sheetsUrl.trim()) return;

    setLoading(true);
    setNotification(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/export/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook_url: sheetsUrl,
          lead_ids: selectedLeads.map((l) => l.id),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: data.message || `Successfully synced ${selectedLeads.length} leads to Google Sheets!`,
        });
        setTimeout(() => {
          onClose();
          setNotification(null);
        }, 2000);
      } else {
        setNotification({
          type: 'error',
          message: data.detail || 'Failed to sync to Google Sheets.',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Network error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNotion = async () => {
    if (!notionToken.trim() || !notionDatabaseId.trim()) return;

    setLoading(true);
    setNotification(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/export/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notion_api_token: notionToken,
          database_id: notionDatabaseId,
          lead_ids: selectedLeads.map((l) => l.id),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: 'success',
          message: data.message || `Successfully synced ${selectedLeads.length} leads to Notion Database!`,
        });
        setTimeout(() => {
          onClose();
          setNotification(null);
        }, 2000);
      } else {
        setNotification({
          type: 'error',
          message: data.detail || 'Failed to sync to Notion Database.',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Network error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            Direct CRM & Spreadsheet Sync
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setTab('sheets')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'sheets' ? 'bg-white text-emerald-700 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <FileSpreadsheet size={16} /> Google Sheets
          </button>
          <button
            onClick={() => setTab('notion')}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
              tab === 'notion' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Database size={16} /> Notion Database
          </button>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 font-medium">
          Ready to sync <span className="font-bold">{selectedLeads.length} leads</span>.
        </div>

        {/* Google Sheets Tab */}
        {tab === 'sheets' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700">Google App Script / Webhook URL</label>
              <input
                type="url"
                value={sheetsUrl}
                onChange={(e) => setSheetsUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={handleSyncSheets}
              disabled={loading || !sheetsUrl.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} Sync to Google Sheets
            </button>
          </div>
        )}

        {/* Notion Database Tab */}
        {tab === 'notion' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700">Notion Integration Internal API Token</label>
              <input
                type="password"
                value={notionToken}
                onChange={(e) => setNotionToken(e.target.value)}
                placeholder="secret_..."
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700">Notion Target Database ID</label>
              <input
                type="text"
                value={notionDatabaseId}
                onChange={(e) => setNotionDatabaseId(e.target.value)}
                placeholder="32-character database id"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-zinc-800"
              />
            </div>
            <button
              onClick={handleSyncNotion}
              disabled={loading || !notionToken.trim() || !notionDatabaseId.trim()}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />} Sync to Notion Database
            </button>
          </div>
        )}

        {notification && (
          <div className={`flex items-center gap-2 text-xs p-3 rounded-lg border ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};
