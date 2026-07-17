import api from './axiosInstance';

export const getResumeData = () => api.get('/resume/data');
