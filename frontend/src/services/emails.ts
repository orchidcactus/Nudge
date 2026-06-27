import { apiFetch } from './api';
import { EmailDraft } from '../types';

/**
 * Retrieve drafts by status (defaulting to pending).
 */
export async function getPendingDrafts(status: string = 'pending'): Promise<EmailDraft[]> {
  return apiFetch<EmailDraft[]>(`/drafts?status=${status}`);
}

/**
 * Approve a draft to send the email and update statuses.
 */
export async function approveDraft(draftId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/drafts/${draftId}/approve`, {
    method: 'PATCH',
  });
}

/**
 * Reject a draft, changing its status.
 */
export async function rejectDraft(draftId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/drafts/${draftId}/reject`, {
    method: 'PATCH',
  });
}
