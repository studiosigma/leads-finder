import unittest
import asyncio
from app.core.db import save_lead, IN_MEMORY_LEADS
from app.api.crm_routes import update_lead_deal, UpdateDealRequest

class TestKanbanPipeline(unittest.TestCase):

    def test_update_lead_deal_value_and_stage(self):
        IN_MEMORY_LEADS.clear()
        save_lead({
            "id": "lead_test_kanban_1",
            "name": "PT Jaya Teknik",
            "category": "Kontraktor",
            "location": "Jakarta Selatan",
            "status": "READY",
            "deal_value": 0
        })

        lead_id = "lead_test_kanban_1"

        req = UpdateDealRequest(status="PROPOSAL", deal_value=25000000, sales_notes="Proposal Rp 25jt dikirim via email")
        res = asyncio.run(update_lead_deal(lead_id, req))

        self.assertEqual(res["status"], "SUCCESS")
        updated_lead = res["lead"]
        self.assertEqual(updated_lead["status"], "PROPOSAL")
        self.assertEqual(updated_lead["deal_value"], 25000000)
        self.assertEqual(updated_lead["sales_notes"], "Proposal Rp 25jt dikirim via email")

    def test_kanban_pipeline_total_value_aggregation(self):
        IN_MEMORY_LEADS.clear()
        save_lead({"name": "Lead A", "status": "WON", "deal_value": 10000000})
        save_lead({"name": "Lead B", "status": "WON", "deal_value": 15000000})
        save_lead({"name": "Lead C", "status": "CONTACTED", "deal_value": 5000000})

        won_leads = [l for l in IN_MEMORY_LEADS if l.get("status") == "WON"]
        total_won = sum(l.get("deal_value", 0) for l in won_leads)

        self.assertEqual(len(won_leads), 2)
        self.assertEqual(total_won, 25000000)

if __name__ == "__main__":
    unittest.main()
