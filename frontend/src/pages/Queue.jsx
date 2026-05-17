import React, { useState } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { Check, Edit2, X, Send } from 'lucide-react';

export default function Queue() {
  const [drafts, setDrafts] = useState([
    {
      id: 'd1',
      invoice: { customer_name: 'Acme Corp', amount: 1500, days_overdue: 16 },
      severity: 'MEDIUM',
      action: 'Gentle reminder',
      subject: 'Following up on your recent invoice',
      body: 'Hi Acme Corp team,\n\nJust a friendly reminder that invoice #1234 for $1,500 is currently 16 days overdue. Please let us know if there are any issues.\n\nThanks,\nNudge Team'
    }
  ]);

  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-32">
        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <Check size={40} />
        </div>
        <h2 className="text-3xl font-bold">You're all caught up!</h2>
        <p className="text-text-muted max-w-sm">No pending drafts to review. Relax or check the dashboard for new invoices.</p>
      </div>
    );
  }

  const activeDraft = drafts[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Review Queue</h1>
          <p className="text-text-muted mt-1">{drafts.length} drafts waiting for your approval.</p>
        </div>
      </div>

      <div className="bg-surface rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.03] to-transparent">
          <div>
            <h2 className="text-2xl font-bold text-text">{activeDraft.invoice.customer_name}</h2>
            <p className="text-sm text-text-muted mt-1 flex items-center gap-2">
              <span className="font-medium">${activeDraft.invoice.amount}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span className="text-warning">{activeDraft.invoice.days_overdue} days overdue</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge severity={activeDraft.severity} />
            <span className="text-xs text-text-muted font-medium bg-background px-2 py-1 rounded-md border border-white/5">Action: {activeDraft.action}</span>
          </div>
        </div>

        <div className="p-8 space-y-6 flex-1 bg-background/50">
          <div>
            <label className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-2 block ml-1">Subject</label>
            <input 
              type="text" 
              value={activeDraft.subject}
              readOnly
              className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-inner"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-2 block ml-1">Message Body</label>
            <textarea 
              value={activeDraft.body}
              readOnly
              rows={8}
              className="w-full bg-surface border border-white/5 rounded-xl px-4 py-4 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none leading-relaxed shadow-inner"
            />
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-surface flex items-center justify-between">
          <Button variant="danger" className="gap-2 bg-transparent border border-danger/30 text-danger hover:bg-danger/10 shadow-none">
            <X size={18} />
            Reject
          </Button>
          <div className="flex gap-4">
            <Button variant="secondary" className="gap-2 px-6">
              <Edit2 size={18} />
              Edit
            </Button>
            <Button variant="primary" className="gap-2 px-6">
              <Send size={18} />
              Approve & Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
