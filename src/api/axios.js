import axios from 'axios'
import { tokenService } from '../auth/tokenService'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.request.use(config => {
  const token = tokenService.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config

    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token
            return api(originalRequest)
          })
          .catch(e => Promise.reject(e))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = tokenService.getRefreshToken()
      if (!refreshToken) {
        isRefreshing = false
        tokenService.clearTokens()
        window.location.href = '/login'
        return Promise.reject(err)
      }

      try {
        const resp = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
        const { accessToken } = resp.data
        tokenService.setAccessToken(accessToken)
        processQueue(null, accessToken)
        originalRequest.headers.Authorization = 'Bearer ' + accessToken
        return api(originalRequest)
      } catch (e) {
        processQueue(e, null)
        tokenService.clearTokens()
        window.location.href = '/login'
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

export default api
