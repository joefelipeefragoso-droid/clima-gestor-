import api from './api';

const agendaService = {
  getAll: () => api.get('/agendamentos'),
  create: (data) => api.post('/agendamentos', data),
  update: (id, data) => api.put(`/agendamentos/${id}`, data),
  delete: (id) => api.delete(`/agendamentos/${id}`),
};

export default agendaService;
