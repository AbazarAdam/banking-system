import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getBalance, getAccountByUser } from '../api/accountApi';
import { useAuth } from './AuthContext';

const AccountContext = createContext(null);

export function AccountProvider({ children }) {
  const { userId, registerRehydrate, registerClearAccount } = useAuth();
  const [account, setAccount] = useState(() => {
    try {
      const saved = localStorage.getItem('account');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [accountLoading, setAccountLoading] = useState(false);

  const saveAccount = useCallback((acc) => {
    localStorage.setItem('account', JSON.stringify(acc));
    if (acc?.accountId) {
      localStorage.setItem('accountId', acc.accountId);
    }
    setAccount(acc);
  }, []);

  // Reload the account from its owner after every login, even when logout cleared local storage.
  useEffect(() => {
    if (!userId) {
      setAccount(null);
      setAccountLoading(false);
      return undefined;
    }

    let active = true;
    setAccountLoading(true);
    getAccountByUser(userId)
      .then((res) => {
        if (active) saveAccount(res.data);
      })
      .catch((err) => {
        if (active && err.response?.status === 404) {
          localStorage.removeItem('account');
          localStorage.removeItem('accountId');
          setAccount(null);
        }
      })
      .finally(() => {
        if (active) setAccountLoading(false);
      });

    return () => { active = false; };
  }, [userId, saveAccount]);

  // Called after login to rehydrate account from stored accountId
  const rehydrateAccount = useCallback(async () => {
    const accountId = localStorage.getItem('accountId');
    const userId = localStorage.getItem('userId');
    if (!userId) return false;

    setAccountLoading(true);
    try {
      const res = await getAccountByUser(userId);
      saveAccount(res.data);
      return true;
    } catch (err) {
      if (err.response?.status === 404) {
        localStorage.removeItem('account');
        localStorage.removeItem('accountId');
        setAccount(null);
      }
      return false;
    } finally {
      setAccountLoading(false);
    }
  }, [saveAccount]);

  const refreshBalance = useCallback(async () => {
    if (!account?.accountId) return;
    try {
      const res = await getBalance(account.accountId);
      const updated = { ...account, balance: res.data.balance };
      saveAccount(updated);
    } catch {
      // ignore
    }
  }, [account, saveAccount]);

  const clearAccount = useCallback(() => {
    localStorage.removeItem('account');
    localStorage.removeItem('accountId');
    setAccount(null);
  }, []);

  // Register callbacks with AuthContext so login/logout can trigger them
  useEffect(() => {
    registerRehydrate(rehydrateAccount);
  }, [registerRehydrate, rehydrateAccount]);

  useEffect(() => {
    registerClearAccount(clearAccount);
  }, [registerClearAccount, clearAccount]);

  return (
    <AccountContext.Provider
      value={{ account, accountLoading, saveAccount, rehydrateAccount, refreshBalance, clearAccount }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
