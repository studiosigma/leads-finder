class AIPitchGenerator:
    def generate_pitch(self, business_name: str, category: str, location: str, website: str = None, my_offer: str = None):
        offer_text = my_offer if my_offer else "solusi otomatisasi dan pertumbuhan bisnis"
        
        email_subject = f"Penawaran Kerjasama & {offer_text.title()} untuk {business_name}"
        
        email_body = f"""Halo Tim Management {business_name},

Saya memperhatikan reputasi bisnis Anda di bidang {category} wilayah {location}.

Kami membantu perusahaan di bidang {category} untuk meningkatkan efisiensi operasional dan akuisisi pelanggan melalui {offer_text}.

Apakah Anda memiliki waktu 10 menit minggu ini untuk berdiskusi singkat mengenai potensi kolaborasi ini?

Salam hangat,
Tim Business Development"""

        wa_script = f"""Halo Tim {business_name}! 👋

Saya melihat profil bisnis {category} Anda di {location}. Kami memiliki {offer_text} yang dirancang khusus untuk meningkatkan pertumbuhan bisnis {category}.

Boleh kami bagikan portofolio/penawaran singkatnya via WhatsApp ini?"""

        return {
            "business_name": business_name,
            "category": category,
            "location": location,
            "email_subject": email_subject,
            "email_body": email_body,
            "whatsapp_script": wa_script
        }
