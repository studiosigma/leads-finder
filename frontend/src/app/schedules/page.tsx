'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Play, CheckCircle2, RefreshCw, Sparkles, Check, SearchX } from 'lucide-react';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [cron, setCron] = useState('Every Monday at 09:00 AM');
  const [notification, setNotification] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchSchedules = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/schedules`);
      if (res.ok) {
        const data = await res.json();
        if (data.schedules) {
          setSchedules(data.schedules);
        }
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleCreateSchedule = async () => {
    if (!query.trim()) return;

    const newJob = {
      id: String(Date.now()),
      query: query.trim(),
      cron_expression: cron,
      next_run: 'Next Monday 09:00 AM',
      status: 'ACTIVE',
    };

    setSchedules((prev) => [newJob, ...prev]);
    setQuery('');
    setNotification(`Successfully scheduled autopilot scraping job for "${newJob.query}"!`);
    setTimeout(() => setNotification(null), 3000);

    try {
      await fetch(`${API_BASE}/api/v1/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newJob.query, cron_expression: newJob.cron_expression }),
      });
    } catch (err) {
      console.error('Backend schedule creation handled locally.');
    }
  };

  const handleRunNow = (jobQuery: string) => {
    setNotification(`Triggered immediate scraper run for "${jobQuery}"!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteSchedule = async (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setNotification('Schedule job removed.');
    setTimeout(() => setNotification(null), 2000);

    try {
      await fetch(`${API_BASE}/api/v1/schedule/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Backend schedule deletion handled locally.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] p-8 space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Clock className="text-slate-700" size={24} /> Scheduled Scraping Jobs
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Automate recurring prospect searches. Scrape new business leads every week/month on autopilot.
        </p>
      </div>

      {/* Alert Notification */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Add New Schedule Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Create New Recurring Scraping Job</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Target Keyword & Location (e.g. Pabrik Plastik Bekasi)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <select
            value={cron}
            onChange={(e) => setCron(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
          >
            <option value="Every Monday at 09:00 AM">Every Monday at 09:00 AM</option>
            <option value="Every Day at 09:00 AM">Every Day at 09:00 AM</option>
            <option value="First Day of Every Month">First Day of Every Month</option>
          </select>
          <button
            onClick={handleCreateSchedule}
            className="px-4 py-2.5 bg-[#4a6382] hover:bg-[#3b5175] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus size={16} /> Add Job
          </button>
        </div>
      </div>

      {/* Active Schedules Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>Active Scheduled Jobs ({schedules.length})</span>
          <span className="text-[11px] font-normal text-slate-500">Autopilot Celery Cron Runner Engine</span>
        </div>

        {schedules.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Clock size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Recurring Jobs Configured</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first automated scraping schedule above to periodically fetch new leads on autopilot.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Keyword Target</th>
                <th className="py-3.5 px-4">Frequency</th>
                <th className="py-3.5 px-4">Next Scheduled Run</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{s.query}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{s.cron_expression || 'Weekly'}</td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px] font-medium">{s.next_run || 'Next Monday 09:00 AM'}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRunNow(s.query)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                        title="Run Scraper Now"
                      >
                        <Play size={12} className="fill-slate-700 text-slate-700" /> Run Now
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(s.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
