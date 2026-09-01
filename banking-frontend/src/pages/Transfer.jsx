import { useState } from 'react';
import { useAccount } from '../context/AccountContext';
import { transfer } from '../api/transactionApi';
import { ArrowLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Spinner from '../components/Spinner';
import PinModal from '../components/PinModal';
import { hasPin, verifyPin } from '../utils/pinUtils';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Transfer() {
  const { account, accountLoading, refreshBalance } = useAccount();
  const navigate = useNavigate();

  const [form, setForm] = useState({ toAccountId: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // 'success' | 'error'

  // PIN modal state
  const [pinOpen, setPinOpen] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  // Holds the validated form data while PIN modal is open
  const [pendingTransfer, setPendingTransfer] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Step 1: validate form, then open PIN modal
  const handleSubmit = (e) => {
    e.preventDefault();
    setResult(null);

    if (!account) { toast.error('You need an account to transfer funds'); return; }
    if (!form.toAccountId.trim()) { toast.error('Please enter a receiver account ID'); return; }
    if (form.toAccountId.trim() === account.accountId) { toast.error('Cannot transfer to the same account'); return; }

    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    if (amount > (account.balance ?? 0)) { toast.error('Insufficient balance'); return; }

    // If no PIN set yet, redirect to Profile to create one
    if (!hasPin()) {
      toast.error('Please set a transfer PIN in your Profile before sending money');
      navigate('/profile');
      return;
    }

    // All good – open PIN confirmation modal
    setPendingTransfer({ toAccountId: form.toAccountId.trim(), amount, description: form.description.trim() });
    setPinError('');
    setPinOpen(true);
  };

  // Step 2: verify PIN then execute transfer
  const handlePinConfirm = async (enteredPin) => {
    setPinLoading(true);
    setPinError('');

    const valid = await verifyPin(enteredPin);
    if (!valid) {
      setPinError('Incorrect PIN. Please try again.');
      setPinLoading(false);
      return;
    }

    // PIN correct — close modal and execute transfer
    setPinOpen(false);
    setPinLoading(false);
    setLoading(true);

    try {
      await transfer(account.accountId, pendingTransfer.toAccountId, pendingTransfer.amount, pendingTransfer.description);
      await refreshBalance();
      setResult('success');
      toast.success('Transfer successful!');
      setForm({ toAccountId: '', amount: '', description: '' });
      setPendingTransfer(null);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        'Transfer failed. Check receiver account ID and your balance.';
      setResult('error');
      toast.error(typeof msg === 'string' ? msg : 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  if (accountLoading && !account) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Transfer Money</h1>
        <p className="text-slate-500 text-sm mt-0.5">Send funds to another account instantly</p>
      </div>

      {/* No account warning */}
      {!account && (
        <div className="card flex items-start gap-3 border-amber-200 bg-amber-50">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            You don&apos;t have an account yet. Please create one from the Accounts page.
          </p>
        </div>
      )}

      {/* Balance chip */}
      {account && (
        <div className="flex items-center gap-3">
          <div className="card flex items-center gap-3 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Available Balance</p>
              <p className="text-sm font-bold text-slate-800">
                RM {(account.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="card space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* From account (read-only) */}
          <div>
            <label className="label">From Account</label>
            <input
              type="text"
              value={account ? account.accountId : 'No account'}
              readOnly
              className="input-field bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* To account */}
          <div>
            <label className="label">Receiver Account ID</label>
            <input
              type="text"
              name="toAccountId"
              value={form.toAccountId}
              onChange={handleChange}
              placeholder="Enter receiver's account ID"
              className="input-field font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">
              Enter the exact Account ID of the recipient
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                RM
              </span>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="  0.00"
                min="0.01"
                step="0.01"
                className="input-field pl-7"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (optional)</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Rent payment"
              className="input-field"
            />
          </div>

          {/* Result notification inline */}
          {result === 'success' && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">Transfer completed successfully!</p>
            </div>
          )}
          {result === 'error' && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700 font-medium">Transfer failed. Please try again.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !account}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Spinner size="sm" /> Processing...</>
            ) : (
              <><ArrowLeftRight className="w-4 h-4" /> Transfer Funds</>
            )}
          </button>
        </form>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 text-xs text-slate-400">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>
          Transfers are processed immediately. Make sure the receiver Account ID is correct before
          submitting.
        </p>
      </div>

      {/* PIN confirmation modal */}
      <PinModal
        isOpen={pinOpen}
        onClose={() => { setPinOpen(false); setPendingTransfer(null); }}
        onConfirm={handlePinConfirm}
        loading={pinLoading}
        error={pinError}
      />
    </div>
  );
}
