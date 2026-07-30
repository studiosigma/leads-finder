from typing import List, Optional, Dict, Any

class AIPitchGenerator:
    """
    Hyper-Personalized AI Outreach & Pitch Generator Engine
    Generates targeted cold email scripts, WhatsApp messages, LinkedIn notes, 
    and pain point analysis using lead intelligence signals.
    """

    def generate_pitch(
        self,
        business_name: str,
        category: str = "Bisnis",
        location: str = "Indonesia",
        website: Optional[str] = None,
        my_offer: Optional[str] = None,
        tech_stack: Optional[List[str]] = None,
        lead_grade: Optional[str] = "WARM",
        icp_reasoning: Optional[str] = None,
        company_summary: Optional[str] = None,
        decision_maker_name: Optional[str] = None,
        decision_maker_title: Optional[str] = None
    ) -> Dict[str, Any]:
        
        offer_text = my_offer if my_offer else "solusi otomatisasi & peningkatan penjualan B2B"
        techs = tech_stack or []
        tech_str = ", ".join(techs) if techs else "teknologi digital"
        
        # 1. Identify Pain Points & Business Opportunities
        pain_points = []
        if "Meta Pixel" not in techs and ("Shopify" in techs or "WooCommerce" in techs or "WordPress" in techs):
            pain_points.append("Website e-commerce/bisnis belum terpasang Meta Pixel untuk retargeting pengunjung.")
        if "Google Tag Manager" not in techs and "Google Analytics" not in techs:
            pain_points.append("Belum ada pelacakan analytics otomatis untuk mengukur konversi pengunjung website.")
        if not techs or techs == ["WordPress"]:
            pain_points.append("Website masih menggunakan infrastruktur dasar dan bisa ditingkatkan kecepatan konversinya.")
        if lead_grade == "HOT":
            pain_points.append("Bisnis memiliki kesiapan kontak tinggi (Email terverifikasi + WhatsApp aktif).")
        
        if not pain_points:
            pain_points.append(f"Potensi optimalisasi operasional & strategi akuisisi pelanggan baru di sektor {category}.")

        # 2. Dynamic Email Subject & Body
        if "Shopify" in techs or "WooCommerce" in techs:
            email_subject = f"Peluang Peningkatan Omset E-Commerce & {offer_text.title()} untuk {business_name}"
        else:
            email_subject = f"Usulan Kerjasama Strategic & {offer_text.title()} untuk {business_name}"

        company_desc = f"\n\nKami memperhatikan {business_name} ({company_summary})." if company_summary and company_summary != "N/A" else ""

        # Executive greeting check
        dm_name = decision_maker_name if decision_maker_name and decision_maker_name != "N/A" else None
        dm_title = f" ({decision_maker_title})" if decision_maker_title and decision_maker_title != "N/A" else ""

        if dm_name:
            salutation_email = f"Halo Bapak/Ibu {dm_name}{dm_title} - {business_name},"
            salutation_wa = f"Halo Pak/Bu {dm_name}! 👋"
            salutation_li = f"Halo Pak/Bu {dm_name}, salam kenal!"
        else:
            salutation_email = f"Halo Tim Management {business_name},"
            salutation_wa = f"Halo Tim {business_name}! 👋"
            salutation_li = f"Halo Tim {business_name}, salam kenal!"

        email_body = f"""{salutation_email}{company_desc}

Saya memperhatikan profil bisnis Anda di sektor {category} area {location}. Berdasarkan pengamatan kami, website Anda saat ini didukung oleh {tech_str}.

Kami membantu perusahaan di bidang {category} untuk mengoptimalkan efisiensi operasional dan pertumbuhan pendapatan melalui {offer_text}.

Beberapa poin observasi & peluang yang dapat kita diskusikan:
- {pain_points[0]}
{f"- {pain_points[1]}" if len(pain_points) > 1 else ""}

Apakah Anda memiliki waktu 10 menit minggu ini untuk diskusi santai via Google Meet atau WhatsApp?

Salam hangat,
Tim Growth & Strategy"""

        # 3. WhatsApp Direct Outreach Script
        wa_script = f"""{salutation_wa}

Saya memperhatikan bisnis {category} Anda di {location} ({website or 'website resmi'}).

Kami memiliki {offer_text} yang dirancang khusus untuk membantu bisnis seperti {business_name} meningkatkan konversi penjualan.

Boleh saya kirimkan proposal/ringkasan solusi 1 halaman via WA ini?"""

        # 4. LinkedIn Connection Note (<= 300 characters limit)
        linkedin_note = f"{salutation_li} Saya memperhatikan perkembangan bisnis {category} Anda di {location}. Tertarik untuk terhubung dan berbagi insight seputar {offer_text}."
        if len(linkedin_note) > 300:
            linkedin_note = linkedin_note[:297] + "..."

        return {
            "business_name": business_name,
            "category": category,
            "location": location,
            "website": website or "N/A",
            "lead_grade": lead_grade,
            "tech_stack": techs,
            "email_subject": email_subject,
            "email_body": email_body,
            "whatsapp_script": wa_script,
            "linkedin_note": linkedin_note,
            "pain_points": pain_points,
            "icp_reasoning": icp_reasoning or "Lead memiliki potensi pertumbuhan B2B"
        }
