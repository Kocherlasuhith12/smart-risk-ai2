import axios from 'axios'

// Use environment variable (Vercel will inject this)
const API_URL = import.meta.env.VITE_API_URL;

// Fallback (optional safety)
const BASE_URL = API_URL || "https://smart-risk-ai2.onrender.com";

const API = axios.create({
  baseURL: BASE_URL,
});

// Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      if (!error.response.data) error.response.data = {};
      if (!error.response.data.detail) {
        error.response.data.detail =
          "You don't have permission to perform this action. Please switch to a role with higher access.";
      }
    }

    return Promise.reject(error);
  }
);

// APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
};

export const projectsAPI = {
  list:   ()           => API.get('/projects/'),
  create: (data)       => API.post('/projects/', data),
  get:    (id)         => API.get(`/projects/${id}`),
  update: (id, data)   => API.put(`/projects/${id}`, data),
  delete: (id)         => API.delete(`/projects/${id}`),
};

export const predictionsAPI = {
  predict:        (projectId) => API.post(`/predictions/predict/${projectId}`),
  predictInstant: (data)      => API.post('/predictions/predict-instant', data),
  history:        (projectId) => API.get(`/predictions/history/${projectId}`),
  summary:        ()          => API.get('/predictions/summary/all'),
};

export const mlAPI = {
  trainModel:        ()      => API.post('/ml/train-model'),
  predictRisk:       (data)  => API.post('/ml/predict-risk', data),
  modelMetrics:      ()      => API.get('/ml/model-metrics'),
  featureImportance: ()      => API.get('/ml/feature-importance'),
  whatIf:            (data)  => API.post('/ml/what-if', data),
  riskForecast:      (data)  => API.post('/ml/risk-forecast', data),
  datasetStats:      ()      => API.get('/ml/dataset-stats'),
};

export default API;