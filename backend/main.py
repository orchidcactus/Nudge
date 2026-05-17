from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import Invoice, EmailDraft
import schemas
from services.llm import run_invoice_pipeline
from services.email import send_email
import os
from dotenv import load_dotenv

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nudge API")

@app.post("/invoices", response_model=schemas.InvoiceResponse)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    db_invoice = Invoice(**invoice.dict())
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@app.post("/run-pipeline/{invoice_id}")
def run_pipeline(invoice_id: str, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    invoice_data = {
        "customer_name": invoice.customer_name,
        "amount": invoice.amount,
        "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
        "days_overdue": invoice.days_overdue,
    }
    
    try:
        pipeline_result = run_invoice_pipeline(invoice_data)
        
        db_draft = EmailDraft(
            invoice_id=invoice.id,
            severity=pipeline_result["severity"],
            action=pipeline_result["action"],
            subject=pipeline_result["subject"],
            body=pipeline_result["body"],
            status="pending"
        )
        db.add(db_draft)
        
        invoice.status = "processed"
        
        db.commit()
        db.refresh(db_draft)
        return {"message": "Pipeline completed successfully", "draft_id": db_draft.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/drafts", response_model=list[schemas.EmailDraftResponse])
def get_drafts(status: str = "pending", db: Session = Depends(get_db)):
    drafts = db.query(EmailDraft).filter(EmailDraft.status == status).all()
    return drafts

@app.patch("/drafts/{id}/approve")
def approve_draft(id: str, db: Session = Depends(get_db)):
    draft = db.query(EmailDraft).filter(EmailDraft.id == id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    draft.status = "approved"
    db.commit()
    
    # Send email (mock to address since we don't have it in model, using customer name)
    send_email(
        to=f"{draft.invoice.customer_name.lower().replace(' ', '')}@example.com",
        subject=draft.subject,
        body=draft.body
    )
    
    draft.status = "sent"
    draft.invoice.status = "sent"
    db.commit()
    
    return {"message": "Draft approved and email sent"}

@app.patch("/drafts/{id}/reject")
def reject_draft(id: str, db: Session = Depends(get_db)):
    draft = db.query(EmailDraft).filter(EmailDraft.id == id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    draft.status = "rejected"
    db.commit()
    return {"message": "Draft rejected"}

@app.post("/ocr/upload")
def upload_ocr():
    return {"message": "OCR endpoint (stretch goal) - Not implemented yet"}
