export interface InvoiceBase {
  customer_name: string;
  amount: number;
  due_date: string; // ISO DateTime string
  days_overdue: number;
  source?: 'manual' | 'csv' | 'ocr' | string;
}

export interface InvoiceCreate extends InvoiceBase {}

export interface InvoiceResponse extends InvoiceBase {
  id: string;
  status: 'pending' | 'processed' | 'sent' | string;
  created_at: string; // ISO DateTime string
}

// Compatibility alias matching existing imports
export type Invoice = InvoiceResponse;

export interface EmailDraftBase {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  action: string;
  subject: string;
  body: string;
}

export interface EmailDraftCreate extends EmailDraftBase {
  invoice_id: string;
}

export interface EmailDraftResponse extends EmailDraftBase {
  id: string;
  invoice_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent' | string;
  created_at: string; // ISO DateTime string
  invoice?: InvoiceResponse | null;
}

// Compatibility alias matching existing imports
export type EmailDraft = EmailDraftResponse;

// Pydantic models for Groq structured output
export interface SeverityClassification {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  reasoning: string;
}

export interface ActionDecision {
  action: string;
  reasoning: string;
}

export interface EmailDraftGeneration {
  subject: string;
  body: string;
}

