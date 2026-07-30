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

    # Smart Deduplication & Merge Upsert Engine
    for idx, item in enumerate(IN_MEMORY_LEADS):
        existing_name = (item.get("name") or "").strip().lower()
        existing_email = (item.get("email") or "").strip().lower()
        existing_web = (item.get("website") or "").strip().lower()

        # Match by name OR non-empty email/website
        is_match = (
            (lead_name and lead_name == existing_name) or
            (not is_empty_val(lead_email) and lead_email == existing_email) or
            (not is_empty_val(lead_web) and lead_web == existing_web)
        )

        if is_match:
            # 1. Fill missing empty fields
            for field in ["category", "location", "website", "email", "linkedin_url", "gmaps_url"]:
                if is_empty_val(item.get(field)) and not is_empty_val(lead_data.get(field)):
                    item[field] = lead_data[field]

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
