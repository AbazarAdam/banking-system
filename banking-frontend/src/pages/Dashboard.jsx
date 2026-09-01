import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccount } from '../context/AccountContext';
import { getBalance, createAccount } from '../api/accountApi';
import { getAnalytics } from '../api/transactionApi';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import {
  Wallet,
  ArrowLeftRight,
  History,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, userId } = useAuth();
  const { account, accountLoading, saveAccount, refreshBalance } = useAccount();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [creating, setCreating] = useState(false);
  const [accountType, setAccountType] = useState('SAVINGS');

  useEffect(() => {
    if (!account) return;
    setLoadingBalance(true);
    Promise.all([
      getBalance(account.accountId),
      getAnalytics(account.accountId),
    ])
      .then(([balRes, analyticsRes]) => {
        setBalance(balRes.data.balance);
        setAnalytics(analyticsRes.data);
        saveAccount({ ...account, balance: balRes.data.balance });
      })
      .catch(() => {})
      .finally(() => setLoadingBalance(false));
  }, [account?.accountId]);

  const handleCreateAccount = async () => {
    setCreating(true);
    try {
      const res = await createAccount(userId, { accountType });
      saveAccount(res.data);
      toast.success('Account created successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to create account';
      toast.error(typeof msg === 'string' ? msg : 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const quickActions = [
    {
      icon: ArrowLeftRight,
      label: 'Transfer Money',
      desc: 'Send funds instantly',
      color: 'bg-primary-50 text-primary-600',
      path: '/transfer',
    },
    {
      icon: History,
      label: 'Transactions',
      desc: 'View your history',
      color: 'bg-emerald-50 text-emerald-600',
      path: '/transactions',
    },
    {
      icon: CreditCard,
      label: 'Account Details',
      desc: 'View account info',
      color: 'bg-violet-50 text-violet-600',
      path: '/accounts',
    },
  ];

  if (accountLoading && !account) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-primary-200 text-sm font-medium">Welcome,</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name ?? 'Welcome back!'} !!</h1>
        <p className="text-primary-200 text-sm mt-1">{user?.email}</p>
      </div>

      {/* No account state */}
      {!account ? (
        <div className="card flex flex-col items-center py-12 text-center gap-4">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">No account yet</h2>
            <p className="text-slate-500 text-sm mt-1">
              Choose an account type to get started
            </p>
          </div>
          <div className="w-full max-w-xs space-y-3">
            <div>
              <label className="label">Account Type</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="input-field"
              >
                <option value="SAVINGS">Savings Account</option>
                <option value="CURRENT">Current Account</option>
              </select>
            </div>
            <button
              onClick={handleCreateAccount}
              disabled={creating}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Creating...
                </span>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Create Account
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={Wallet}
              label="Account Balance"
              value={
                loadingBalance
                  ? '...'
                  : `RM ${(balance ?? account.balance ?? 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}`
              }
              subtext={`A/C: ${account.accountNumber?.slice(-8) ?? '—'}`}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Credits"
              value={
                analytics
                  ? `RM ${analytics.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : '—'
              }
              subtext="All time deposits"
              color="green"
            />
            <StatCard
              icon={TrendingDown}
              label="Total Debits"
              value={
                analytics
                  ? `RM ${analytics.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : '—'
              }
              subtext="All time withdrawals"
              color="red"
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickActions.map(({ icon: Icon, label, desc, color, path }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="card flex items-center gap-4 text-left hover:shadow-md hover:border-primary-100 transition-all duration-200 group"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 text-sm">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Account info strip */}
          <div className="card flex flex-wrap items-center gap-x-8 gap-y-3">
            <div>
              <p className="text-xs text-slate-400">Account Type</p>
              <p className="text-sm font-semibold text-slate-700 capitalize">
                {account.accountType?.toLowerCase() ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Account Number</p>
              <p className="text-sm font-semibold text-slate-700 font-mono">
                {account.accountNumber ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Account ID</p>
              <p className="text-sm font-semibold text-slate-700 font-mono">
                {account.accountId ?? '—'}
              </p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Active
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
