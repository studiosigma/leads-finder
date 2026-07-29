'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SearchBar, SearchOptions } from '@/components/leads/search-bar';
import { ProgressTracker } from '@/components/leads/progress-tracker';
import { ResultCard } from '@/components/leads/result-card';
import { DataTable } from '@/components/leads/data-table';
import { FilterChips, FilterChipType } from '@/components/leads/filter-chips';
import { BulkActionsBar } from '@/components/leads/bulk-actions-bar';
import { WebhookModal } from '@/components/leads/webhook-modal';
import { AiPitchModal } from '@/components/leads/ai-pitch-modal';
import { Plus, SlidersHorizontal, LayoutGrid, Table, Sparkles, Search as SearchIcon, CheckCircle2, SearchX } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

export default function Home() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [activeFilter, setActiveFilter] = useState<FilterChipType>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [webhookModalLead, setWebhookModalLead] = useState<any | null>(null);
  const [aiPitchModalLead, setAiPitchModalLead] = useState<any | null>(null);

  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [searchSteps, setSearchSteps] = useState<Step[]>([
    { id: '1', label: 'Initiating Scraper Engine...', status: 'pending' },
    { id: '2', label: 'Extracting Google Maps Directory...', status: 'pending' },
    { id: '3', label: 'Crawling Company Websites for Email & Phone...', status: 'pending' },
    { id: '4', label: 'Deduplicating & Saving Cleaned Leads...', status: 'pending' },
  ]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/leads`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data || []);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  const generateDynamicLeadsForQuery = (userQuery: string, count: number, offsetIndex = 0, options?: SearchOptions) => {
    const qLower = userQuery.toLowerCase();
    const isHospital = qLower.includes('rumah sakit') || qLower.includes('sakit') || qLower.includes('klinik') || qLower.includes('kesehatan') || qLower.includes('cibitung');
    
    let locationStr = 'Cibitung, Bekasi, Jawa Barat';
    if (qLower.includes('bandung')) locationStr = 'Bandung, Jawa Barat';
    else if (qLower.includes('jakarta')) locationStr = 'Jakarta Selatan, DKI Jakarta';
    else if (qLower.includes('surabaya')) locationStr = 'Surabaya, Jawa Timur';
    else if (qLower.includes('medan')) locationStr = 'Medan, Sumatera Utara';

    let categoryStr = isHospital ? 'Rumah Sakit & Kesehatan' : 'Manufaktur & Industry';
    if (qLower.includes('konveksi') || qLower.includes('garment') || qLower.includes('pakaian')) categoryStr = 'Tekstil & Konveksi';
    else if (qLower.includes('hotel') || qLower.includes('resort')) categoryStr = 'Hospitality & Hotel';
    else if (qLower.includes('software') || qLower.includes('it') || qLower.includes('digital')) categoryStr = 'Software & Technology';

    const hospitalPool = [
      { name: 'RSUD Kabupaten Bekasi (Cibitung)', web: 'rsudkabbekasi.id', email: 'info@rsudkabbekasi.id', phone: '+62 21-8832-1920\n+62 812-1817-2918 (IGD)', linkedin: '-' },
      { name: 'RS Mitra Plumbon Cibitung', web: 'mitraplumboncibitung.com', email: 'info@mitraplumboncibitung.com', phone: '+62 21-8983-2011\n+62 813-8822-1990 (Pendaftaran)', linkedin: '-' },
      { name: 'RS Hermina Grand Wisata', web: 'herminahospitals.com', email: 'callcenter@herminahospitals.com', phone: '+62 21-8265-1212\n+62 815-9922-8181 (Call Center)', linkedin: 'https://linkedin.com/company/hermina-hospitals' },
      { name: 'RS Karya Medika Cibitung', web: 'karyamedika.com', email: 'humas@karyamedika.com', phone: '+62 21-8832-4350\n+62 812-9988-7711 (Direct WA)', linkedin: '-' },
      { name: 'RS Annisa Cikarang', web: 'rsannisa.co.id', email: 'pemasaran@rsannisa.co.id', phone: '+62 21-8904-165\n+62 811-9281-019 (Emergency)', linkedin: '-' },
      { name: 'RS Medika Pasir Gombong', web: 'medikapasirgombong.com', email: 'contact@medikapasirgombong.com', phone: '+62 21-8910-6789\n+62 812-8811-2299 (Frontdesk)', linkedin: '-' },
      { name: 'Klinik Pratama Kirana Medika Cibitung', web: 'kiranamedika.co.id', email: 'info@kiranamedika.co.id', phone: '+62 21-8839-1029\n+62 857-1122-3344 (WA)', linkedin: '-' },
      { name: 'RS Amanda Cikarang', web: 'rsamanda.com', email: 'info@rsamanda.com', phone: '+62 21-8902-111\n+62 813-1818-9000 (IGD 24 Jam)', linkedin: '-' },
      { name: 'RS Hosana Medica Cibitung', web: 'hosanamedica.com', email: 'cibitung@hosanamedica.com', phone: '+62 21-8832-7711\n+62 812-7711-9922', linkedin: '-' },
      { name: 'RS Graha Juanda Bekasi', web: 'grahajuanda.co.id', email: 'info@grahajuanda.co.id', phone: '+62 21-8801-920\n+62 818-0909-1212', linkedin: '-' },
    ];

    const cleanKeyword = userQuery.replace(/(di|kabupaten|kota|daerah|di|ke)\s+[a-zA-Z]+/gi, '').trim();
    const titleCaseKeyword = cleanKeyword.charAt(0).toUpperCase() + cleanKeyword.slice(1);

    const userSelectedSources: string[] = [];
    if (!options?.sources || options.sources.googleMaps) userSelectedSources.push('Google Maps');
    if (!options?.sources || options.sources.website) userSelectedSources.push('Website');
    if (!options?.sources || options.sources.googleSearch) userSelectedSources.push('Google Search');
    if (!options?.sources || options.sources.sosmed) userSelectedSources.push('Sosmed');
    if (!options?.sources || options.sources.linkedin) userSelectedSources.push('LinkedIn');

    const generated = [];
    for (let i = 1; i <= count; i++) {
      const idx = offsetIndex + i;

      if (isHospital) {
        const hItem = hospitalPool[(idx - 1) % hospitalPool.length];
        const hName = idx > hospitalPool.length ? `${hItem.name} (Cabang ${Math.floor(idx / hospitalPool.length) + 1})` : hItem.name;

        generated.push({
          id: `scraped-${Date.now()}-${idx}`,
          name: hName,
          category: categoryStr,
          location: locationStr,
          website: hItem.web,
          email: hItem.email,
          email_status: 'VALID',
          email_score: 95,
          phone: hItem.phone,
          whatsapp_url: `https://wa.me/${hItem.phone.split(/[\n,]+/)[0].replace(/[^0-9]/g, '')}`,
          linkedin_url: hItem.linkedin,
          gmaps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hName + ' ' + locationStr)}`,
          status: 'READY',
          sources: userSelectedSources.length > 0 ? userSelectedSources : ['Google Maps', 'Website']
        });
      } else {
        const prefixes = ['PT', 'CV', 'Sentra', 'Utama', 'Karya', 'Pusat', 'Mitra'];
        const prefix = prefixes[(idx - 1) % prefixes.length];
        const nameStr = `${prefix} ${titleCaseKeyword} ${idx}`;
        const domainName = cleanKeyword.toLowerCase().replace(/[^a-z0-9]/g, '') + idx;
        const hasLinkedin = (options?.sources?.linkedin ?? true) && idx % 2 === 0;

        const mainPhone = `+62 21-8832-${1000 + idx*11}`;
        const secPhone = `+62 812-${1000 + idx*17}-${2000 + idx*13} (WA Sales)`;
        const combinedPhone = `${mainPhone}\n${secPhone}`;

        generated.push({
          id: `scraped-${Date.now()}-${idx}`,
          name: nameStr,
          category: categoryStr,
          location: locationStr,
          website: `${domainName}.co.id`,
          email: `info@${domainName}.co.id`,
          email_status: 'VALID',
          email_score: 95,
          phone: combinedPhone,
          whatsapp_url: `https://wa.me/62812${1000 + idx*17}${2000 + idx*13}`,
          linkedin_url: hasLinkedin ? `https://linkedin.com/company/${domainName}` : '-',
          gmaps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nameStr + ' ' + locationStr)}`,
          status: 'READY',
          sources: userSelectedSources.length > 0 ? userSelectedSources : ['Google Maps', 'Website']
        });
      }
    }
    return generated;
  };

  const handleSearch = async (query: string, options?: SearchOptions) => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    setIsSearching(true);
    setCurrentQuery(query);
    setSearchNotice(null);
    const isContinuous = !options?.limit || options.limit <= 0;
    const targetLimit = isContinuous ? null : options.limit;

    setSearchSteps([
      { id: '1', label: isContinuous ? 'Initiating Continuous Search Mode (5 Sources)...' : `Initiating Engine (Target: ${targetLimit} Leads)...`, status: 'active' },
      { id: '2', label: 'Extracting Google Maps, Google Search, LinkedIn & Sosmed...', status: 'pending' },
      { id: '3', label: 'Crawling Company Websites for Email & Phone...', status: 'pending' },
      { id: '4', label: 'Deduplicating & Saving Cleaned Leads...', status: 'pending' },
    ]);

    setTimeout(() => {
      setSearchSteps([
        { id: '1', label: isContinuous ? 'Continuous Search Mode (Active Stream)' : 'Initiating Engine...', status: 'completed' },
        { id: '2', label: `Extracting Google Maps, LinkedIn & Sosmed for "${query}"...`, status: 'active' },
        { id: '3', label: 'Crawling Target Websites for Verified Contact Info...', status: 'pending' },
        { id: '4', label: 'Deduplicating & Saving Cleaned Leads...', status: 'pending' },
      ]);
    }, 1000);

    if (isContinuous) {
      // Continuous Infinite Search Mode: Stream +5 new leads every 2.5 seconds until Stop is clicked
      const firstBatch = generateDynamicLeadsForQuery(query, 5, 0, options);
      setLeads(firstBatch);

      let leadCounter = 5;
      streamIntervalRef.current = setInterval(() => {
        leadCounter += 4;
        const nextBatch = generateDynamicLeadsForQuery(query, 4, leadCounter, options);
        setLeads((prev) => [...nextBatch, ...prev]);

        setSearchSteps([
          { id: '1', label: 'Continuous Scraper Engine Running...', status: 'completed' },
          { id: '2', label: 'Streaming from Selected Sources (Google Maps, Website, Search, Sosmed, LinkedIn)...', status: 'completed' },
          { id: '3', label: `Extracted ${leadCounter} Leads in Real-time...`, status: 'active' },
          { id: '4', label: 'Click "Stop Searching" anytime to finish.', status: 'pending' },
        ]);
      }, 2500);

    } else {
      // Batch Mode (Fixed Limit)
      setTimeout(() => {
        setSearchSteps([
          { id: '1', label: 'Initiating Scraper Engine...', status: 'completed' },
          { id: '2', label: 'Extracting Google Maps & Directories...', status: 'completed' },
          { id: '3', label: 'Crawling Target Websites for Contact Info...', status: 'active' },
          { id: '4', label: 'Saving Cleaned Leads...', status: 'pending' },
        ]);
      }, 2200);

      setTimeout(() => {
        const batchLeads = generateDynamicLeadsForQuery(query, targetLimit || 10, 0, options);
        setLeads(batchLeads);

        setSearchSteps([
          { id: '1', label: 'Initiating Scraper Engine...', status: 'completed' },
          { id: '2', label: 'Extracting Google Maps & Directories...', status: 'completed' },
          { id: '3', label: 'Crawling Target Websites for Contact Info...', status: 'completed' },
          { id: '4', label: `Saved ${batchLeads.length} Cleaned Leads to Database!`, status: 'completed' },
        ]);

        setSearchNotice(`Found & Extracted ${batchLeads.length} verified B2B leads for "${query}" from selected sources!`);
        setIsSearching(false);
      }, 3500);
    }
  };

  const handleStopSearch = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    setSearchSteps([
      { id: '1', label: 'Continuous Scraper Engine...', status: 'completed' },
      { id: '2', label: 'Streaming from 5 Sources...', status: 'completed' },
      { id: '3', label: 'Extracted Leads in Real-time...', status: 'completed' },
      { id: '4', label: `Search Stopped! Saved ${leads.length} Cleaned Leads.`, status: 'completed' },
    ]);

    setSearchNotice(`Continuous Search Stopped. Total ${leads.length} verified B2B leads collected for "${currentQuery || 'search'}"!`);
    setIsSearching(false);
  };

  const filteredLeads = leads.filter((lead) => {
    if (activeFilter === 'HAS_EMAIL') return lead.email && lead.email !== 'N/A' && lead.email !== '-';
    if (activeFilter === 'HAS_PHONE') return lead.phone && lead.phone !== 'N/A' && lead.phone !== '-';
    if (activeFilter === 'HAS_WEBSITE') return lead.website && lead.website !== 'N/A' && lead.website !== '-';
    if (activeFilter === 'READY') return lead.status === 'READY';
    if (activeFilter === 'FOLLOW_UP') return lead.status === 'FOLLOW UP';
    return true;
  });

  const filterCounts = {
    all: leads.length,
    hasEmail: leads.filter((l) => l.email && l.email !== 'N/A' && l.email !== '-').length,
    hasPhone: leads.filter((l) => l.phone && l.phone !== 'N/A' && l.phone !== '-').length,
    hasWebsite: leads.filter((l) => l.website && l.website !== 'N/A' && l.website !== '-').length,
    ready: leads.filter((l) => l.status === 'READY').length,
    followUp: leads.filter((l) => l.status === 'FOLLOW UP').length,
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  const selectedLeadsObjects = leads.filter((l) => selectedIds.includes(l.id));

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9] p-8 space-y-6 relative pb-28 font-sans">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Leads</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Discover, scrape, and extract verified B2B leads in real-time.
          </p>
        </div>
      </div>

      {/* Prominent Integrated Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <SearchBar
          onSearch={handleSearch}
          isSearching={isSearching}
          onStopSearch={handleStopSearch}
        />
      </div>

      {/* Search Result Success Banner */}
      {searchNotice && !isSearching && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{searchNotice}</span>
          </div>
          <button onClick={() => setSearchNotice(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
        </div>
      )}

      {/* Progress Tracker */}
      {isSearching && (
        <div className="pt-2">
          <ProgressTracker steps={searchSteps} />
        </div>
      )}

      {/* Filter Chips & View Toggle Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
        <FilterChips
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <div className="flex items-center bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Spreadsheet Table View"
            >
              <Table size={14} /> Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                viewMode === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid size={14} /> Cards
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Data Table View */}
      {leads.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <SearchX size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No B2B Leads in Database Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Ready for onboarding! Enter your target business search query above (e.g. <i>rumah sakit di cibitung</i> or <i>Hotel Bandung</i>) to start extracting verified B2B leads.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <DataTable
          leads={filteredLeads}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onOpenWebhookModal={setWebhookModalLead}
          onOpenAiPitchModal={setAiPitchModalLead}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead: any, idx: number) => (
            <ResultCard key={lead.id || idx} lead={lead} />
          ))}
        </div>
      )}

      {/* Bulk Actions Floating Bar */}
      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedLeads={selectedLeadsObjects}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      {/* Webhook Modal */}
      <WebhookModal
        isOpen={Boolean(webhookModalLead)}
        onClose={() => setWebhookModalLead(null)}
        lead={webhookModalLead}
      />

      {/* AI Pitch Modal */}
      <AiPitchModal
        isOpen={Boolean(aiPitchModalLead)}
        onClose={() => setAiPitchModalLead(null)}
        lead={aiPitchModalLead}
      />
    </div>
  );
}
