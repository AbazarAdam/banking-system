// PIN is stored as a SHA-256 hash so it's never saved as plain text in localStorage

const PIN_KEY = 'txn_pin_hash';

async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function savePin(pin) {
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_KEY, hash);
}

export async function verifyPin(pin) {
  const stored = localStorage.getItem(PIN_KEY);
  if (!stored) return false;
  const hash = await hashPin(pin);
  return hash === stored;
}

export function hasPin() {
  return !!localStorage.getItem(PIN_KEY);
}

export function clearPin() {
  localStorage.removeItem(PIN_KEY);
}
