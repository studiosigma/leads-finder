import React, { useState } from 'react';
import { Send, X, CheckCircle, AlertCircle } from 'lucide-react';

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
}

export const WebhookModal = ({ isOpen, onClose, lead }: WebhookModalProps) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen || !lead) return null;

  const handlePush = async () => {
    if (!webhookUrl.trim()) return;

    setLoading(true);
    setStatus('idle');

    try {
      const res = await fetch('http://localhost:8000/api/v1/export/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook_url: webhookUrl,
          lead_id: lead.id,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage('Lead data pushed to webhook successfully!');
        setTimeout(() => {
          onClose();
          setStatus('idle');
          setWebhookUrl('');
        }, 1800);
      } else {
        setStatus('error');
        setMessage('Failed to push lead to webhook endpoint.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Send size={18} className="text-blue-600" /> Push Lead to Webhook
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-xs text-zinc-600 space-y-1">
          <p className="font-semibold text-zinc-900">{lead.name}</p>
          <p>Email: {lead.email} | Phone: {lead.phone}</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700">Webhook Target URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {status === 'success' && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
            <CheckCircle size={16} /> {message}
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle size={16} /> {message}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePush}
            disabled={loading || !webhookUrl.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? 'Sending...' : 'Send Webhook'}
          </button>
        </div>
      </div>
    </div>
  );
};
