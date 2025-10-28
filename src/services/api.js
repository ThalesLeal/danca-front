import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let pendingRequests = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          })
        })
      }
      originalRequest._retry = true
      isRefreshing = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        if (!refresh) throw new Error('No refresh token')
        const res = await axios.post(`${baseURL}/auth/token/refresh/`, { refresh })
        const newToken = res.data.access
        localStorage.setItem('access_token', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        pendingRequests.forEach((cb) => cb(newToken))
        pendingRequests = []
        return api(originalRequest)
      } catch (e) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        pendingRequests = []
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api

