import api from './axiosInstance';

export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const getAdminUser = (id) => api.get(`/admin/users/${id}`);
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });
export const setUserLocked = (id, locked) => api.put(`/admin/users/${id}/lock`, { locked });
export const resetUserPin = (id, pin) => api.put(`/admin/users/${id}/reset-pin`, pin ? { pin } : {});
export const getAdminAccounts = () => api.get('/admin/accounts');
export const addAdminBalance = (id, amount, description) =>
  api.post(`/admin/accounts/${id}/add-balance`, { amount, description });
export const setAccountFrozen = (id, frozen) => api.put(`/admin/accounts/${id}/freeze`, { frozen });
export const getAdminTransactions = (params = {}) => api.get('/admin/transactions', { params });
