import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccount } from '../context/AccountContext';
import { getBalance, createAccount } from '../api/accountApi';
import { CreditCard, RefreshCw, Plus, Wallet } from 'lucide-react';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

export default function Accounts() {
  const { userId } = useAuth();
  const { account, accountLoading, saveAccount, refreshBalance } = useAccount();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [accountType, setAccountType] = useState('SAVINGS');

  useEffect(() => {
    if (!account) return;
    setLoading(true);
    getBalance(account.accountId)
      .then((res) => saveAccount({ ...account, balance: res.data.balance }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    if (!account) return;
    setRefreshing(true);
    try {
      await refreshBalance();
      toast.success('Balance updated');
    } catch {
      toast.error('Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await createAccount(userId, { accountType });
      saveAccount(res.data);
      toast.success('Account created successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed';
      toast.error(typeof msg === 'string' ? msg : 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  if (loading || (accountLoading && !account)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Accounts</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your bank accounts</p>
        </div>
        {account && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        )}
      </div>

      {/* Account card */}
      {account ? (
        <div className="bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          {/* decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-12 -right-4 w-56 h-56 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary-200" />
                <span className="text-primary-200 text-sm font-medium capitalize">
                  {account.accountType?.toLowerCase()} Account
                </span>
              </div>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
                Active
              </span>
            </div>

            <p className="text-primary-200 text-xs mb-1">Current Balance</p>
            <p className="text-4xl font-bold tracking-tight mb-6">
              RM {(account.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>

            <div className="border-t border-white/20 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-primary-200 text-xs mb-1">Account Number</p>
                <p className="text-white font-mono text-sm break-all">{account.accountNumber}</p>
              </div>
              <div>
                <p className="text-primary-200 text-xs mb-1">Account ID</p>
                <p className="text-white font-mono text-sm break-all">{account.accountId}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No account – create form */
        <div className="card flex flex-col items-center py-12 text-center gap-5">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">No account found</h2>
            <p className="text-slate-500 text-sm mt-1">Create a bank account to get started</p>
          </div>
          <div className="w-full max-w-xs space-y-3">
            <div>
              <label className="label">Account Type</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="input-field"
              >
                <option value="SAVINGS">Savings</option>
                <option value="CURRENT">Current</option>
              </select>
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {creating ? (
                <><Spinner size="sm" /> Creating...</>
              ) : (
                <><Plus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Details grid */}
      {account && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Account Type', value: account.accountType },
            { label: 'Status', value: 'Active' },
            { label: 'Account Number', value: account.accountNumber, mono: true },
            { label: 'Account ID', value: account.accountId, mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label} className="card">
              <p className="text-xs text-slate-400 mb-1">{label}</p>
              <p className={`text-sm font-semibold text-slate-800 break-all ${mono ? 'font-mono' : ''}`}>
                {value ?? '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
