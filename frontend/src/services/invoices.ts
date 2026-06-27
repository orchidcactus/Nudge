import { apiFetch } from './api';
import { Invoice, InvoiceCreate } from '../types';

/**
 * Fetch all invoices from the database.
 */
export async function getInvoices(): Promise<Invoice[]> {
  return apiFetch<Invoice[]>('/invoices');
}

/**
 * Create a new invoice in the database.
 */
export async function createInvoice(invoice: InvoiceCreate): Promise<Invoice> {
  return apiFetch<Invoice>('/invoices', {
    method: 'POST',
    json: invoice,
  });
}

/**
 * Trigger the severity classification and action decision pipeline for an invoice.
 */
export async function runPipeline(invoiceId: string): Promise<{ message: string; draft_id: string }> {
  return apiFetch<{ message: string; draft_id: string }>(`/run-pipeline/${invoiceId}`, {
    method: 'POST',
  });
}

/**
 * Upload receipt image/PDF for OCR extraction (mocked on backend).
 */
export async function uploadOCR(file: File): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const response = await fetch(`${BASE_URL}/ocr/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}
