import api from './axiosInstance';
import axios from 'axios';

// /transactions lives outside the /api prefix and is proxied by Vite in development.
const TRANSACTIONS_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/transactions`
  : '/transactions';

const transactionsApi = axios.create({
  baseURL: TRANSACTIONS_BASE,
  headers: { 'Content-Type': 'application/json' },
});

transactionsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

transactionsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getTransactionsByAccount = (accountId) =>
  transactionsApi.get(`/account/${accountId}`);

export const filterTransactions = (accountId, type, page = 0, size = 10, sortBy = 'transactionDate') =>
  transactionsApi.get(`/filter`, { params: { accountId, type, page, size, sortBy } });

export const getAnalytics = (accountId) =>
  transactionsApi.get(`/analytics/${accountId}`);

// Transfer: withdraw from sender then deposit to receiver.
// Both endpoints require { amount, accountId } per TransactionRequestDto validation.
export const transfer = async (fromAccountId, toAccountId, amount, description) => {
  await api.post('/accounts/transfer', {
    fromAccountId,
    toAccountId,
    amount,
    description,
  });
};
