import unittest
from app.services.pipeline.tech_detector import TechDetector
from app.services.pipeline.lead_scorer import LeadScorer
from app.services.pipeline.cleaner import DataCleaner

class TestPhase2Intelligence(unittest.TestCase):

    def test_tech_detector(self):
        detector = TechDetector()
        
        sample_html_1 = """
        <html>
            <head>
                <script src="https://cdn.shopify.com/s/files/1/0000/0000/t/1/assets/theme.js"></script>
                <script>fbq('init', '123456789');</script>
                <script src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXX"></script>
            </head>
            <body><h1>Store</h1></body>
        </html>
        """
        tech1 = detector.detect(sample_html_1)
        self.assertIn("Shopify", tech1)
        self.assertIn("Meta Pixel", tech1)
        self.assertIn("Google Tag Manager", tech1)

        sample_html_2 = """
        <html>
            <head>
                <link rel="stylesheet" href="/wp-content/plugins/woocommerce/assets/css/woocommerce.css">
            </head>
            <body><script id="__NEXT_DATA__">{}</script></body>
        </html>
        """
        tech2 = detector.detect(sample_html_2)
        self.assertIn("WooCommerce", tech2)
        self.assertIn("WordPress", tech2)
        self.assertIn("Next.js", tech2)

    def test_lead_scorer_hot_lead(self):
        scorer = LeadScorer()
        hot_lead = {
            "name": "Tokopedia Seller Pro",
            "email": "contact@google.com",
            "is_email_verified": True,
            "email_status": "VALID",
            "phone": "+62 812-3456-7890",
            "whatsapp_url": "https://wa.me/6281234567890",
            "website": "https://seller.com",
            "normalized_domain": "seller.com",
            "linkedin_url": "https://linkedin.com/company/seller",
            "instagram_url": "https://instagram.com/seller",
            "tech_stack": ["Shopify", "Meta Pixel", "Google Analytics"]
        }

        res = scorer.score_lead(hot_lead)
        self.assertGreaterEqual(res["lead_score"], 75)
        self.assertEqual(res["lead_grade"], "HOT")
        self.assertIn("Email terverifikasi", res["icp_reasoning"])
        self.assertIn("WhatsApp", res["icp_reasoning"])

    def test_lead_scorer_cold_lead(self):
        scorer = LeadScorer()
        cold_lead = {
            "name": "Warung Makan Sederhana",
            "email": "N/A",
            "phone": "N/A",
            "website": "N/A"
        }

        res = scorer.score_lead(cold_lead)
        self.assertLess(res["lead_score"], 50)
        self.assertEqual(res["lead_grade"], "COLD")

    def test_datacleaner_integration_phase2(self):
        cleaner = DataCleaner()
        raw_data = [
            {
                "name": "PT Maju Bersama",
                "website": "https://www.majubersama.com",
                "email": "info@google.com",
                "phone": "081234567890",
                "linkedin_url": "https://linkedin.com/company/majubersama",
                "raw_html": '<script src="https://cdn.shopify.com/theme.js"></script><script>fbq("init", "123");</script>',
                "source": "Google Maps"
            }
        ]

        cleaned = cleaner.clean(raw_data)
        self.assertEqual(len(cleaned), 1)
        lead = cleaned[0]
        
        self.assertIn("Shopify", lead["tech_stack"])
        self.assertIn("Meta Pixel", lead["tech_stack"])
        self.assertGreaterEqual(lead["lead_score"], 75)
        self.assertEqual(lead["lead_grade"], "HOT")
        self.assertIsNotNone(lead["icp_reasoning"])

if __name__ == "__main__":
    unittest.main()
