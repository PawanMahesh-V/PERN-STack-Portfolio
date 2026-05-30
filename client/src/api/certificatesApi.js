import api from './axiosInstance';

export const getCertificates   = (sectionId) => api.get(`/certificates${sectionId ? `?section_id=${sectionId}` : ''}`);
export const createCertificate = (data)      => api.post('/certificates', data);
export const updateCertificate = (id, data)  => api.put(`/certificates/${id}`, data);
export const deleteCertificate = (id)        => api.delete(`/certificates/${id}`);
