import api from './axiosInstance';

export const sendMessage    = (data) => api.post('/contact', data);
export const getMessages    = ()     => api.get('/contact/messages');
export const markRead       = (id)   => api.patch(`/contact/messages/${id}/read`);
export const deleteMessage  = (id)   => api.delete(`/contact/messages/${id}`);
