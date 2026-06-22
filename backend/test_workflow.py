import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
import os

# Set dummy env vars before importing main
os.environ["GROQ_API_KEY"] = "mock_groq_key"
os.environ["RESEND_API_KEY"] = "mock_resend_key"

from main import app
from database import Base, engine, SessionLocal
from models import Invoice, EmailDraft
import schemas

class TestNudgeWorkflow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # We can use the default test database engine, but let's make sure tables are created
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    def setUp(self):
        # Clean up database tables before each test
        db = SessionLocal()
        db.query(EmailDraft).delete()
        db.query(Invoice).delete()
        db.commit()
        db.close()

    def test_complete_workflow(self):
        # 1. Create an invoice via POST /invoices
        invoice_data = {
            "customer_name": "Test Customer",
            "amount": 1250.50,
            "due_date": "2026-06-01T12:00:00",
            "days_overdue": 15,
            "source": "manual"
        }
        response = self.client.post("/invoices", json=invoice_data)
        self.assertEqual(response.status_code, 200)
        invoice = response.json()
        invoice_id = invoice["id"]
        self.assertEqual(invoice["customer_name"], "Test Customer")
        self.assertEqual(invoice["status"], "pending")

        # 2. Run the pipeline via POST /run-pipeline/{invoice_id}
        # Since we don't want to call external Groq API, we mock run_invoice_pipeline
        mock_pipeline_result = {
            "severity": "MEDIUM",
            "action": "Gentle reminder",
            "subject": "Overdue payment reminder",
            "body": "Hi Test Customer, your payment is 15 days overdue."
        }
        with patch("main.run_invoice_pipeline", return_value=mock_pipeline_result):
            pipeline_response = self.client.post(f"/run-pipeline/{invoice_id}")
            self.assertEqual(pipeline_response.status_code, 200)
            pipeline_data = pipeline_response.json()
            self.assertEqual(pipeline_data["message"], "Pipeline completed successfully")
            draft_id = pipeline_data["draft_id"]

        # Verify invoice status changed to "processed"
        db = SessionLocal()
        db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        self.assertEqual(db_invoice.status, "processed")
        db.close()

        # 3. Retrieve the pending drafts via GET /drafts
        drafts_response = self.client.get("/drafts?status=pending")
        self.assertEqual(drafts_response.status_code, 200)
        drafts = drafts_response.json()
        self.assertEqual(len(drafts), 1)
        self.assertEqual(drafts[0]["id"], draft_id)
        self.assertEqual(drafts[0]["severity"], "MEDIUM")

        # 4. Approve the draft via PATCH /drafts/{id}/approve
        # Since we don't want to call external Resend API, we mock send_email
        with patch("main.send_email") as mock_send_email:
            approve_response = self.client.patch(f"/drafts/{draft_id}/approve")
            self.assertEqual(approve_response.status_code, 200)
            self.assertEqual(approve_response.json()["message"], "Draft approved and email sent")
            mock_send_email.assert_called_once_with(
                to="testcustomer@example.com",
                subject="Overdue payment reminder",
                body="Hi Test Customer, your payment is 15 days overdue."
            )

        # Verify database statuses are updated
        db = SessionLocal()
        db_draft = db.query(EmailDraft).filter(EmailDraft.id == draft_id).first()
        db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        self.assertEqual(db_draft.status, "sent")
        self.assertEqual(db_invoice.status, "sent")
        db.close()

    def test_reject_workflow(self):
        # 1. Create an invoice
        invoice_data = {
            "customer_name": "Reject Customer",
            "amount": 500.00,
            "due_date": "2026-06-10T12:00:00",
            "days_overdue": 5,
            "source": "manual"
        }
        response = self.client.post("/invoices", json=invoice_data)
        invoice_id = response.json()["id"]

        # 2. Run the pipeline
        mock_pipeline_result = {
            "severity": "LOW",
            "action": "Gentle reminder",
            "subject": "Friendly reminder",
            "body": "Hi, just a reminder."
        }
        with patch("main.run_invoice_pipeline", return_value=mock_pipeline_result):
            pipeline_response = self.client.post(f"/run-pipeline/{invoice_id}")
            draft_id = pipeline_response.json()["draft_id"]

        # 3. Reject the draft via PATCH /drafts/{id}/reject
        reject_response = self.client.patch(f"/drafts/{draft_id}/reject")
        self.assertEqual(reject_response.status_code, 200)
        self.assertEqual(reject_response.json()["message"], "Draft rejected")

        # Verify database status
        db = SessionLocal()
        db_draft = db.query(EmailDraft).filter(EmailDraft.id == draft_id).first()
        self.assertEqual(db_draft.status, "rejected")
        db.close()

if __name__ == "__main__":
    unittest.main()
