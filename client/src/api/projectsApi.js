import api from './axiosInstance';

export const getProjects   = (sectionId) => api.get(`/projects${sectionId ? `?section_id=${sectionId}` : ''}`);
export const createProject = (data)      => api.post('/projects', data);
export const updateProject = (id, data)  => api.put(`/projects/${id}`, data);
export const deleteProject = (id)        => api.delete(`/projects/${id}`);
