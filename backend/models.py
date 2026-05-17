from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, default=generate_uuid)
    customer_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    due_date = Column(DateTime, nullable=False)
    days_overdue = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="pending") # pending, processed, sent
    source = Column(String, nullable=False, default="manual") # manual, csv, ocr
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    drafts = relationship("EmailDraft", back_populates="invoice")

class EmailDraft(Base):
    __tablename__ = "email_drafts"

    id = Column(String, primary_key=True, default=generate_uuid)
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False)
    severity = Column(String, nullable=False) # LOW, MEDIUM, HIGH
    action = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending") # pending, approved, rejected, sent
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    invoice = relationship("Invoice", back_populates="drafts")
