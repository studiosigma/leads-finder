-- SQL DDL Schema for Leads Finder Engine (Supabase / PostgreSQL)

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Business',
    location TEXT DEFAULT 'Indonesia',
    website TEXT DEFAULT 'N/A',
    email TEXT DEFAULT 'N/A',
    phone TEXT DEFAULT 'N/A',
    status TEXT DEFAULT 'FOLLOW UP',
    sources TEXT[] DEFAULT ARRAY['Scraper'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indeks untuk pencarian dan filter cepat
CREATE INDEX IF NOT EXISTS idx_leads_name ON public.leads(name);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_category ON public.leads(category);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS (Public read/write policy)
CREATE POLICY "Allow public read access" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.leads FOR UPDATE USING (true);
