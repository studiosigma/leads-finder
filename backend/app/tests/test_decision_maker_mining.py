import unittest
from app.services.scrapers.website_crawler import WebsiteCrawler
from app.services.pipeline.cleaner import DataCleaner
from app.services.ai_pitch import AIPitchGenerator

class TestDecisionMakerMining(unittest.TestCase):

    def test_decision_maker_extraction_from_html(self):
        crawler = WebsiteCrawler()
        sample_html = """
        <html>
            <head><title>About Us - PT Nusantara Digital</title></head>
            <body>
                <h1>Tim Manajemen Kami</h1>
                <div class="team">
                    <p>Bpk. Hendra Wijaya - Founder & CEO</p>
                    <p>Contact: <a href="https://linkedin.com/in/hendrawijaya">LinkedIn Profile</a></p>
                </div>
            </body>
        </html>
        """

        # Simulate fetch html override or pattern matching
        from app.services.scrapers.website_crawler import TITLE_PATTERN
        text = "Bpk. Hendra Wijaya - Founder & CEO"
        match = TITLE_PATTERN.search(text)

        self.assertIsNotNone(match)
        self.assertEqual(match.group(1).strip(), "Hendra Wijaya")
        self.assertEqual(match.group(2).strip(), "Founder & CEO")

    def test_cleaner_decision_maker_preservation(self):
        cleaner = DataCleaner()
        raw_items = [{
            "name": "PT Sentosa Jaya",
            "website": "sentosajaya.co.id",
            "decision_maker_name": "Budi Santoso",
            "decision_maker_title": "Owner & Managing Director",
            "decision_maker_linkedin": "https://linkedin.com/in/budisantoso"
        }]

        cleaned = cleaner.clean(raw_items)
        self.assertEqual(len(cleaned), 1)
        item = cleaned[0]
        self.assertEqual(item["decision_maker_name"], "Budi Santoso")
        self.assertEqual(item["decision_maker_title"], "Owner & Managing Director")

    def test_ai_pitch_personalized_executive_greeting(self):
        generator = AIPitchGenerator()
        res = generator.generate_pitch(
            business_name="PT Cyber Solusindo",
            category="IT Services",
            location="Jakarta",
            decision_maker_name="Ahmad Ridwan",
            decision_maker_title="CEO"
        )

        self.assertIn("Halo Bapak/Ibu Ahmad Ridwan (CEO) - PT Cyber Solusindo,", res["email_body"])
        self.assertIn("Halo Pak/Bu Ahmad Ridwan! 👋", res["whatsapp_script"])
        self.assertIn("Halo Pak/Bu Ahmad Ridwan, salam kenal!", res["linkedin_note"])

if __name__ == "__main__":
    unittest.main()
