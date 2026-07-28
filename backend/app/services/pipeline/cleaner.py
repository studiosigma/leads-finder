import re
import uuid

class DataCleaner:
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
        Membersihkan, menormalisasi, dan menyatukan data hasil scraping.
        """
        cleaned_data = {}

        for item in raw_data:
            name = (item.get('name') or '').strip()
            if not name:
                continue

            # Key unik berdasarkan nama / domain
            key = name.lower()
            if item.get('domain'):
                key = item.get('domain').lower()

            phone_norm = self.normalize_phone(item.get('phone'))
            wa_url = self.generate_whatsapp_url(phone_norm, item.get('whatsapp_url'))

            if key not in cleaned_data:
                cleaned_data[key] = {
                    "id": str(uuid.uuid4()),
                    "name": name,
                    "category": (item.get('category') or 'Business').capitalize(),
                    "location": item.get('location') or item.get('address') or 'Indonesia',
                    "website": item.get('website') or 'N/A',
                    "email": item.get('email') or 'N/A',
                    "phone": phone_norm,
                    "whatsapp_url": wa_url,
                    "linkedin_url": item.get('linkedin_url'),
                    "instagram_url": item.get('instagram_url'),
                    "facebook_url": item.get('facebook_url'),
                    "status": "READY" if ((item.get('email') and item.get('email') != 'N/A') or (phone_norm and phone_norm != 'N/A') or wa_url) else "FOLLOW UP",
                    "sources": [item.get('source')] if item.get('source') else ["Scraper"]
                }
            else:
                existing = cleaned_data[key]
                # Merge missing fields
                if existing["website"] == "N/A" and item.get("website"):
                    existing["website"] = item.get("website")
                if existing["email"] == "N/A" and item.get("email"):
                    existing["email"] = item.get("email")
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
                
                # Merge sources
                if item.get('source') and item.get('source') not in existing["sources"]:
                    existing["sources"].append(item.get('source'))
                
                # Update status if contact info is found
                if existing["email"] != "N/A" or existing["phone"] != "N/A" or existing["whatsapp_url"]:
                    existing["status"] = "READY"

        return list(cleaned_data.values())



