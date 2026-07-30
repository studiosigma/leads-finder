import unittest
from app.api.schedule_routes import SCHEDULED_JOBS, execute_job_task, calculate_next_run
from app.core.db import save_lead, IN_MEMORY_LEADS
from app.api.crm_routes import export_to_google_sheets, SheetsExportRequest, HTTPException

class TestOptimizations(unittest.TestCase):

    def test_scheduled_scraping_auto_runner(self):
        SCHEDULED_JOBS.clear()
        
        job_entry = {
            "schedule_id": "sched_test1",
            "query": "Restoran Bandung",
            "frequency": "hourly",
            "limit": 5,
            "status": "ACTIVE",
            "next_run": calculate_next_run("hourly"),
            "last_run": None,
            "runs_count": 0
        }
        SCHEDULED_JOBS["sched_test1"] = job_entry

        # Execute job runner task
        execute_job_task("sched_test1")

        updated = SCHEDULED_JOBS["sched_test1"]
        self.assertEqual(updated["runs_count"], 1)
        self.assertIsNotNone(updated["last_run"])

    def test_sheets_export_empty_leads(self):
        IN_MEMORY_LEADS.clear()
        request = SheetsExportRequest(webhook_url="https://httpbin.org/post", lead_ids=["nonexistent"])
        
        with self.assertRaises(HTTPException) as ctx:
            import asyncio
            asyncio.run(export_to_google_sheets(request))
        
        self.assertEqual(ctx.exception.status_code, 404)

    def test_sheets_export_with_leads(self):
        IN_MEMORY_LEADS.clear()
        save_lead({
            "name": "Klinik Sehat Utama",
            "website": "https://kliniksehat.id",
            "phone": "+62 812-3456-7890",
            "email": "info@google.com",
            "lead_score": 85,
            "lead_grade": "HOT"
        })

        request = SheetsExportRequest(webhook_url="https://httpbin.org/post")
        import asyncio
        res = asyncio.run(export_to_google_sheets(request))
        self.assertEqual(res["total_requested"], 1)
        self.assertIn(res["status"], ["SUCCESS", "WARNING"])

if __name__ == "__main__":
    unittest.main()
