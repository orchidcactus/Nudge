from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class InvoiceBase(BaseModel):
    customer_name: str
    amount: float
    due_date: datetime
    days_overdue: int
    source: Optional[str] = "manual"

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    id: str
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class EmailDraftBase(BaseModel):
    severity: str
    action: str
    subject: str
    body: str

class EmailDraftCreate(EmailDraftBase):
    invoice_id: str

class EmailDraftResponse(EmailDraftBase):
    id: str
    invoice_id: str
    status: str
    created_at: datetime
    invoice: Optional[InvoiceResponse] = None

    class Config:
        orm_mode = True
        from_attributes = True

# Pydantic models for Groq structured output
class SeverityClassification(BaseModel):
    severity: str
    reasoning: str

class ActionDecision(BaseModel):
    action: str
    reasoning: str

class EmailDraftGeneration(BaseModel):
    subject: str
    body: str
