import React, { useState } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const [invoices, setInvoices] = useState([
    { id: '1', customer_name: 'Acme Corp', amount: 1500.00, due_date: '2026-05-01', days_overdue: 16, status: 'pending' },
    { id: '2', customer_name: 'Globex', amount: 3200.50, due_date: '2026-04-15', days_overdue: 32, status: 'processed' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-text-muted mt-1">Overview of all invoices and their status.</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} />
          New Invoice
        </Button>
      </div>

      <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-text-muted text-sm border-b border-white/5">
              <th className="py-4 px-6 font-medium">Customer</th>
              <th className="py-4 px-6 font-medium">Amount</th>
              <th className="py-4 px-6 font-medium">Due Date</th>
              <th className="py-4 px-6 font-medium">Overdue (Days)</th>
              <th className="py-4 px-6 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6 font-medium text-text">{inv.customer_name}</td>
                <td className="py-4 px-6">${inv.amount.toFixed(2)}</td>
                <td className="py-4 px-6 text-text-muted">{inv.due_date}</td>
                <td className="py-4 px-6">
                  <span className={inv.days_overdue > 30 ? 'text-danger font-medium bg-danger/10 px-2 py-1 rounded-md' : inv.days_overdue > 0 ? 'text-warning font-medium bg-warning/10 px-2 py-1 rounded-md' : 'text-success'}>
                    {inv.days_overdue} days
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="capitalize text-sm font-medium text-text-muted border border-white/10 px-2 py-1 rounded-md">{inv.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
