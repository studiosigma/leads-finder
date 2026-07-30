import unittest
from app.services.ai_pitch import AIPitchGenerator
from app.core.db import save_lead, IN_MEMORY_LEADS
from app.services.pipeline.cleaner import DataCleaner

class TestPhase3PitchGenerator(unittest.TestCase):

    def test_basic_pitch_generation(self):
        generator = AIPitchGenerator()
        res = generator.generate_pitch(
            business_name="Kopi Kenangan",
            category="Kuliner",
            location="Jakarta",
            website="https://kopikenangan.com"
        )

        self.assertIn("Kopi Kenangan", res["email_subject"])
        self.assertIn("Jakarta", res["email_body"])
        self.assertIn("Kopi Kenangan", res["whatsapp_script"])
        self.assertLessEqual(len(res["linkedin_note"]), 300)

    def test_hyper_personalized_pitch_ecommerce(self):
        generator = AIPitchGenerator()
        res = generator.generate_pitch(
            business_name="Sepatu Pro Indonesia",
            category="Fashion E-Commerce",
            location="Bandung",
            website="https://sepatupro.id",
            my_offer="layanan Meta Ads Retargeting & Automation",
            tech_stack=["Shopify", "Google Analytics"],
            lead_grade="HOT",
            company_summary="Brand sepatu lokal dengan kualitas ekspor"
        )

        self.assertIn("Sepatu Pro Indonesia", res["email_body"])
        self.assertIn("Shopify", res["email_body"])
        self.assertTrue(any("Meta Pixel" in p for p in res["pain_points"]))
        self.assertIn("Brand sepatu lokal", res["email_body"])
        self.assertLessEqual(len(res["linkedin_note"]), 300)

    def test_pitch_from_cleaned_lead(self):
        cleaner = DataCleaner()
        raw = [{
            "name": "Toko Baju Hits",
            "website": "https://www.tokobajuhits.com",
            "phone": "081234567899",
            "email": "info@google.com",
            "raw_html": '<script src="https://cdn.shopify.com/t/theme.js"></script>',
            "source": "Google Search"
        }]

        cleaned = cleaner.clean(raw)
        lead = cleaned[0]

        generator = AIPitchGenerator()
        pitch = generator.generate_pitch(
            business_name=lead["name"],
            category=lead["category"],
            location=lead["location"],
            website=lead["website"],
            tech_stack=lead["tech_stack"],
            lead_grade=lead["lead_grade"],
            icp_reasoning=lead["icp_reasoning"]
        )

        self.assertIn("Toko Baju Hits", pitch["business_name"])
        self.assertIn("Shopify", pitch["tech_stack"])
        self.assertIsNotNone(pitch["email_subject"])
        self.assertIsNotNone(pitch["whatsapp_script"])

if __name__ == "__main__":
    unittest.main()
