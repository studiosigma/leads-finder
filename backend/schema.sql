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
    normalized_domain TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_status TEXT DEFAULT 'UNVERIFIED',
    email_score INT DEFAULT 0,
    whatsapp_url TEXT,
    linkedin_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    lead_score INT DEFAULT 0,
    lead_grade TEXT DEFAULT 'COLD',
    icp_reasoning TEXT,
    tech_stack TEXT[] DEFAULT ARRAY[]::text[],
    company_summary TEXT,
    decision_maker_name TEXT,
    decision_maker_title TEXT,
    decision_maker_linkedin TEXT,
    deal_value BIGINT DEFAULT 0,
    sales_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indeks untuk pencarian dan filter cepat
CREATE INDEX IF NOT EXISTS idx_leads_name ON public.leads(name);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_category ON public.leads(category);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_domain ON public.leads(normalized_domain);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_grade ON public.leads(lead_grade);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS (Public read/write policy)
CREATE POLICY "Allow public read access" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.leads FOR UPDATE USING (true);
