import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('yinfaankang-storage')
  if (stored) {
    const parsed = JSON.parse(stored)
    if (parsed.state?.user?.id) {
      config.headers.Authorization = `Bearer ${parsed.state.user.id}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || '网络请求失败，请稍后重试'
    console.error('API Error:', message)
    return Promise.reject(error)
  }
)

export default api

export const authAPI = {
  loginByPhone: (phone: string, code: string) =>
    api.post('/auth/phone-login', { phone, code }),
  loginByPassword: (account: string, password: string) =>
    api.post('/auth/login', { account, password }),
  sendCode: (phone: string) =>
    api.post('/auth/send-code', { phone }),
}

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  getBoundFamily: () => api.get('/user/bound-family'),
  bindFamily: (elderlyId: string, relation: string) =>
    api.post('/user/bind-family', { elderlyId, relation }),
}

export const healthAPI = {
  getHealthInfo: (elderlyId: string) => api.get(`/health/${elderlyId}`),
  updateHealthInfo: (elderlyId: string, data: any) =>
    api.put(`/health/${elderlyId}`, data),
  addMedicalRecord: (elderlyId: string, data: any) =>
    api.post(`/health/${elderlyId}/medical-record`, data),
}

export const careAPI = {
  getCaregivers: (params?: any) => api.get('/caregivers', { params }),
  getCaregiverDetail: (id: string) => api.get(`/caregivers/${id}`),
  getCareRecords: (elderlyId: string) => api.get(`/care-records/${elderlyId}`),
  createCareRecord: (data: any) => api.post('/care-records', data),
}

export const messageAPI = {
  getMessages: (userId: string) => api.get(`/messages/${userId}`),
  sendMessage: (data: any) => api.post('/messages', data),
}

export const reviewAPI = {
  getReviews: (caregiverId: string) => api.get(`/reviews/${caregiverId}`),
  createReview: (data: any) => api.post('/reviews', data),
}
