import { useState, useEffect } from 'react';
import Button from '../components/Button';
import { Plus, Loader2, AlertCircle, Play } from 'lucide-react';
import { getInvoices, createInvoice, runPipeline } from '../services/invoices';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipelineLoadingId, setPipelineLoadingId] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err.message || 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getInvoices();
        if (active) {
          setInvoices(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load invoices.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const calculateDaysOverdue = (dueDateStr) => {
    if (!dueDateStr) return 0;
    const due = new Date(dueDateStr);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const customer_name = formData.get('customer_name');
    const amount = parseFloat(formData.get('amount'));
    const due_date = formData.get('due_date');
    const source = formData.get('source');
    const days_overdue = calculateDaysOverdue(due_date);

    try {
      const newInvoice = await createInvoice({
        customer_name,
        amount,
        due_date: new Date(due_date).toISOString(),
        days_overdue,
        source,
      });
      setInvoices((prev) => [newInvoice, ...prev]);
      setShowModal(false);
      toast.success('Invoice created successfully!');
    } catch (err) {
      toast.error(`Failed to create invoice: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunPipeline = async (id) => {
    setPipelineLoadingId(id);
    const toastId = toast.loading('Running classification pipeline...');
    try {
      await runPipeline(id);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === id ? { ...inv, status: 'processed' } : inv
        )
      );
      toast.success('Pipeline completed! Email draft generated.', { id: toastId });
    } catch (err) {
      toast.error(`Failed to run pipeline: ${err.message || err}`, { id: toastId });
    } finally {
      setPipelineLoadingId(null);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-warning/20 text-warning border border-warning/30';
      case 'processed':
        return 'bg-primary/20 text-primary border border-primary/30';
      case 'sent':
        return 'bg-success/20 text-success border border-success/30';
      default:
        return 'bg-white/10 text-text-muted border border-white/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-text-muted text-lg">Loading invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/5 border border-danger/20 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-6">
        <div className="flex justify-center text-danger">
          <AlertCircle size={48} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-text">Failed to load invoices</h3>
          <p className="text-text-muted">{error}</p>
        </div>
        <Button onClick={fetchInvoices} variant="secondary" className="mx-auto px-6">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-text-muted mt-1">Overview of all invoices and their status.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus size={18} />
          New Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-20 flex flex-col items-center justify-center text-center bg-gradient-to-b from-surface/50 to-surface">
          <h3 className="text-2xl font-bold mb-2">No invoices found</h3>
          <p className="text-text-muted mb-6">Create your first invoice to start managing your accounts receivable.</p>
          <Button onClick={() => setShowModal(true)}>
            Create your first invoice
          </Button>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-text-muted text-sm border-b border-white/5">
                <th className="py-4 px-6 font-medium">Customer</th>
                <th className="py-4 px-6 font-medium">Amount</th>
                <th className="py-4 px-6 font-medium">Due Date</th>
                <th className="py-4 px-6 font-medium">Overdue (Days)</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-medium text-text">{inv.customer_name}</td>
                  <td className="py-4 px-6">${inv.amount.toFixed(2)}</td>
                  <td className="py-4 px-6 text-text-muted">
                    {new Date(inv.due_date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={
                        inv.days_overdue > 30
                          ? 'text-danger font-medium bg-danger/10 px-2 py-1 rounded-md'
                          : inv.days_overdue > 0
                          ? 'text-warning font-medium bg-warning/10 px-2 py-1 rounded-md'
                          : 'text-success'
                      }
                    >
                      {inv.days_overdue} days
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusBadgeStyle(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {inv.status === 'pending' ? (
                      <Button
                        variant="primary"
                        onClick={() => handleRunPipeline(inv.id)}
                        disabled={pipelineLoadingId === inv.id}
                        className="text-xs py-1.5 px-3 bg-primary/20 text-primary hover:bg-primary border border-primary/30 ml-auto gap-1"
                      >
                        <Play size={12} />
                        {pipelineLoadingId === inv.id ? 'Running...' : 'Run Pipeline'}
                      </Button>
                    ) : (
                      <span className="text-xs text-text-muted capitalize italic mr-4">
                        {inv.status === 'processed' ? 'in review' : 'completed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-xl font-bold">New Invoice</h3>
              <p className="text-text-muted text-xs mt-1">Fill in the details to record a new invoice.</p>
            </div>
            <form onSubmit={handleCreateInvoice}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-1 block">Customer Name</label>
                  <input
                    required
                    type="text"
                    name="customer_name"
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-background border border-white/5 rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-1 block">Amount ($)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="amount"
                      placeholder="0.00"
                      className="w-full bg-background border border-white/5 rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-1 block">Due Date</label>
                    <input
                      required
                      type="date"
                      name="due_date"
                      className="w-full bg-background border border-white/5 rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-1 block">Source</label>
                  <select
                    name="source"
                    defaultValue="manual"
                    className="w-full bg-background border border-white/5 rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  >
                    <option value="manual">Manual</option>
                    <option value="csv">CSV Upload</option>
                    <option value="ocr">OCR Scan</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm"
                >
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

