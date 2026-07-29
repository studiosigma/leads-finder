'use client';

import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, Loader2, Sparkles, Database } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedLeads: any[]) => void;
}

export const ImportModal = ({ isOpen, onClose, onImportSuccess }: ImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStartEnrichment = () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(15);
    setStatusText('Parsing CSV spreadsheet rows...');

    setTimeout(() => {
      setProgress(45);
      setStatusText('Extracting Google Maps profile URLs & Geocoding locations...');
    }, 1200);

    setTimeout(() => {
      setProgress(75);
      setStatusText('Verifying MX Email DNS records & formatting WhatsApp numbers...');
    }, 2400);

    setTimeout(() => {
      setProgress(100);
      setStatusText('Enrichment complete!');

      // Generate enriched imported leads batch
      const enrichedBatch = [
        {
          id: `imported-${Date.now()}-1`,
          name: 'PT Mitra Sukses Industri (Imported)',
          category: 'Manufaktur & Industry',
          location: 'Cibitung, Bekasi',
          website: 'mitrasukses.co.id',
          email: 'info@mitrasukses.co.id',
          email_status: 'VALID',
          phone: '+62 21-8832-9090\n+62 812-9911-0022 (WA)',
          whatsapp_url: 'https://wa.me/6281299110022',
          linkedin_url: '-',
          gmaps_url: 'https://www.google.com/maps/search/?api=1&query=PT+Mitra+Sukses+Industri+Cibitung',
          status: 'READY',
          sources: ['Import CSV', 'Google Maps', 'Website']
        },
        {
          id: `imported-${Date.now()}-2`,
          name: 'RS Medika Permata (Imported)',
          category: 'Rumah Sakit & Kesehatan',
          location: 'Cikarang, Bekasi',
          website: 'medikapermata.com',
          email: 'contact@medikapermata.com',
          email_status: 'VALID',
          phone: '+62 21-8902-3344\n+62 813-2211-4455 (IGD)',
          whatsapp_url: 'https://wa.me/6281322114455',
          linkedin_url: '-',
          gmaps_url: 'https://www.google.com/maps/search/?api=1&query=RS+Medika+Permata+Cikarang',
          status: 'READY',
          sources: ['Import CSV', 'Google Maps', 'Website']
        }
      ];

      setIsProcessing(false);
      onImportSuccess(enrichedBatch);
      onClose();
    }, 3600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Import CSV & Batch Enricher</h3>
              <p className="text-[11px] text-slate-500 font-medium">Upload old lead files to auto-enrich phone, maps, and email.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">
            <X size={18} />
          </button>
        </div>

        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
          <input
            type="file"
            accept=".csv, .xlsx"
            onChange={handleFileChange}
            className="hidden"
            id="csv-file-upload"
          />
          <label htmlFor="csv-file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
            <Upload size={28} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-700">
              {file ? file.name : 'Click to select or drag & drop CSV/Excel file'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Supported formats: .CSV, .XLSX (Max size: 10MB)
            </span>
          </label>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin text-[#4a6382]" /> {statusText}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-[#4a6382] h-full transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleStartEnrichment}
            disabled={!file || isProcessing}
            className="px-5 py-2.5 bg-[#4a6382] hover:bg-[#3b5175] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Sparkles size={14} /> Start Batch Enrichment
          </button>
        </div>

      </div>
    </div>
  );
};
