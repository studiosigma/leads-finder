import React, { useState } from 'react';
import { Download, Send, X, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { CrmModal } from './crm-modal';

interface BulkActionsBarProps {
  selectedLeads: any[];
  onClearSelection: () => void;
}

export const BulkActionsBar = ({ selectedLeads, onClearSelection }: BulkActionsBarProps) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showWebhookInput, setShowWebhookInput] = useState(false);
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (selectedLeads.length === 0) return null;

  const handleExportSelectedCSV = () => {
    const keys = ["id", "name", "category", "location", "website", "email", "phone", "status", "sources"];
    const header = keys.join(",") + "\n";
    const rows = selectedLeads.map((item) =>
      keys.map((k) => {
        let val = item[k] || "";
        if (Array.isArray(val)) val = val.join("; ");
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_selected_${selectedLeads.length}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkPushWebhook = async () => {
    if (!webhookUrl.trim()) return;

    setLoading(true);
    setNotification(null);

    try {
      let successCount = 0;
      for (const lead of selectedLeads) {
        try {
          const res = await fetch('http://localhost:8000/api/v1/export/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              webhook_url: webhookUrl,
              lead_id: lead.id,
            }),
          });
          if (res.ok) successCount++;
        } catch (e) {
          // ignore single item error
        }
      }

      setNotification({
        type: 'success',
        message: `Successfully pushed ${successCount}/${selectedLeads.length} leads to webhook!`,
      });
      setTimeout(() => {
        setShowWebhookInput(false);
        setNotification(null);
        onClearSelection();
      }, 2000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: 'Failed to push leads to webhook.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 text-white rounded-2xl p-4 shadow-2xl border border-zinc-800 flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center gap-3">
          <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {selectedLeads.length} Selected
          </span>
          <span className="text-xs text-zinc-300 font-medium hidden sm:inline">
            Choose bulk action to apply:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSelectedCSV}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <Download size={14} /> Export CSV ({selectedLeads.length})
          </button>

          <button
            onClick={() => setIsCrmModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet size={14} /> Sync Sheets / Notion
          </button>

          {!showWebhookInput ? (
            <button
              onClick={() => setShowWebhookInput(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Send size={14} /> Push Webhook
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="Webhook Target URL..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
              />
              <button
                onClick={handleBulkPushWebhook}
                disabled={loading || !webhookUrl.trim()}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          )}

          <button
            onClick={onClearSelection}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors ml-2"
            title="Clear Selection"
          >
            <X size={16} />
          </button>
        </div>

        {notification && (
          <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 border shadow-lg ${
            notification.type === 'success' ? 'bg-green-900 text-green-200 border-green-700' : 'bg-red-900 text-red-200 border-red-700'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {notification.message}
          </div>
        )}
      </div>

      <CrmModal
        isOpen={isCrmModalOpen}
        onClose={() => setIsCrmModalOpen(false)}
        selectedLeads={selectedLeads}
      />
    </>
  );
};

