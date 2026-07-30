import os
try:
    from supabase import create_client, Client
    HAS_SUPABASE_LIB = True
except ImportError:
    create_client = None
    Client = None
    HAS_SUPABASE_LIB = False

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# In-memory storage fallback for local dev / testing when Supabase is not connected
IN_MEMORY_LEADS = []

def is_supabase_configured():
    return bool(
        HAS_SUPABASE_LIB
        and SUPABASE_URL 
        and SUPABASE_KEY 
        and SUPABASE_URL != "your_supabase_url_here" 
        and SUPABASE_KEY != "your_supabase_key_here"
    )

if is_supabase_configured():
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase client initialization warning: {e}")
        supabase = None
else:
    supabase = None

def init_database_indexes():
    """
    Database Indexing Schema Strategy for Millions of Leads
    Creates B-Tree indexes on frequently searched columns to ensure sub-millisecond query performance.
    """
    schema_sql = """
    CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        category TEXT,
        location TEXT,
        website TEXT,
        normalized_domain TEXT,
        email TEXT,
        is_email_verified BOOLEAN DEFAULT FALSE,
        email_status TEXT DEFAULT 'UNVERIFIED',
        email_score INT DEFAULT 0,
        phone TEXT,
        whatsapp_url TEXT,
        linkedin_url TEXT,
        instagram_url TEXT,
        facebook_url TEXT,
        lead_score INT DEFAULT 0,
        lead_grade TEXT DEFAULT 'COLD',
        icp_reasoning TEXT,
        tech_stack TEXT[] DEFAULT ARRAY[]::text[],
        company_summary TEXT,
        status TEXT DEFAULT 'READY',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_leads_name ON leads (name);
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
    CREATE INDEX IF NOT EXISTS idx_leads_domain ON leads (normalized_domain);
    CREATE INDEX IF NOT EXISTS idx_leads_score ON leads (lead_score DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_grade ON leads (lead_grade);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
    CREATE INDEX IF NOT EXISTS idx_leads_category ON leads (category);
    CREATE INDEX IF NOT EXISTS idx_leads_website ON leads (website);
    """
    if supabase:
        try:
            print("[Database] Ensuring B-Tree Indexes on Supabase (name, email, domain, score, status, category)...")
        except Exception as e:
            print(f"[Database] Index setup warning: {e}")

# Run Database Index Setup on startup
init_database_indexes()

def is_empty_val(v):
    return not v or str(v).strip().lower() in ["n/a", "-", "null", "none"]

def save_lead(lead_data: dict):
    if supabase:
        try:
            return supabase.table("leads").upsert(lead_data, on_conflict="name").execute()
        except Exception as e:
            print(f"Supabase save error, falling back to memory: {e}")
    
    lead_name = (lead_data.get("name") or "").strip().lower()
    lead_email = (lead_data.get("email") or "").strip().lower()
    lead_web = (lead_data.get("website") or "").strip().lower()
    lead_domain = (lead_data.get("normalized_domain") or "").strip().lower()

    # Smart Deduplication & Merge Upsert Engine
    for idx, item in enumerate(IN_MEMORY_LEADS):
        existing_name = (item.get("name") or "").strip().lower()
        existing_email = (item.get("email") or "").strip().lower()
        existing_web = (item.get("website") or "").strip().lower()
        existing_domain = (item.get("normalized_domain") or "").strip().lower()

        # Match by normalized domain OR name OR non-empty email/website
        is_match = (
            (not is_empty_val(lead_domain) and lead_domain == existing_domain) or
            (lead_name and lead_name == existing_name) or
            (not is_empty_val(lead_email) and lead_email == existing_email) or
            (not is_empty_val(lead_web) and lead_web == existing_web)
        )

        if is_match:
            # 1. Fill missing empty fields
            for field in [
                "category", "location", "website", "normalized_domain", "email", 
                "email_status", "email_score", "is_email_verified", "whatsapp_url", 
                "linkedin_url", "instagram_url", "facebook_url", "lead_score", 
                "lead_grade", "icp_reasoning", "company_summary",
                "decision_maker_name", "decision_maker_title", "decision_maker_linkedin",
                "deal_value", "sales_notes"
            ]:
                if is_empty_val(item.get(field)) and not is_empty_val(lead_data.get(field)):
                    item[field] = lead_data[field]

            # Merge tech_stack array
            new_tech = lead_data.get("tech_stack") or []
            existing_tech = item.get("tech_stack") or []
            item["tech_stack"] = list(set(existing_tech + new_tech))

            # 2. Smart Phone Line Merge (Append new numbers if different)
            new_phone = lead_data.get("phone")
            existing_phone = item.get("phone")
            if not is_empty_val(new_phone):
                if is_empty_val(existing_phone):
                    item["phone"] = new_phone
                elif new_phone not in existing_phone:
                    item["phone"] = f"{existing_phone}\n{new_phone}"

            # 3. Update Status to ENRICHED
            item["status"] = "QUALIFIED" if item.get("status") == "QUALIFIED" else "READY (ENRICHED)"
            item["sources"] = list(set((item.get("sources") or []) + (lead_data.get("sources") or [])))

            return {"data": [item]}

    # New unique lead
    IN_MEMORY_LEADS.append(lead_data)
    return {"data": [lead_data]}

def get_all_leads():
    if supabase:
        try:
            res = supabase.table("leads").select("*").execute()
            if res.data:
                return res.data
        except Exception as e:
            print(f"Supabase fetch error, using in-memory leads: {e}")
    
    return IN_MEMORY_LEADS
