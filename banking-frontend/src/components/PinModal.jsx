import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, X, Eye, EyeOff } from 'lucide-react';
import Spinner from './Spinner';

/**
 * PinModal — asks the user to enter their 4-digit transfer PIN.
 *
 * Props:
 *   isOpen      – boolean
 *   onClose     – called when user cancels
 *   onConfirm   – called with the entered PIN string when user submits
 *   loading     – shows a spinner on the confirm button
 *   error       – error string to display (wrong PIN, etc.)
 */
export default function PinModal({ isOpen, onClose, onConfirm, loading = false, error = '' }) {
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const inputRef = useRef(null);

  // Reset state every time modal opens
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setShow(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    onConfirm(pin);
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-fade-in">
        {/* Close */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon + title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7 text-primary-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Confirm Transfer</h2>
          <p className="text-slate-500 text-sm mt-1">Enter your 4-digit transfer PIN to proceed</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PIN input */}
          <div className="relative">
            <input
              ref={inputRef}
              type={show ? 'text' : 'password'}
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="• • • •"
              className={`input-field text-center text-2xl tracking-[0.6em] pr-10 font-mono ${
                error ? 'border-red-400 focus:ring-red-400' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600 text-center font-medium">{error}</p>
          )}

          {/* Dot indicators */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-150 ${
                  i < pin.length ? 'bg-primary-600 scale-110' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner size="sm" /> Verifying...</> : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
