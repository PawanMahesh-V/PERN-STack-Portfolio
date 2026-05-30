import api from './axiosInstance';

export const uploadAsset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/assets/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};
