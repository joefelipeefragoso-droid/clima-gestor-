import api from './api';

const inventoryService = {
  // Categorias
  getCategorias: (nicho = '') => api.get(`/categorias?nicho=${nicho}`),
  createCategoria: (data) => api.post('/categorias', data),
  updateCategoria: (id, data) => api.put(`/categorias/${id}`, data),
  deleteCategoria: (id) => api.delete(`/categorias/${id}`),

  // Materiais
  getMateriais: (params = {}) => {
    const q = new URLSearchParams(params);
    return api.get(`/materiais?${q.toString()}`);
  },
  createMaterial: (data) => api.post('/materiais', data),
  updateMaterial: (id, data) => api.put(`/materiais/${id}`, data),
  deleteMaterial: (id) => api.delete(`/materiais/${id}`),

  // Serviços Base
  getServicos: (params = {}) => {
    const q = new URLSearchParams(params);
    return api.get(`/servicos?${q.toString()}`);
  },
  createServico: (data) => api.post('/servicos', data),
  updateServico: (id, data) => api.put(`/servicos/${id}`, data),
  deleteServico: (id) => api.delete(`/servicos/${id}`),
};

export default inventoryService;
