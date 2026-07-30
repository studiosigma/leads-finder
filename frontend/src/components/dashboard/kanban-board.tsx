'use client';

import React, { useState } from 'react';
import { DollarSign, MessageSquare, Sparkles, MapPin, Globe, ChevronRight, ChevronLeft, Check, Edit2, ShieldCheck, Flame, Zap, Snowflake } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  category: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  lead_grade?: string;
  lead_score?: number;
  decision_maker_name?: string;
  decision_maker_title?: string;
  status: string;
  deal_value?: number;
  sales_notes?: string;
}

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange?: (id: string, newStatus: string) => void;
  onOpenAiPitchModal?: (lead: Lead) => void;
}

export const KanbanBoard = ({ leads, onStatusChange, onOpenAiPitchModal }: KanbanBoardProps) => {
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [dealValueInput, setDealValueInput] = useState<string>('');
  const [salesNotesInput, setSalesNotesInput] = useState<string>('');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const stages = [
    { id: 'READY', label: 'New Prospect', color: 'border-blue-300 bg-blue-50/50 text-blue-900', badge: 'bg-blue-100 text-blue-800' },
    { id: 'CONTACTED', label: 'Contacted', color: 'border-amber-300 bg-amber-50/50 text-amber-900', badge: 'bg-amber-100 text-amber-800' },
    { id: 'QUALIFIED', label: 'Qualified', color: 'border-purple-300 bg-purple-50/50 text-purple-900', badge: 'bg-purple-100 text-purple-800' },
    { id: 'PROPOSAL', label: 'Proposal Sent', color: 'border-orange-300 bg-orange-50/50 text-orange-900', badge: 'bg-orange-100 text-orange-800' },
    { id: 'WON', label: 'Closed Won', color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900', badge: 'bg-emerald-100 text-emerald-800' },
    { id: 'LOST', label: 'Closed Lost', color: 'border-red-300 bg-red-50/50 text-red-900', badge: 'bg-red-100 text-red-800' },
  ];

  const formatIDR = (amount?: number) => {
    if (!amount || amount <= 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleSaveDealDetails = async (leadId: string) => {
    const numericVal = parseInt(dealValueInput.replace(/[^\d]/g, ''), 10) || 0;
    
    // Update local state optimistic
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      lead.deal_value = numericVal;
      lead.sales_notes = salesNotesInput;
    }

    setEditingDealId(null);

    try {
      await fetch(`${API_BASE}/api/v1/lead/${leadId}/deal`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_value: numericVal, sales_notes: salesNotesInput })
      });
    } catch (err) {
      console.error('Failed to persist deal details:', err);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4 font-sans">
      <div className="flex gap-4 min-w-[1400px]">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => (l.status || 'READY').toUpperCase() === stage.id);
          const stageTotalValue = stageLeads.reduce((acc, l) => acc + (l.deal_value || 0), 0);

          return (
            <div key={stage.id} className="flex-1 min-w-[280px] bg-slate-100/80 rounded-2xl p-3.5 border border-slate-200/90 space-y-3 flex flex-col">
              
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${stage.badge}`}>
                    {stageLeads.length}
                  </span>
                  <h3 className="text-xs font-bold text-slate-800">{stage.label}</h3>
                </div>
                <span className="text-[11px] font-extrabold text-slate-600 font-mono">
                  {formatIDR(stageTotalValue)}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[72vh] pr-0.5">
                {stageLeads.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-slate-400 font-medium border border-dashed border-slate-300 rounded-xl">
                    No leads in {stage.label}
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div key={lead.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-all group">
                      
                      {/* Card Header & Lead Grade */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {lead.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium truncate max-w-[170px] mt-0.5">
                            {lead.category || 'Business'} • {lead.location?.split(',')[0]}
                          </p>
                        </div>

                        {/* Grade Badge */}
                        {lead.lead_grade === 'HOT' ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Flame size={10} /> HOT
                          </span>
                        ) : lead.lead_grade === 'WARM' ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Zap size={10} /> WARM
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            COLD
                          </span>
                        )}
                      </div>

                      {/* Executive Contact Badge */}
                      {lead.decision_maker_name && (
                        <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] flex items-center justify-between">
                          <span className="font-bold text-slate-800 truncate">
                            👤 {lead.decision_maker_name}
                          </span>
                          <span className="text-[9px] font-bold text-[#4a6382] bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                            {lead.decision_maker_title || 'Owner'}
                          </span>
                        </div>
                      )}

                      {/* Deal Value & Sales Notes */}
                      {editingDealId === lead.id ? (
                        <div className="space-y-2 pt-1 border-t border-slate-100">
                          <input
                            type="text"
                            placeholder="Deal Value (e.g. 15000000)"
                            value={dealValueInput}
                            onChange={(e) => setDealValueInput(e.target.value)}
                            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Sales Notes (e.g. Dikirim via WA)"
                            value={salesNotesInput}
                            onChange={(e) => setSalesNotesInput(e.target.value)}
                            className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-sans"
                          />
                          <button
                            onClick={() => handleSaveDealDetails(lead.id)}
                            className="w-full py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Check size={12} /> Save Deal Info
                          </button>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <DollarSign size={13} className="text-emerald-600" />
                            <span className="font-mono font-bold text-slate-800">
                              {lead.deal_value ? formatIDR(lead.deal_value) : 'Set Value'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setEditingDealId(lead.id);
                              setDealValueInput(lead.deal_value ? String(lead.deal_value) : '');
                              setSalesNotesInput(lead.sales_notes || '');
                            }}
                            className="text-slate-400 hover:text-slate-700 p-1"
                            title="Edit Deal Value & Notes"
                          >
                            <Edit2 size={11} />
                          </button>
                        </div>
                      )}

                      {/* Card Action Controls & Stage Move Buttons */}
                      <div className="pt-2 flex items-center justify-between gap-1">
                        {onOpenAiPitchModal && (
                          <button
                            onClick={() => onOpenAiPitchModal(lead)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="Generate AI Outreach"
                          >
                            <Sparkles size={10} className="fill-amber-600 text-amber-600" /> Pitch
                          </button>
                        )}

                        <div className="flex items-center gap-1 ml-auto">
                          {/* Stage Dropdown Move */}
                          <select
                            value={stage.id}
                            onChange={(e) => onStatusChange && onStatusChange(lead.id, e.target.value)}
                            className="text-[10px] font-bold px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
                          >
                            {stages.map((s) => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
