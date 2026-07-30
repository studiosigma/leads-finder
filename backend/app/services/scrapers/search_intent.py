import re

class SmartSearchIntentParser:
    """
    AI Query Intent Parser & Smart Keyword Normalizer
    Parses complex multi-word search queries into Niche, City, Industrial Area, and Postal Code.
    """

    SUB_DISTRICT_MAP = {
        "mm2100": {"location": "Kawasan Industri MM2100, Cibitung, Bekasi, Jawa Barat", "postal": "17520"},
        "jababeka": {"location": "Kawasan Industri Jababeka, Cikarang Utara, Bekasi, Jawa Barat", "postal": "17530"},
        "ejip": {"location": "Kawasan Industri EJIP, Cikarang Selatan, Bekasi, Jawa Barat", "postal": "17550"},
        "hyundai": {"location": "Kawasan Industri Hyundai, Cikarang Selatan, Bekasi, Jawa Barat", "postal": "17550"},
        "deltamas": {"location": "Kawasan Industri Kota Deltamas, Cikarang Pusat, Bekasi, Jawa Barat", "postal": "17530"},
        "marunda": {"location": "Kawasan Industri Marunda, Jakarta Utara, DKI Jakarta", "postal": "14120"},
        "pulogadung": {"location": "Kawasan Industri Pulogadung, Jakarta Timur, DKI Jakarta", "postal": "13920"},
        "tambun": {"location": "Tambun Selatan, Bekasi, Jawa Barat", "postal": "17510"},
        "cibitung": {"location": "Cibitung, Bekasi, Jawa Barat", "postal": "17520"},
        "cikarang": {"location": "Cikarang Barat, Bekasi, Jawa Barat", "postal": "17530"},
        "bekasi": {"location": "Bekasi Kota, Jawa Barat", "postal": "17141"},
        "bandung": {"location": "Bandung Kota, Jawa Barat", "postal": "40111"},
        "jakarta": {"location": "Jakarta Selatan, DKI Jakarta", "postal": "12190"},
        "surabaya": {"location": "Surabaya Kota, Jawa Timur", "postal": "60271"},
    }

    def parse(self, query: str) -> dict:
        q_lower = query.lower().strip()
        
        # 1. Detect Location & Postal Code
        matched_location = "Indonesia"
        matched_postal = "10110"
        
        for key, info in self.SUB_DISTRICT_MAP.items():
            if key in q_lower:
                matched_location = info["location"]
                matched_postal = info["postal"]
                break

        # 2. Detect Business Category Intent
        category = "General Business"
        if any(w in q_lower for w in ["pabrik", "industri", "manufaktur", "plastik", "kimia", "baja"]):
            category = "Manufaktur & Industry"
        elif any(w in q_lower for w in ["sekolah", "sekolahan", "sma", "smk", "smp", "sd", "kampus", "universitas"]):
            category = "Pendidikan & Sekolah"
        elif any(w in q_lower for w in ["rumah sakit", "sakit", "klinik", "apotek", "kesehatan"]):
            category = "Rumah Sakit & Kesehatan"
        elif any(w in q_lower for w in ["hotel", "resort", "penginapan", "villa"]):
            category = "Hospitality & Hotel"
        elif any(w in q_lower for w in ["restoran", "rumah makan", "cafe", "kafe", "kuliner"]):
            category = "Kuliner & Restoran"
        elif any(w in q_lower for w in ["bengkel", "dealer", "showroom", "otomotif"]):
            category = "Otomotif & Bengkel"

        # 3. Clean Keyword
        clean_keyword = re.sub(r'\b(di|kabupaten|kota|daerah|ke|kawasan|industri)\b', '', q_lower, flags=re.IGNORECASE).strip()

        return {
            "raw_query": query,
            "clean_keyword": clean_keyword.title(),
            "category": category,
            "location": matched_location,
            "postal_code": matched_postal,
        }
