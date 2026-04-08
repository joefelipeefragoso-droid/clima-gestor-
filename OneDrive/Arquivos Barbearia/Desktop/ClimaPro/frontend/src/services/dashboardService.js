import api from './api';

const dashboardService = {
  getSummary: () => api.get('/dashboard'),
};

export default dashboardService;
