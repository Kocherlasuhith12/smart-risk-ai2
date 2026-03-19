import axios from 'axios'

// Point the frontend at the running backend instance.
const API = axios.create({ baseURL: 'http://localhost:8000' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      // Token missing/expired/invalid. Reset local session and send to login.
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    if (status === 403) {
      // Normalize a friendly permission error message for the UI.
      if (!error.response.data) error.response.data = {}
      if (!error.response.data.detail) {
        error.response.data.detail =
          "You don't have permission to perform this action. Please switch to a role with higher access."
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
}

export const projectsAPI = {
  list:   ()           => API.get('/projects/'),
  create: (data)       => API.post('/projects/', data),
  get:    (id)         => API.get(`/projects/${id}`),
  update: (id, data)   => API.put(`/projects/${id}`, data),
  delete: (id)         => API.delete(`/projects/${id}`),
}

export const predictionsAPI = {
  predict:        (projectId) => API.post(`/predictions/predict/${projectId}`),
  predictInstant: (data)      => API.post('/predictions/predict-instant', data),
  history:        (projectId) => API.get(`/predictions/history/${projectId}`),
  summary:        ()          => API.get('/predictions/summary/all'),
}

export const mlAPI = {
  trainModel:          ()      => API.post('/ml/train-model'),
  predictRisk:         (data)  => API.post('/ml/predict-risk', data),
  modelMetrics:        ()      => API.get('/ml/model-metrics'),
  featureImportance:   ()      => API.get('/ml/feature-importance'),
  whatIf:              (data)  => API.post('/ml/what-if', data),
  riskForecast:        (data)  => API.post('/ml/risk-forecast', data),
  datasetStats:        ()      => API.get('/ml/dataset-stats'),
}

export default API
