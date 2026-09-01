import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccount } from '../context/AccountContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Shield, CreditCard, Wallet, LogOut, Lock,
  Eye, EyeOff, CheckCircle, KeyRound, ChevronRight, X,
} from 'lucide-react';
import { savePin, verifyPin, hasPin } from '../utils/pinUtils';
import toast from 'react-hot-toast';

// ── small reusable PIN input ─────────────────────────────────────────────────
function PinField({ label, name, value, onChange, show, onToggleShow }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          inputMode="numeric"
          name={name}
          maxLength={4}
          value={value}
          onChange={onChange}
          placeholder="• • • •"
          className="input-field text-center text-xl tracking-[0.5em] pr-10 font-mono"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── animated dot indicator ───────────────────────────────────────────────────
function PinDots({ length }) {
  return (
    <div className="flex justify-center gap-3 my-1">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${
            i < length ? 'bg-primary-600 scale-110' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────
export default function Profile() {
  const { user, logout } = useAuth();
  const { account, clearAccount } = useAccount();
  const navigate = useNavigate();

  // PIN change flow: idle | verify | newPin | confirm
  const [pinStep, setPinStep] = useState('idle');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinExists] = useState(hasPin());

  const handleLogout = () => {
    logout();
    clearAccount();
    navigate('/login');
  };

  const resetPinFlow = () => {
    setPinStep('idle');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  // digits-only handler factory
  const digitHandler = (setter) => (e) =>
    setter(e.target.value.replace(/\D/g, '').slice(0, 4));

  // Step 1 — verify current PIN (skip if no PIN exists yet)
  const handleVerifyCurrent = async () => {
    if (!pinExists) { setPinStep('newPin'); return; }
    if (currentPin.length !== 4) { toast.error('Enter your 4-digit current PIN'); return; }
    setPinLoading(true);
    const ok = await verifyPin(currentPin);
    setPinLoading(false);
    if (!ok) { toast.error('Incorrect PIN. Please try again.'); setCurrentPin(''); return; }
    setPinStep('newPin');
  };

  // Step 2 — validate new PIN length
  const handleSetNew = () => {
    if (newPin.length !== 4) { toast.error('New PIN must be exactly 4 digits'); return; }
    setPinStep('confirm');
  };

  // Step 3 — confirm & save
  const handleConfirm = async () => {
    if (confirmPin !== newPin) { toast.error('PINs do not match'); setConfirmPin(''); return; }
    setPinLoading(true);
    await savePin(newPin);
    setPinLoading(false);
    toast.success(pinExists ? 'Transfer PIN updated!' : 'Transfer PIN set!');
    resetPinFlow();
  };

  // ── profile data ─────────────────────────────────────────────────────────
  const userFields = [
    { icon: User,   label: 'Full Name',     value: user?.name },
    { icon: Mail,   label: 'Email Address', value: user?.email },
    { icon: Shield, label: 'Role',          value: user?.role },
    { icon: User,   label: 'User ID',       value: user?.id, mono: true },
  ];

  const accountFields = account
    ? [
        { icon: CreditCard, label: 'Account Type',   value: account.accountType },
        { icon: Wallet,     label: 'Balance',         value: `RM ${(account.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
        { icon: CreditCard, label: 'Account Number', value: account.accountNumber, mono: true },
        { icon: CreditCard, label: 'Account ID',     value: account.accountId,     mono: true },
      ]
    : [];

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your personal and account details</p>
      </div>

      {/* Avatar card */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
          <span className="text-primary-700 font-bold text-2xl">
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{user?.name ?? '—'}</h2>
          <p className="text-slate-500 text-sm">{user?.email ?? '—'}</p>
          <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full capitalize">
            {user?.role?.toLowerCase() ?? 'user'}
          </span>
          {user?.locked && <p className="text-xs text-red-600 mt-2">This account is locked.</p>}
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto btn-danger flex items-center gap-2 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <button onClick={() => navigate('/admin/dashboard')} className="ml-2 btn-primary flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            Admin Panel
          </button>
        )}
      </div>

      {/* Personal info */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
          Personal Information
        </h3>
        <div className="space-y-3">
          {userFields.map(({ icon: Icon, label, value, mono }) => (
            <div key={label} className="card flex items-center gap-4 py-4">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400">{label}</p>
                <p className={`text-sm font-semibold text-slate-800 break-all ${mono ? 'font-mono' : ''}`}>
                  {value ?? '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account info */}
      {account && (
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
            Account Information
          </h3>
          <div className="space-y-3">
            {accountFields.map(({ icon: Icon, label, value, mono }) => (
              <div key={label} className="card flex items-center gap-4 py-4">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className={`text-sm font-semibold text-slate-800 break-all ${mono ? 'font-mono' : ''}`}>
                    {value ?? '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Security / Transfer PIN ──────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
          Security
        </h3>

        {/* idle — show current PIN status + change button */}
        {pinStep === 'idle' && (
          <div className="card flex items-center gap-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400">Transfer PIN</p>
              <p className="text-sm font-semibold text-slate-800">
                {pinExists ? '••••  (configured)' : 'Not set'}
              </p>
            </div>
            <button
              onClick={() => setPinStep(pinExists ? 'verify' : 'newPin')}
              className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors shrink-0"
            >
              <KeyRound className="w-4 h-4" />
              {pinExists ? 'Change' : 'Set PIN'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step: verify current PIN */}
        {pinStep === 'verify' && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary-600" />
                Verify Current PIN
              </h4>
              <button onClick={resetPinFlow} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-500 text-sm">Enter your existing transfer PIN to continue.</p>
            <PinField
              label="Current PIN"
              name="currentPin"
              value={currentPin}
              onChange={digitHandler(setCurrentPin)}
              show={showCurrent}
              onToggleShow={() => setShowCurrent((v) => !v)}
            />
            <PinDots length={currentPin.length} />
            <div className="flex gap-3 pt-1">
              <button onClick={resetPinFlow} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleVerifyCurrent}
                disabled={pinLoading || currentPin.length !== 4}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {pinLoading ? 'Verifying…' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step: enter new PIN */}
        {pinStep === 'newPin' && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary-600" />
                New Transfer PIN
              </h4>
              <button onClick={resetPinFlow} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-500 text-sm">Choose a new 4-digit PIN for transfers.</p>
            <PinField
              label="New PIN"
              name="newPin"
              value={newPin}
              onChange={digitHandler(setNewPin)}
              show={showNew}
              onToggleShow={() => setShowNew((v) => !v)}
            />
            <PinDots length={newPin.length} />
            <div className="flex gap-3 pt-1">
              <button onClick={resetPinFlow} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleSetNew}
                disabled={newPin.length !== 4}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step: confirm new PIN */}
        {pinStep === 'confirm' && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Confirm New PIN
              </h4>
              <button onClick={resetPinFlow} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-500 text-sm">Re-enter your new PIN to confirm.</p>
            <PinField
              label="Confirm PIN"
              name="confirmPin"
              value={confirmPin}
              onChange={digitHandler(setConfirmPin)}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)}
            />
            <PinDots length={confirmPin.length} />
            {confirmPin.length === 4 && confirmPin !== newPin && (
              <p className="text-red-500 text-xs -mt-1">PINs do not match</p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setPinStep('newPin'); setConfirmPin(''); }}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={pinLoading || confirmPin.length !== 4 || confirmPin !== newPin}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {pinLoading ? 'Saving…' : 'Save PIN'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
