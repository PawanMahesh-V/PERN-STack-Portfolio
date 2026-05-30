import api from './axiosInstance';

export const getSections    = ()        => api.get('/sections');
export const getAllSections  = ()        => api.get('/sections/all');      // admin
export const createSection  = (data)    => api.post('/sections', data);
export const updateSection  = (id,data) => api.put(`/sections/${id}`, data);
export const reorderSections= (order)   => api.patch('/sections/reorder', { order });
export const deleteSection  = (id)      => api.delete(`/sections/${id}`);
