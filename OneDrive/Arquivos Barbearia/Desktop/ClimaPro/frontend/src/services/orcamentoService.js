import api from './api';

const orcamentoService = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params);
    return api.get(`/orcamentos?${q.toString()}`);
  },
  getById: (id) => api.get(`/orcamentos/${id}`),
  getDetailed: (id) => api.get(`/orcamentos/${id}/detalhada`),
  create: (data) => api.post('/orcamentos', data),
  update: (id, data) => api.put(`/orcamentos/${id}`, data),
  updateBase: (id, data) => api.put(`/orcamentos/${id}/base`, data),
  delete: (id) => api.delete(`/orcamentos/${id}`),
  updateStatus: (id, status) => api.put(`/orcamentos/${id}/status`, { status }),
  duplicar: (id) => api.post(`/orcamentos/${id}/duplicar`),
  
  // Gastos, Lembretes e Fotos
  addGasto: (orcId, data) => api.post(`/orcamentos/${orcId}/gastos`, data),
  deleteGasto: (id) => api.delete(`/gastos/${id}`),
  addLembrete: (orcId, data) => api.post(`/orcamentos/${orcId}/lembretes`, data),
  updateLembrete: (id, status) => api.put(`/lembretes/${id}`, { status }),
  addFoto: (orcId, formData) => api.post(`/orcamentos/${orcId}/fotos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteFoto: (id) => api.delete(`/fotos/${id}`),
};

export default orcamentoService;
