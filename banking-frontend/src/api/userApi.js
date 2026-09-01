import api from './axiosInstance';

export const getUser = (userId) => api.get(`/users/${userId}`);
