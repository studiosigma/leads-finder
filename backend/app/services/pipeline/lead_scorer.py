from typing import Dict, Any

class LeadScorer:
    """
    Automated Lead Scoring Engine & Ideal Customer Profile (ICP) Evaluator
    Scores leads from 0 to 100 based on contact readiness, email verification status,
    digital footprint, and marketing pixel adoption.
    """

    def score_lead(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        score = 0
        reasons = []

        # 1. Verified Email Check (+25 pts)
        email = lead.get("email")
        is_email_verified = lead.get("is_email_verified", False)
        email_status = lead.get("email_status", "UNVERIFIED")

        if email and email.upper() != "N/A":
            if is_email_verified or email_status == "VALID":
                score += 25
                reasons.append("Email terverifikasi & siap dikontak (+25 pts)")
            elif email_status == "ROLE_BASED":
                score += 10
                reasons.append("Email berupa role-based address (+10 pts)")
            else:
                score += 15
                reasons.append("Email ditemukan tetapi berstatus risky (+15 pts)")

        # 2. WhatsApp Direct Availability (+20 pts)
        wa_url = lead.get("whatsapp_url")
        phone = lead.get("phone")
        if wa_url:
            score += 20
            reasons.append("Memiliki kontak WhatsApp langsung (+20 pts)")
        elif phone and phone.upper() != "N/A":
            score += 10
            reasons.append("Memiliki nomor telepon kontak (+10 pts)")

        # 3. Website & Clean Domain (+15 pts)
        website = lead.get("website")
        normalized_domain = lead.get("normalized_domain")
        if website and website.upper() != "N/A" and normalized_domain and normalized_domain.upper() != "N/A":
            score += 15
            reasons.append("Website resmi & domain aktif terdeteksi (+15 pts)")

        # 4. Social Media Presence (+15 pts)
        social_count = 0
        if lead.get("linkedin_url"):
            social_count += 1
        if lead.get("instagram_url"):
            social_count += 1
        if lead.get("facebook_url"):
            social_count += 1

        if social_count >= 2:
            score += 15
            reasons.append(f"Kehadiran media sosial kuat ({social_count} platform) (+15 pts)")
        elif social_count == 1:
            score += 8
            reasons.append("Terhubung dengan 1 profil media sosial (+8 pts)")

        # 5. Tech Stack & Marketing Pixels (+15 pts)
        tech_stack = lead.get("tech_stack") or []
        has_pixel = any(t in tech_stack for t in ["Meta Pixel", "Google Tag Manager", "Google Analytics", "TikTok Pixel"])
        if has_pixel:
            score += 15
            reasons.append("Menggunakan Ad Tracker / Pixel Pemasaran (+15 pts)")
        elif len(tech_stack) > 0:
            score += 8
            reasons.append(f"Teknologi web terdeteksi ({', '.join(tech_stack[:2])}) (+8 pts)")

        # Cap score at 100
        final_score = min(score, 100)

        # Determine Lead Grade
        if final_score >= 75:
            grade = "HOT"
        elif final_score >= 50:
            grade = "WARM"
        else:
            grade = "COLD"

        reasoning_text = " | ".join(reasons) if reasons else "Informasi kontak sangat terbatas"

        return {
            "lead_score": final_score,
            "lead_grade": grade,
            "icp_reasoning": reasoning_text
        }
