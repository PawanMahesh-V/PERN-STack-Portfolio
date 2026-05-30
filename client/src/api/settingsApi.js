import api from './axiosInstance';

export const getSettings   = ()              => api.get('/settings');
export const updateSetting = (key, value)    => api.put('/settings', { key, value });
export const uploadAsset   = (formData)      => api.post('/settings/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
