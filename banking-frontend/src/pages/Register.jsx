import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/authApi';
import { savePin } from '../utils/pinUtils';
import { Building2, Eye, EyeOff, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    transferPin: '', confirmTransferPin: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // PIN fields: digits only, max 4
    if (name === 'transferPin' || name === 'confirmTransferPin') {
      setForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 4) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword ||
        !form.transferPin || !form.confirmTransferPin) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.transferPin.length !== 4) {
      toast.error('Transfer PIN must be exactly 4 digits');
      return;
    }
    if (form.transferPin !== form.confirmTransferPin) {
      toast.error('Transfer PINs do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      // Save hashed PIN locally — done after successful registration
      await savePin(form.transferPin);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed';
      toast.error(typeof msg === 'string' ? msg : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Digital Bank</h1>
          <p className="text-primary-200 text-sm mt-1">Secure. Smart. Simple.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Create your account</h2>
          <p className="text-slate-500 text-sm mb-6">Start banking smarter today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="John Doe" className="input-field pl-10" autoComplete="name" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" className="input-field pl-10" autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 6 characters" className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="Re-enter password" className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Transfer Security
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Transfer PIN */}
            <div>
              <label className="label">Transfer PIN</label>
              <p className="text-xs text-slate-400 mb-1.5">
                A 4-digit PIN you'll enter every time you send money
              </p>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPin ? 'text' : 'password'}
                  name="transferPin"
                  value={form.transferPin}
                  onChange={handleChange}
                  placeholder="• • • •"
                  inputMode="numeric"
                  maxLength={4}
                  className={`input-field pl-10 pr-10 text-center tracking-[0.5em] font-mono text-lg ${
                    form.transferPin.length > 0 && form.transferPin.length < 4 ? 'border-amber-400' : ''
                  }`}
                />
                <button type="button" onClick={() => setShowPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Dot indicators */}
              <div className="flex justify-center gap-3 mt-2">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${
                    i < form.transferPin.length ? 'bg-primary-600 scale-110' : 'bg-slate-200'
                  }`} />
                ))}
              </div>
            </div>

            {/* Confirm Transfer PIN */}
            <div>
              <label className="label">Confirm Transfer PIN</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirmPin ? 'text' : 'password'}
                  name="confirmTransferPin"
                  value={form.confirmTransferPin}
                  onChange={handleChange}
                  placeholder="• • • •"
                  inputMode="numeric"
                  maxLength={4}
                  className={`input-field pl-10 pr-10 text-center tracking-[0.5em] font-mono text-lg ${
                    form.confirmTransferPin.length === 4 && form.confirmTransferPin !== form.transferPin
                      ? 'border-red-400'
                      : form.confirmTransferPin.length === 4 && form.confirmTransferPin === form.transferPin
                      ? 'border-emerald-400'
                      : ''
                  }`}
                />
                <button type="button" onClick={() => setShowConfirmPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirmTransferPin.length === 4 && form.confirmTransferPin !== form.transferPin && (
                <p className="text-xs text-red-500 mt-1">PINs do not match</p>
              )}
              {form.confirmTransferPin.length === 4 && form.confirmTransferPin === form.transferPin && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> PINs match
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
