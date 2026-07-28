import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# In-memory storage fallback for local dev / testing when Supabase is not connected
IN_MEMORY_LEADS = []

def is_supabase_configured():
    return bool(
        SUPABASE_URL 
        and SUPABASE_KEY 
        and SUPABASE_URL != "your_supabase_url_here" 
        and SUPABASE_KEY != "your_supabase_key_here"
    )

if is_supabase_configured():
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase client initialization warning: {e}")
        supabase = None
else:
    supabase = None

def save_lead(lead_data: dict):
    if supabase:
        try:
            return supabase.table("leads").insert(lead_data).execute()
        except Exception as e:
            print(f"Supabase save error, falling back to memory: {e}")
    
    # Check if lead already exists in memory by ID or name
    for idx, item in enumerate(IN_MEMORY_LEADS):
        if item.get("name", "").lower() == lead_data.get("name", "").lower():
            IN_MEMORY_LEADS[idx].update(lead_data)
            return {"data": [IN_MEMORY_LEADS[idx]]}

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

