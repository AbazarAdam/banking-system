import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BarChart3, Users, CreditCard, History, Lock, Unlock, Snowflake, Flame, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminStats, getAdminUsers, updateUserRole, setUserLocked, resetUserPin,
  getAdminAccounts, addAdminBalance, setAccountFrozen, getAdminTransactions,
} from '../api/adminApi';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/accounts', label: 'Accounts', icon: CreditCard },
  { path: '/admin/transactions', label: 'Transactions', icon: History },
];

function ErrorState({ onRetry }) {
  return <div className="card text-center py-10"><p className="text-slate-500 mb-4">Could not load this view.</p><button className="btn-primary" onClick={onRetry}><RefreshCw className="w-4 h-4 inline mr-2" />Retry</button></div>;
}

function Dashboard({ refresh }) {
  const [stats, setStats] = useState(null);
  const load = () => {
    getAdminStats().then(({ data }) => setStats(data)).catch(() => setStats(false));
  };
  useEffect(() => {
    load();
  }, [refresh]);
  if (stats === false) return <ErrorState onRetry={load} />;
  if (!stats) return <div className="card">Loading statistics...</div>;
  const cards = [['Total users', stats.totalUsers], ['Accounts', stats.totalAccounts], ['Transactions', stats.totalTransactions], ['Total balance', `RM ${Number(stats.totalBalance).toLocaleString()}`], ['Locked users', stats.lockedUsers], ['Frozen accounts', stats.frozenAccounts]];
  return <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{cards.map(([label, value]) => <div className="card" key={label}><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-bold text-slate-800 mt-2">{value}</p></div>)}</div>;
}

function UsersView({ currentUser, refresh }) {
  const [users, setUsers] = useState(null);
  const load = () => {
    getAdminUsers().then(({ data }) => setUsers(data)).catch(() => setUsers(false));
  };
  useEffect(() => {
    load();
  }, [refresh]);
  const act = (promise) => promise.then(() => { toast.success('User updated'); load(); }).catch((error) => toast.error(error.response?.data?.message || 'Action failed'));
  if (users === false) return <ErrorState onRetry={load} />;
  if (!users) return <div className="card">Loading users...</div>;
  const isSuper = currentUser?.role?.toUpperCase() === 'SUPER_ADMIN';
  return <>{!isSuper && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Role changes are available only to SUPER_ADMIN.</div>}<div className="card overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-slate-400 border-b border-slate-100"><th className="py-3">User</th><th>Role</th><th>Status</th><th className="text-right">Actions</th></tr></thead><tbody>{users.map((user) => <tr className="border-b border-slate-50 last:border-0" key={user.id}><td className="py-4"><p className="font-semibold text-slate-800">{user.name}</p><p className="text-xs text-slate-400">{user.email} · #{user.id}</p></td><td><span className="badge">{user.role}</span></td><td>{user.locked ? <span className="text-red-600">Locked</span> : <span className="text-emerald-600">Active</span>}</td><td className="text-right space-x-2"><button title={user.locked ? 'Unlock user' : 'Lock user'} disabled={String(user.id) === String(currentUser?.id)} className="icon-button" onClick={() => act(setUserLocked(user.id, !user.locked))}>{user.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}</button>{isSuper && String(user.id) !== String(currentUser?.id) && <label className="inline-flex items-center gap-1 text-xs text-slate-500"><span>Change role</span><select aria-label={`Change role for ${user.email}`} className="input-field py-1.5 w-32" value={user.role} onChange={(e) => act(updateUserRole(user.id, e.target.value))}><option>USER</option><option>ADMIN</option><option>SUPER_ADMIN</option></select></label>}<button className="text-xs text-primary-700 hover:underline" onClick={() => { const pin = window.prompt('Enter a new 4-digit PIN, or cancel for a random PIN'); if (pin !== null) act(resetUserPin(user.id, pin)); }}>Reset PIN</button></td></tr>)}</tbody></table></div></>;
}

function AccountsView({ refresh }) {
  const [accounts, setAccounts] = useState(null);
  const load = () => {
    getAdminAccounts().then(({ data }) => setAccounts(data)).catch(() => setAccounts(false));
  };
  useEffect(() => {
    load();
  }, [refresh]);
  const act = (promise) => promise.then(() => { toast.success('Account updated'); load(); }).catch((error) => toast.error(error.response?.data?.message || 'Action failed'));
  if (accounts === false) return <ErrorState onRetry={load} />;
  if (!accounts) return <div className="card">Loading accounts...</div>;
  return <div className="card overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-slate-400 border-b border-slate-100"><th className="py-3">Account</th><th>Owner</th><th>Balance</th><th>Status</th><th className="text-right">Actions</th></tr></thead><tbody>{accounts.map((account) => <tr className="border-b border-slate-50 last:border-0" key={account.id}><td className="py-4"><p className="font-semibold">#{account.id}</p><p className="text-xs text-slate-400">{account.accountType} · {account.accountNumber}</p></td><td>{account.ownerName}<p className="text-xs text-slate-400">{account.ownerEmail}</p></td><td>RM {Number(account.balance || 0).toLocaleString()}</td><td>{account.frozen ? <span className="text-red-600">Frozen</span> : <span className="text-emerald-600">Open</span>}</td><td className="text-right"><button className="icon-button mr-2" title={account.frozen ? 'Unfreeze account' : 'Freeze account'} onClick={() => act(setAccountFrozen(account.id, !account.frozen))}>{account.frozen ? <Flame className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}</button><button className="text-xs text-primary-700 hover:underline" onClick={() => { const amount = Number(window.prompt('Amount to add')); if (amount > 0) act(addAdminBalance(account.id, amount, 'Admin adjustment')); }}>Add balance</button></td></tr>)}</tbody></table></div>;
}

function TransactionsView({ refresh }) {
  const [transactions, setTransactions] = useState(null);
  const [type, setType] = useState('');
  const load = () => {
    getAdminTransactions(type ? { type } : {}).then(({ data }) => setTransactions(data)).catch(() => setTransactions(false));
  };
  useEffect(() => {
    load();
  }, [refresh, type]);
  if (transactions === false) return <ErrorState onRetry={load} />;
  if (!transactions) return <div className="card">Loading transactions...</div>;
  return <div className="card overflow-x-auto"><div className="flex justify-end mb-4"><select className="input-field w-40" value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option><option>CREDIT</option><option>DEBIT</option><option>TRANSFER</option><option>ADMIN_ADJUSTMENT</option></select></div><table className="w-full text-left text-sm"><thead><tr className="text-slate-400 border-b border-slate-100"><th className="py-3">ID</th><th>Account</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead><tbody>{transactions.map((item) => <tr className="border-b border-slate-50 last:border-0" key={item.id}><td className="py-3">#{item.id}</td><td>#{item.accountId}</td><td><span className="badge">{item.transactionType}</span></td><td>RM {Number(item.amount).toLocaleString()}</td><td>{new Date(item.transactionDate).toLocaleString()}</td></tr>)}</tbody></table></div>;
}

export default function Admin() {
  const { user } = useAuth();
  const location = useLocation();
  const [refresh, setRefresh] = useState(0);
  const active = tabs.find((tab) => location.pathname === tab.path) || tabs[0];
  return <div className="max-w-7xl mx-auto space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Control centre</p><h1 className="text-3xl font-bold text-slate-800 mt-1">Admin panel</h1><p className="text-slate-500 text-sm mt-1">Monitor and manage the banking system.</p></div><button className="icon-button" title="Refresh" onClick={() => setRefresh((value) => value + 1)}><RefreshCw className="w-4 h-4" /></button></div><nav className="flex gap-2 overflow-x-auto border-b border-slate-200">{tabs.map((tab) => <NavLink key={tab.path} to={tab.path} className={({ isActive }) => `flex items-center gap-2 px-3 py-3 text-sm font-semibold whitespace-nowrap border-b-2 ${isActive ? 'text-primary-700 border-primary-600' : 'text-slate-500 border-transparent'}`}><tab.icon className="w-4 h-4" />{tab.label}</NavLink>)}</nav>{active.path === '/admin/dashboard' && <Dashboard refresh={refresh} />}{active.path === '/admin/users' && <UsersView currentUser={user} refresh={refresh} />}{active.path === '/admin/accounts' && <AccountsView refresh={refresh} />}{active.path === '/admin/transactions' && <TransactionsView refresh={refresh} />}</div>;
}
