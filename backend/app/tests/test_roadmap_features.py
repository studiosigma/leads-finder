import unittest
import asyncio
from app.services.broadcast_service import BroadcastService
from app.api.broadcast_routes import send_broadcast_campaign, BroadcastRequest
from app.api.crm_routes import export_to_notion, NotionExportRequest
from app.api.webhook_routes import register_webhook, emit_webhook_event, WebhookRegisterRequest, CONFIGURED_WEBHOOK
from app.api.settings_routes import update_settings, get_settings, get_active_proxy, SettingsRequest, SYSTEM_SETTINGS
from app.core.db import save_lead, IN_MEMORY_LEADS

class TestRoadmapFeatures(unittest.TestCase):

    def test_broadcast_service_template_parsing(self):
        service = BroadcastService()
        lead = {
            "name": "PT Maju Bersama",
            "category": "Teknologi",
            "location": "Jakarta Pusat",
            "website": "majubersama.co.id",
            "phone": "+62 812-9999-8888",
            "email": "halo@majubersama.co.id"
        }

        template = "Halo {{company_name}} di {{location}} ({{category}}). Kunjungi {{website}}!"
        parsed = service.parse_template(template, lead)

        self.assertIn("PT Maju Bersama", parsed)
        self.assertIn("Jakarta Pusat", parsed)
        self.assertIn("Teknologi", parsed)
        self.assertIn("majubersama.co.id", parsed)

    def test_broadcast_campaign_execution(self):
        service = BroadcastService()
        leads = [
            {"name": "Bisnis 1", "phone": "+62 812-1111-2222", "email": "b1@test.com"},
            {"name": "Bisnis 2", "phone": "N/A", "email": "N/A"}
        ]

        res = service.send_broadcast(leads, channel="whatsapp", message_template="Halo {{company_name}}", delay_seconds=0)
        self.assertEqual(res["total_leads"], 2)
        self.assertEqual(res["sent_count"], 1)
        self.assertEqual(res["failed_count"], 1)

    def test_notion_crm_export(self):
        IN_MEMORY_LEADS.clear()
        save_lead({
            "name": "RS Siloam Test",
            "category": "Kesehatan",
            "location": "Surabaya",
            "email": "info@siloam.com",
            "phone": "+62 31-555-1234",
            "status": "READY"
        })

        req = NotionExportRequest(notion_api_token="secret_demo_token_lfe_2026", database_id="db_demo_123")
        res = asyncio.run(export_to_notion(req))
        self.assertEqual(res["status"], "SUCCESS")
        self.assertGreaterEqual(res["exported_count"], 1)

    def test_webhook_event_emitter(self):
        req = WebhookRegisterRequest(webhook_url="https://httpbin.org/post", events=["scraping.completed"])
        asyncio.run(register_webhook(req))
        self.assertEqual(CONFIGURED_WEBHOOK["url"], "https://httpbin.org/post")

        # Emit test event
        emit_webhook_event("scraping.completed", {"query": "Apotek Jakarta", "count": 5})

    def test_settings_and_proxy_management(self):
        req = SettingsRequest(http_proxy="http://user:pass@127.0.0.1:8080")
        asyncio.run(update_settings(req))

        self.assertEqual(SYSTEM_SETTINGS["http_proxy"], "http://user:pass@127.0.0.1:8080")
        proxy = get_active_proxy()
        self.assertIsNotNone(proxy)
        self.assertEqual(proxy["http://"], "http://user:pass@127.0.0.1:8080")

if __name__ == "__main__":
    unittest.main()
