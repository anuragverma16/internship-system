import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Network error'

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject({ ...error, message })
  }
)

export default api

// API helpers
export const internshipAPI = {
  getAll: (params) => api.get('/internships', { params }),
  getFeatured: () => api.get('/internships/featured'),
  getOne: (id) => api.get(`/internships/${id}`),
  getMine: () => api.get('/internships/company/mine'),
  create: (data) => api.post('/internships', data),
  update: (id, data) => api.put(`/internships/${id}`, data),
  delete: (id) => api.delete(`/internships/${id}`),
}

export const applicationAPI = {
  apply: (internshipId, data) => api.post(`/applications/${internshipId}`, data),
  getMy: (params) => api.get('/applications/my', { params }),
  getCompanyApps: (params) => api.get('/applications/company', { params }),
  getForInternship: (id, params) => api.get(`/applications/internship/${id}`, { params }),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  withdraw: (id) => api.delete(`/applications/${id}`),
}

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  saveInternship: (id) => api.post(`/users/save-internship/${id}`),
  getSaved: () => api.get('/users/saved-internships'),
  updateMe: (data) => api.put('/users/me', data),
}

export const companyAPI = {
  getMe: () => api.get('/companies/me'),
  updateMe: (data) => api.put('/companies/me', data),
  getAll: (params) => api.get('/companies', { params }),
}

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  verifyCompany: (id) => api.patch(`/admin/companies/${id}/verify`),
  featureInternship: (id) => api.patch(`/admin/internships/${id}/feature`),
}

export const uploadAPI = {
  resume: (file) => {
    const fd = new FormData(); fd.append('resume', file)
    return api.post('/upload/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  avatar: (file) => {
    const fd = new FormData(); fd.append('avatar', file)
    return api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  logo: (file) => {
    const fd = new FormData(); fd.append('logo', file)
    return api.post('/upload/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}
