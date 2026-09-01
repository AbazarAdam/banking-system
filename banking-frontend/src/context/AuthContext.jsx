import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getUser } from '../api/userApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [userId, setUserId] = useState(() => localStorage.getItem('userId'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Callback refs so AuthContext doesn't need to import AccountContext (avoids circular deps)
  const rehydrateAccountRef = useRef(null);
  const clearAccountRef = useRef(null);

  const registerRehydrate = useCallback((fn) => {
    rehydrateAccountRef.current = fn;
  }, []);

  const registerClearAccount = useCallback((fn) => {
    clearAccountRef.current = fn;
  }, []);

  const fetchUser = useCallback(async (id) => {
    try {
      const res = await getUser(id);
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token && userId) {
      fetchUser(userId);
    } else {
      setLoading(false);
    }
  }, [token, userId, fetchUser]);

  const loginSuccess = useCallback(async (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    setToken(data.token);
    setUserId(data.userId);
    if (data.role) {
      setUser((current) => ({ ...(current ?? {}), role: data.role }));
    }
    // Rehydrate existing account after login
    if (rehydrateAccountRef.current) {
      await rehydrateAccountRef.current();
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setToken(null);
    setUserId(null);
    setUser(null);
    // Clear account state in AccountContext
    if (clearAccountRef.current) {
      clearAccountRef.current();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, userId, user, loading, loginSuccess, logout, fetchUser, registerRehydrate, registerClearAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
