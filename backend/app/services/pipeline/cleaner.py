from urllib.parse import urlparse
import re
import uuid
from app.services.pipeline.email_verifier import EmailVerifier
from app.services.pipeline.tech_detector import TechDetector
from app.services.pipeline.lead_scorer import LeadScorer

class DataCleaner:
    def __init__(self):
        self.verifier = EmailVerifier()
        self.tech_detector = TechDetector()
        self.scorer = LeadScorer()

    def normalize_domain(self, url: str) -> str:
        """
        Extracts clean root domain FQDN from a raw URL.
        e.g. "https://www.example.co.id/about-us?lang=id" -> "example.co.id"
        """
        if not url or url == 'N/A' or url == '-':
            return 'N/A'
        
        raw = url.strip()
        if not raw.startswith(('http://', 'https://')):
            raw = 'http://' + raw
            
        try:
            parsed = urlparse(raw)
            host = parsed.netloc.split(':')[0].lower()
            if host.startswith('www.'):
                host = host[4:]
            return host if host else 'N/A'
        except Exception:
            return 'N/A'

    def normalize_phone(self, raw_phone: str):
        if not raw_phone or raw_phone == 'N/A':
            return 'N/A'
        
        # Remove non-digit characters except +
        cleaned = re.sub(r'[^\d+]', '', raw_phone)
        if not cleaned:
            return 'N/A'

        if cleaned.startswith('08'):
            cleaned = '+628' + cleaned[2:]
        elif cleaned.startswith('628'):
            cleaned = '+' + cleaned
        elif cleaned.startswith('8') and len(cleaned) >= 9:
            cleaned = '+628' + cleaned[1:]

        # Format phone nicely: +62 8xx-xxxx-xxxx
        if cleaned.startswith('+628') and len(cleaned) >= 11:
            body = cleaned[3:]
            return f"+62 {body[:3]}-{body[3:7]}-{body[7:]}"
        
        return cleaned

    def generate_whatsapp_url(self, phone: str, item_wa: str = None):
        if item_wa:
            return item_wa
        if not phone or phone == 'N/A':
            return None
        clean_num = re.sub(r'[^\d]', '', phone)
        if clean_num.startswith('628') or (clean_num.startswith('62') and len(clean_num) >= 11):
            return f"https://wa.me/{clean_num}"
        return None

    def clean(self, raw_data: list):
        """
        Membersihkan, menormalisasi, menyatukan, dan menguji validitas email data hasil scraping,
        serta menghitung ICP lead score, grade, dan tech stack.
        """
        cleaned_data = {}

        for item in raw_data:
            name = (item.get('name') or '').strip()
            if not name:
                continue

            raw_website = item.get('website') or 'N/A'
            norm_domain = item.get('normalized_domain') or self.normalize_domain(raw_website)

            # Key unik berdasarkan domain bersih atau nama
            if norm_domain and norm_domain != 'N/A':
                key = f"domain:{norm_domain.lower()}"
            else:
                key = f"name:{name.lower()}"

            phone_norm = self.normalize_phone(item.get('phone'))
            wa_url = self.generate_whatsapp_url(phone_norm, item.get('whatsapp_url'))

            email_val = item.get('email') or 'N/A'
            email_verification = self.verifier.verify(email_val)

            # Tech stack & summary extraction from website HTML
            raw_html = item.get('raw_html') or ''
            detected_tech = self.tech_detector.detect(raw_html) if raw_html else (item.get('tech_stack') or [])
            comp_summary = item.get('company_summary') or 'N/A'

            if key not in cleaned_data:
                cleaned_data[key] = {
                    "id": str(uuid.uuid4()),
                    "name": name,
                    "category": (item.get('category') or 'Business').capitalize(),
                    "location": item.get('location') or item.get('address') or 'Indonesia',
                    "website": raw_website,
                    "normalized_domain": norm_domain,
                    "email": email_val,
                    "is_email_verified": email_verification["is_valid"],
                    "email_status": email_verification["status"],
                    "email_score": email_verification["score"],
                    "phone": phone_norm,
                    "whatsapp_url": wa_url,
                    "linkedin_url": item.get('linkedin_url'),
                    "instagram_url": item.get('instagram_url'),
                    "facebook_url": item.get('facebook_url'),
                    "tech_stack": detected_tech,
                    "company_summary": comp_summary,
                    "decision_maker_name": item.get('decision_maker_name'),
                    "decision_maker_title": item.get('decision_maker_title'),
                    "decision_maker_linkedin": item.get('decision_maker_linkedin'),
                    "status": "READY" if ((email_val and email_val != 'N/A') or (phone_norm and phone_norm != 'N/A') or wa_url) else "FOLLOW UP",
                    "sources": [item.get('source')] if item.get('source') else (item.get('sources') or ["Scraper"])
                }
            else:
                existing = cleaned_data[key]
                # Merge missing fields
                if not existing.get("decision_maker_name") and item.get("decision_maker_name"):
                    existing["decision_maker_name"] = item.get("decision_maker_name")
                    existing["decision_maker_title"] = item.get("decision_maker_title")
                if not existing.get("decision_maker_linkedin") and item.get("decision_maker_linkedin"):
                    existing["decision_maker_linkedin"] = item.get("decision_maker_linkedin")
                if existing["website"] == "N/A" and raw_website != "N/A":
                    existing["website"] = raw_website
                    existing["normalized_domain"] = norm_domain
                if existing["email"] == "N/A" and email_val != "N/A":
                    existing["email"] = email_val
                    updated_verif = self.verifier.verify(email_val)
                    existing["is_email_verified"] = updated_verif["is_valid"]
                    existing["email_status"] = updated_verif["status"]
                    existing["email_score"] = updated_verif["score"]
                if existing["phone"] == "N/A" and phone_norm != 'N/A':
                    existing["phone"] = phone_norm
                    if not existing["whatsapp_url"]:
                        existing["whatsapp_url"] = self.generate_whatsapp_url(phone_norm)
                if not existing["whatsapp_url"] and wa_url:
                    existing["whatsapp_url"] = wa_url
                if not existing["linkedin_url"] and item.get("linkedin_url"):
                    existing["linkedin_url"] = item.get("linkedin_url")
                if not existing["instagram_url"] and item.get("instagram_url"):
                    existing["instagram_url"] = item.get("instagram_url")
                if not existing["facebook_url"] and item.get("facebook_url"):
                    existing["facebook_url"] = item.get("facebook_url")
                if existing["location"] == "Indonesia" and item.get("location"):
                    existing["location"] = item.get("location")
                if existing["company_summary"] == "N/A" and comp_summary != "N/A":
                    existing["company_summary"] = comp_summary

                # Merge tech stack
                if detected_tech:
                    existing["tech_stack"] = sorted(list(set(existing.get("tech_stack", []) + detected_tech)))
                
                # Merge sources
                item_sources = [item.get('source')] if item.get('source') else (item.get('sources') or [])
                for s in item_sources:
                    if s and s not in existing["sources"]:
                        existing["sources"].append(s)
                
                # Update status if contact info is found
                if existing["email"] != "N/A" or existing["phone"] != "N/A" or existing["whatsapp_url"]:
                    existing["status"] = "READY"

        # Calculate Lead Scoring & ICP Grades for all leads
        results = list(cleaned_data.values())
        for lead in results:
            scoring_res = self.scorer.score_lead(lead)
            lead["lead_score"] = scoring_res["lead_score"]
            lead["lead_grade"] = scoring_res["lead_grade"]
            lead["icp_reasoning"] = scoring_res["icp_reasoning"]

        return results
