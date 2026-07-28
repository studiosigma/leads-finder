'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Play, CheckCircle2 } from 'lucide-react';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [cron, setCron] = useState('0 9 * * 1'); // Every Monday at 9am

  const fetchSchedules = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/schedules');
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
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
    try {
      const res = await fetch('http://localhost:8000/api/v1/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), cron_expression: cron }),
      });
      if (res.ok) {
        setQuery('');
        fetchSchedules();
      }
    } catch (err) {
      console.error('Error creating schedule:', err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/schedule/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchSchedules();
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
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
            <option value="0 9 * * 1">Every Monday at 09:00 AM</option>
            <option value="0 9 * * *">Every Day at 09:00 AM</option>
            <option value="0 9 1 * *">First Day of Every Month</option>
          </select>
          <button
            onClick={handleCreateSchedule}
            className="px-4 py-2.5 bg-[#4a6382] hover:bg-[#3b5175] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={16} /> Add Job
          </button>
        </div>
      </div>

      {/* Active Schedules Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 font-bold text-xs text-slate-700">
          Active Scheduled Jobs ({schedules.length})
        </div>
        {schedules.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">
            No recurring scraping jobs configured yet.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Keyword Target</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{s.query}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{s.cron_expression || 'Weekly'}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 size={10} /> Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteSchedule(s.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 size={14} />
                    </button>
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
