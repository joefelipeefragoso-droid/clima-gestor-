import api from './api';

const configService = {
  get: () => api.get('/config'),
  update: (formData) => api.put('/api/config', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default configService;
