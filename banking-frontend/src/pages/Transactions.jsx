import { useEffect, useState, useMemo } from 'react';
import { useAccount } from '../context/AccountContext';
import { getTransactionsByAccount } from '../api/transactionApi';
import { History, Search, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import Spinner from '../components/Spinner';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Transactions() {
  const { account, accountLoading } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL | CREDIT | DEBIT

  useEffect(() => {
    if (!account?.accountId) return;
    setLoading(true);
    getTransactionsByAccount(account.accountId)
      .then((res) => setTransactions(res.data ?? []))
      .catch(() => setError('Failed to load transactions'))
      .finally(() => setLoading(false));
  }, [account?.accountId]);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => (filter === 'ALL' ? true : t.transactionType === filter))
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          t.id?.toLowerCase().includes(q) ||
          t.accountId?.toLowerCase().includes(q) ||
          t.amount?.toString().includes(q)
        );
      })
      .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
  }, [transactions, filter, search]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your complete transaction history</p>
      </div>

      {/* No account */}
      {accountLoading && !account && <div className="card flex justify-center py-10"><Spinner /></div>}

      {!accountLoading && !account && (
        <div className="card flex items-start gap-3 border-amber-200 bg-amber-50">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            No account found. Create an account from the Accounts page first.
          </p>
        </div>
      )}

      {account && (
        <>
          {/* Filters + search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, account or amount..."
                className="input-field pl-9"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'CREDIT', 'DEBIT'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors duration-150 ${
                    filter === f
                      ? f === 'CREDIT'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : f === 'DEBIT'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Stats mini */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center py-4">
              <p className="text-2xl font-bold text-slate-800">{transactions.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Total</p>
            </div>
            <div className="card text-center py-4">
              <p className="text-2xl font-bold text-emerald-600">
                {transactions.filter((t) => t.transactionType === 'CREDIT').length}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Credits</p>
            </div>
            <div className="card text-center py-4">
              <p className="text-2xl font-bold text-red-500">
                {transactions.filter((t) => t.transactionType === 'DEBIT').length}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Debits</p>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner />
            </div>
          ) : error ? (
            <div className="card flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card flex flex-col items-center py-12 text-center gap-3">
              <History className="w-10 h-10 text-slate-300" />
              <p className="text-slate-500 text-sm">
                {transactions.length === 0
                  ? 'No transactions yet'
                  : 'No transactions match your filters'}
              </p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">
                        Transaction ID
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">
                        Account
                      </th>
                      <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">
                        Amount
                      </th>
                      <th className="text-center text-xs font-semibold text-slate-500 px-4 py-3">
                        Type
                      </th>
                      <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50 transition-colors duration-100"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 max-w-[140px] truncate">
                          {tx.id}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600 max-w-[140px] truncate">
                          {tx.accountId}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <span
                            className={
                              tx.transactionType === 'CREDIT'
                                ? 'text-emerald-600'
                                : 'text-red-500'
                            }
                          >
                            {tx.transactionType === 'CREDIT' ? '+' : '-'}RM{' '}
                            {tx.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tx.transactionType === 'CREDIT'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-600'
                            }`}
                          >
                            {tx.transactionType === 'CREDIT' ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(tx.transactionDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-400">
                  Showing {filtered.length} of {transactions.length} transactions
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
