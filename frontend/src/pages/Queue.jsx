import { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { Check, Edit2, X, Send, Loader2, AlertCircle, Save } from 'lucide-react';
import { getPendingDrafts, approveDraft, rejectDraft } from '../services/emails';
import { toast } from 'react-hot-toast';

function DraftViewer({ activeDraft, onApprove, onReject, actionInProgress }) {
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState(activeDraft.subject);
  const [body, setBody] = useState(activeDraft.body);

  const handleToggleEdit = () => {
    if (isEditing) {
      setIsEditing(false);
      toast.success('Draft text updated locally.');
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className="bg-surface rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl animate-in fade-in duration-350">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.03] to-transparent">
        <div>
          <h2 className="text-2xl font-bold text-text">
            {activeDraft.invoice?.customer_name || 'Unknown Customer'}
          </h2>
          <p className="text-sm text-text-muted mt-1 flex items-center gap-2">
            <span className="font-medium">${activeDraft.invoice?.amount?.toFixed(2) || '0.00'}</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span className="text-warning">
              {activeDraft.invoice?.days_overdue || 0} days overdue
            </span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge severity={activeDraft.severity} />
          <span className="text-xs text-text-muted font-medium bg-background px-2.5 py-1 rounded-md border border-white/5">
            Action: {activeDraft.action}
          </span>
        </div>
      </div>

      <div className="p-8 space-y-6 flex-1 bg-background/50">
        <div>
          <label className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-2 block ml-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            readOnly={!isEditing}
            className={`w-full border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium shadow-inner ${
              isEditing
                ? 'bg-surface border-primary/50'
                : 'bg-surface border-white/5'
            }`}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-2 block ml-1">Message Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            readOnly={!isEditing}
            rows={8}
            className={`w-full border rounded-xl px-4 py-4 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none leading-relaxed shadow-inner ${
              isEditing
                ? 'bg-surface border-primary/50'
                : 'bg-surface border-white/5'
            }`}
          />
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-surface flex items-center justify-between">
        <Button
          variant="danger"
          disabled={actionInProgress}
          onClick={() => onReject(activeDraft.id)}
          className="gap-2 bg-transparent border border-danger/30 text-danger hover:bg-danger/10 shadow-none px-5"
        >
          <X size={18} />
          Reject
        </Button>
        <div className="flex gap-4">
          <Button
            variant="secondary"
            disabled={actionInProgress}
            onClick={handleToggleEdit}
            className="gap-2 px-6"
          >
            {isEditing ? (
              <>
                <Save size={18} className="text-success animate-pulse" />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 size={18} />
                Edit Draft
              </>
            )}
          </Button>
          <Button
            variant="primary"
            disabled={actionInProgress}
            onClick={() => onApprove(activeDraft.id)}
            className="gap-2 px-6"
          >
            <Send size={18} />
            Approve & Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Queue() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getPendingDrafts('pending');
        if (active) {
          setDrafts(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load drafts.');
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

  const handleApprove = async (draftId) => {
    const currentDraft = drafts.find((d) => d.id === draftId);
    if (!currentDraft) return;

    const confirmed = window.confirm(
      `Are you sure you want to approve and send this email to ${
        currentDraft.invoice?.customer_name || 'the customer'
      }?`
    );
    if (!confirmed) return;

    setActionInProgress(true);
    const toastId = toast.loading('Sending email draft...');
    try {
      await approveDraft(draftId);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      toast.success('Draft approved and email sent!', { id: toastId });
    } catch (err) {
      toast.error(`Failed to approve draft: ${err.message || err}`, { id: toastId });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReject = async (draftId) => {
    setActionInProgress(true);
    const toastId = toast.loading('Rejecting email draft...');
    try {
      await rejectDraft(draftId);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      toast.success('Draft rejected.', { id: toastId });
    } catch (err) {
      toast.error(`Failed to reject draft: ${err.message || err}`, { id: toastId });
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-text-muted text-lg">Loading review queue...</p>
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
          <h3 className="text-2xl font-bold text-text">Failed to load drafts</h3>
          <p className="text-text-muted">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="secondary" className="mx-auto px-6">
          Retry Connection
        </Button>
      </div>
    );
  }

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

      <DraftViewer
        key={activeDraft.id}
        activeDraft={activeDraft}
        onApprove={handleApprove}
        onReject={handleReject}
        actionInProgress={actionInProgress}
      />
    </div>
  );
}
