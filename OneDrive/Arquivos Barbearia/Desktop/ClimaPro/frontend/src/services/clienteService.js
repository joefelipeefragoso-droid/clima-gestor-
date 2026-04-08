import api from './api';

const clienteService = {
  getAll: (search = '') => api.get(`/clientes?search=${search}`),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
};

export default clienteService;
