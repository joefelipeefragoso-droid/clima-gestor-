import axios from 'axios';

// URL do Backend no Render
const BASE_URL = import.meta.env.VITE_API_URL || 'https://appgestor-lgaj.onrender.com';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para logs de erro profissionais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export { BASE_URL };
export default api;
