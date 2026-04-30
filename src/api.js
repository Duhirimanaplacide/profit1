import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-71p0.onrender.com/api';
const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const registerUser = (data) => API.post('/auth/register', data);
export const changePassword = (data) => API.post('/auth/change-password', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const verifyResetCode = (data) => API.post('/auth/verify-reset-code', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

export const getProfits = () => API.get('/profits');
export const getAllProfits = () => API.get('/profits/all');
export const getProfit = (id) => API.get(`/profits/${id}`);
export const createProfit = (data, image) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('price', data.price);
  formData.append('minInvestment', data.minInvestment);
  formData.append('maxInvestment', data.maxInvestment);
  formData.append('profitPercent', data.profitPercent);
  formData.append('durationDays', data.durationDays);
  if (data.description) formData.append('description', data.description);
  if (image) formData.append('image', image);
  return API.post('/profits', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const updateProfit = (id, data, image) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('price', data.price);
  formData.append('minInvestment', data.minInvestment);
  formData.append('maxInvestment', data.maxInvestment);
  formData.append('profitPercent', data.profitPercent);
  formData.append('durationDays', data.durationDays);
  if (data.description) formData.append('description', data.description);
  if (image) formData.append('image', image);
  return API.put(`/profits/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteProfit = (id) => API.delete(`/profits/${id}`);

export const createInvestment = (data) => API.post('/investments', data);
export const getInvestments = () => API.get('/investments');
export const getInvestment = (id) => API.get(`/investments/${id}`);
export const updateInvestmentStatus = (id, data) => API.put(`/investments/${id}/status`, data);
export const updateInvestmentProfit = (id, data) => API.put(`/investments/${id}/profit`, data);
export const updateInvestmentBonus = (id, data) => API.put(`/investments/${id}/bonus`, data);

export const requestBonus = (data) => API.post('/bonuses', data);
export const getBonuses = () => API.get('/bonuses');
export const approveBonus = (id, data) => API.put(`/bonuses/${id}`, data);

export const createWithdrawal = (data) => API.post('/withdrawals', data);
export const getWithdrawals = () => API.get('/withdrawals');
export const updateWithdrawalStatus = (id, status) => API.put(`/withdrawals/${id}/status`, { status });

export const getUsers = () => API.get('/users');
export const getUser = (id) => API.get(`/users/${id}`);
export const giveBonus = (id, amount) => API.put(`/users/${id}/bonus`, { amount });
export const updateBalance = (id, amount, action) => API.put(`/users/${id}/balance`, { amount, action });
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const updateProfile = (id, data, profilePicture) => {
  const formData = new FormData();
  if (data.username) formData.append('username', data.username);
  if (data.phone !== undefined) formData.append('phone', data.phone);
  if (profilePicture) formData.append('profilePicture', profilePicture);
  return API.put(`/users/${id}/profile`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteUser = (id) => API.delete(`/users/${id}`);

export const getMessages = () => API.get('/messages');
export const sendMessage = (data, image) => {
  const formData = new FormData();
  formData.append('subject', data.subject);
  formData.append('messageText', data.message);
  if (image) formData.append('image', image);
  return API.post('/messages', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const editMessage = (id, message) => API.put(`/messages/${id}`, { message });
export const deleteMessage = (id) => API.delete(`/messages/${id}`);
export const updateMessageStatus = (id, status) => API.put(`/messages/${id}/status`, { status });
export const markAsRead = (id) => API.put(`/messages/${id}/read`);
export const replyToMessage = (id, message, image) => {
  const formData = new FormData();
  formData.append('message', message);
  if (image) formData.append('image', image);
  return API.post(`/messages/${id}/reply`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export default API;
