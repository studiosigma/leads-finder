import React from 'react';
import { Loader2, CheckCircle2, Clock, Sparkles, Database } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

interface ProgressTrackerProps {
  steps: Step[];
  leadCount?: number;
}

/**
 * ProgressTracker Component
 * Visualizes real-time scraping progress with Live Leads Counter and animated step status.
 */
export const ProgressTracker = ({ steps, leadCount = 0 }: ProgressTrackerProps) => {
  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const progressPct = Math.round((completedSteps / steps.length) * 100) || 15;

  return (
    <div className="w-full bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 font-sans animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
            <Loader2 size={18} className="animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <span>Mengumpulkan Prospek Bisnis...</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono animate-pulse">
                {leadCount} leads ditemukan sejauh ini
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Geocoding Google Maps, MX Email Verification & Phone Line Classification active.
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-bold text-slate-700 font-mono self-end sm:self-auto">
          {progressPct}% Complete
        </div>
      </div>

      {/* Animated Dynamic Progress Bar */}
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
        <div
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Step Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs transition-all ${
              step.status === 'completed'
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-semibold'
                : step.status === 'active'
                ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-bold shadow-xs'
                : 'bg-slate-50/50 border-slate-200/60 text-slate-400'
            }`}
          >
            {step.status === 'completed' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : step.status === 'active' ? (
              <Loader2 size={16} className="text-blue-600 animate-spin shrink-0 mt-0.5" />
            ) : (
              <Clock size={16} className="text-slate-300 shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
