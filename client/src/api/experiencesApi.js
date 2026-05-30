import api from './axiosInstance';

export const getExperiences   = (sectionId) => api.get(`/experiences${sectionId ? `?section_id=${sectionId}` : ''}`);
export const createExperience = (data)      => api.post('/experiences', data);
export const updateExperience = (id, data)  => api.put(`/experiences/${id}`, data);
export const deleteExperience = (id)        => api.delete(`/experiences/${id}`);
