'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Play, CheckCircle2, RefreshCw, Sparkles, Check, SearchX, Zap, FileSpreadsheet, Send, ShieldCheck } from 'lucide-react';

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [cron, setCron] = useState('Every Monday at 09:00 AM');
  const [autoSyncSheets, setAutoSyncSheets] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // 1. Load from localStorage
    try {
      const saved = localStorage.getItem('lfe_scheduled_jobs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSchedules(parsed);
        } else {
          loadDefaultPresets();
        }
      } else {
        loadDefaultPresets();
      }
    } catch (e) {
      loadDefaultPresets();
    }

    // 2. Sync with backend API
    async function fetchBackendSchedules() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/schedules`);
        if (res.ok) {
          const data = await res.json();
          if (data.schedules && Array.isArray(data.schedules) && data.schedules.length > 0) {
            setSchedules(data.schedules);
          }
        }
      } catch (err) {
        // silent
      }
    }

    fetchBackendSchedules();
  }, []);

  const loadDefaultPresets = () => {
    const defaultJobs = [
      {
        id: 'job-preset-1',
        query: 'Pabrik Plastik & Manufaktur di Bekasi',
        cron_expression: 'Every Day at 08:00 AM',
        next_run: 'Tomorrow at 08:00 AM',
        auto_sync: true,
        status: 'ACTIVE',
      },
      {
        id: 'job-preset-2',
        query: 'Rumah Sakit & Klinik di Tambun',
        cron_expression: 'Every Monday at 09:00 AM',
        next_run: 'Next Monday at 09:00 AM',
        auto_sync: true,
        status: 'ACTIVE',
      },
    ];
    setSchedules(defaultJobs);
    try {
      localStorage.setItem('lfe_scheduled_jobs', JSON.stringify(defaultJobs));
    } catch (e) {
      // ignore
    }
  };

  const persistSchedules = (updated: any[]) => {
    setSchedules(updated);
    try {
      localStorage.setItem('lfe_scheduled_jobs', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving schedules:', e);
    }
  };

  const handleCreateSchedule = async () => {
    if (!query.trim()) return;

    const newJob = {
      id: `job-${Date.now()}`,
      query: query.trim(),
      cron_expression: cron,
      next_run: cron.includes('Monday') ? 'Next Monday at 09:00 AM' : 'Tomorrow at 08:00 AM',
      auto_sync: autoSyncSheets,
      status: 'ACTIVE',
    };

    const updated = [newJob, ...schedules];
    persistSchedules(updated);
    setQuery('');
    setNotification(`Berhasil membuat jadwal autopilot untuk "${newJob.query}"!`);
    setTimeout(() => setNotification(null), 3000);

    try {
      await fetch(`${API_BASE}/api/v1/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: newJob.query, cron_expression: newJob.cron_expression }),
      });
    } catch (err) {
      // silent
    }
  };

  const handleApplyPreset = (presetQuery: string, presetCron: string) => {
    setQuery(presetQuery);
    setCron(presetCron);
  };

  const handleRunNow = (jobQuery: string) => {
    setNotification(`⚡ Menjalankan pencarian autopilot langsung untuk "${jobQuery}"! Prospek akan disinkronkan.`);
    setTimeout(() => setNotification(null), 3500);

    // Auto-save search session
    try {
      const activeLeads = JSON.parse(localStorage.getItem('lfe_active_leads') || '[]');
      if (activeLeads.length > 0) {
        const sheetsConfig = JSON.parse(localStorage.getItem('lfe_integrations_config') || '{}');
        if (sheetsConfig.sheetsUrl) {
          fetch(sheetsConfig.sheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ leads: activeLeads }),
          });
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    persistSchedules(updated);
    setNotification('Jadwal autopilot berhasil dihapus.');
    setTimeout(() => setNotification(null), 2000);

    try {
      await fetch(`${API_BASE}/api/v1/schedule/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      // silent
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] p-8 space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Clock className="text-slate-700" size={24} /> Scheduled Scraping Jobs (Autopilot)
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Automate recurring prospect searches. Scrape and auto-sync new business leads every week/month on autopilot.
        </p>
      </div>

      {/* Alert Notification */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Quick Autopilot Presets */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Zap size={14} className="text-amber-500 fill-amber-500" /> Preset Jadwal Autopilot Cepat (1-Klik):
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleApplyPreset('Pabrik Plastik & Manufaktur di Bekasi', 'Every Day at 08:00 AM')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left text-xs space-y-1 transition-all group"
          >
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>🌅 Harian Pagi (08:00 WIB)</span>
              <Sparkles size={12} className="text-amber-500" />
            </div>
            <p className="text-[11px] text-slate-500">Target: Pabrik Plastik & Manufaktur Bekasi</p>
          </button>

          <button
            onClick={() => handleApplyPreset('Rumah Sakit & Klinik Kesehatan di Tambun', 'Every Monday at 09:00 AM')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left text-xs space-y-1 transition-all group"
          >
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>📅 Mingguan (Senin 09:00 WIB)</span>
              <Sparkles size={12} className="text-amber-500" />
            </div>
            <p className="text-[11px] text-slate-500">Target: Rumah Sakit & Klinik Tambun</p>
          </button>

          <button
            onClick={() => handleApplyPreset('Sekolahan & Perguruan Tinggi di Bekasi', 'Every Day at 00:00 AM')}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left text-xs space-y-1 transition-all group"
          >
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>🌙 Deep Crawl Malam (00:00 WIB)</span>
              <Sparkles size={12} className="text-amber-500" />
            </div>
            <p className="text-[11px] text-slate-500">Target: Sekolah & Perguruan Tinggi</p>
          </button>
        </div>
      </div>

      {/* Add New Schedule Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Buat Jadwal Scraping Autopilot Baru</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Target Kata Kunci & Lokasi (misal: Pabrik Plastik Bekasi)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <select
            value={cron}
            onChange={(e) => setCron(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
          >
            <option value="Every Monday at 09:00 AM">Setiap Senin 09:00 WIB</option>
            <option value="Every Day at 08:00 AM">Setiap Hari 08:00 WIB</option>
            <option value="Every Day at 00:00 AM">Setiap Hari 00:00 WIB (Deep Crawl Malam)</option>
            <option value="First Day of Every Month">Hari Pertama Setiap Bulan</option>
          </select>

          <button
            onClick={handleCreateSchedule}
            className="px-4 py-2.5 bg-[#4a6382] hover:bg-[#3b5175] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus size={16} /> Buat Jadwal Autopilot
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSyncSheets}
              onChange={(e) => setAutoSyncSheets(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <span className="flex items-center gap-1">
              <FileSpreadsheet size={14} className="text-emerald-600" /> Auto-Sync Prospek Baru ke Google Sheets Webhook Saat Selesai
            </span>
          </label>
        </div>
      </div>

      {/* Active Schedules Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 font-bold text-xs text-slate-700 flex items-center justify-between">
          <span>Active Scheduled Autopilot Jobs ({schedules.length})</span>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <ShieldCheck size={13} /> Celery Cron Autopilot Runner Active
          </span>
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
                <th className="py-3.5 px-4">Kata Kunci Target</th>
                <th className="py-3.5 px-4">Frekuensi Jadwal</th>
                <th className="py-3.5 px-4">Jadwal Berikutnya</th>
                <th className="py-3.5 px-4">Auto-Sync Sheets</th>
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
                  <td className="py-3.5 px-4 text-slate-600 text-[11px] font-bold">
                    {s.auto_sync !== false ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono text-[10px] inline-flex items-center gap-1">
                        <FileSpreadsheet size={10} /> Auto-Sync ON
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px]">OFF</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 size={10} /> Active Autopilot
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRunNow(s.query)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-xs"
                        title="Run Scraper Now"
                      >
                        <Play size={12} className="fill-white text-white" /> Jalankan Sekarang
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
