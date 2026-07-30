import unittest
from app.services.pipeline.cleaner import DataCleaner
from app.services.pipeline.email_verifier import EmailVerifier
from app.core.db import save_lead, IN_MEMORY_LEADS

class TestPhase1Pipeline(unittest.TestCase):

    def test_domain_normalization(self):
        cleaner = DataCleaner()
        self.assertEqual(cleaner.normalize_domain("https://www.tokopedia.com/seller/123"), "tokopedia.com")
        self.assertEqual(cleaner.normalize_domain("http://sub.company.co.id/page?id=10"), "sub.company.co.id")
        self.assertEqual(cleaner.normalize_domain("company.com"), "company.com")
        self.assertEqual(cleaner.normalize_domain("N/A"), "N/A")

    def test_phone_normalization_and_whatsapp(self):
        cleaner = DataCleaner()
        phone1 = cleaner.normalize_phone("081234567890")
        self.assertEqual(phone1, "+62 812-3456-7890")
        wa1 = cleaner.generate_whatsapp_url(phone1)
        self.assertEqual(wa1, "https://wa.me/6281234567890")

        phone2 = cleaner.normalize_phone("628987654321")
        self.assertEqual(phone2, "+62 898-7654-321")
        wa2 = cleaner.generate_whatsapp_url(phone2)
        self.assertEqual(wa2, "https://wa.me/628987654321")

    def test_email_verifier(self):
        verifier = EmailVerifier()
        
        # Valid email
        res_valid = verifier.verify("info@google.com")
        self.assertTrue(res_valid["is_valid"])
        self.assertEqual(res_valid["status"], "VALID")
        self.assertGreaterEqual(res_valid["score"], 90)

        # Disposable email
        res_disp = verifier.verify("user@mailinator.com")
        self.assertFalse(res_disp["is_valid"])
        self.assertEqual(res_disp["status"], "INVALID")
        self.assertIn("Disposable", res_disp["reason"])

        # Role-based email
        res_role = verifier.verify("noreply@mycompany.com")
        self.assertFalse(res_role["is_valid"])
        self.assertEqual(res_role["status"], "ROLE_BASED")

        # Syntax invalid
        res_inv = verifier.verify("not-an-email")
        self.assertFalse(res_inv["is_valid"])
        self.assertEqual(res_inv["status"], "INVALID")

    def test_datacleaner_domain_deduplication(self):
        cleaner = DataCleaner()
        raw_leads = [
            {
                "name": "Google Indonesia",
                "website": "https://www.google.com",
                "phone": "08111111111",
                "source": "Google Maps"
            },
            {
                "name": "Google Inc",
                "website": "http://google.com/contact",
                "email": "contact@google.com",
                "source": "Google Search"
            }
        ]
        
        cleaned = cleaner.clean(raw_leads)
        self.assertEqual(len(cleaned), 1)
        lead = cleaned[0]
        self.assertEqual(lead["normalized_domain"], "google.com")
        self.assertEqual(lead["email"], "contact@google.com")
        self.assertTrue(lead["is_email_verified"])
        self.assertIn("Google Maps", lead["sources"])
        self.assertIn("Google Search", lead["sources"])

    def test_save_lead_deduplication(self):
        IN_MEMORY_LEADS.clear()
        
        lead1 = {
            "name": "Kedai Kopi Utama",
            "website": "https://kedaikopi.com",
            "normalized_domain": "kedaikopi.com",
            "email": "N/A",
            "phone": "+62 812-0000-1111",
            "sources": ["Google Maps"]
        }
        save_lead(lead1)
        self.assertEqual(len(IN_MEMORY_LEADS), 1)

        lead2 = {
            "name": "Kedai Kopi Utama",
            "website": "https://kedaikopi.com/about",
            "normalized_domain": "kedaikopi.com",
            "email": "halo@kedaikopi.com",
            "phone": "+62 812-0000-2222",
            "sources": ["Website"]
        }
        save_lead(lead2)
        self.assertEqual(len(IN_MEMORY_LEADS), 1)
        saved = IN_MEMORY_LEADS[0]
        self.assertEqual(saved["email"], "halo@kedaikopi.com")
        self.assertIn("Google Maps", saved["sources"])
        self.assertIn("Website", saved["sources"])

if __name__ == "__main__":
    unittest.main()
