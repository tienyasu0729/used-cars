import axios, { type AxiosError } from 'axios'
import { API_CONFIG } from '@/config/apiConfig'

export const httpClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('scudn-auth')
    if (stored) {
      const p = JSON.parse(stored)
      const token = p?.state?.accessToken ?? p?.accessToken
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignore
  }
  return config
})

httpClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const message =
      (err.response?.data as { message?: string })?.message ??
      err.message ??
      'Network error'
    return Promise.reject(new Error(message))
  }
)
