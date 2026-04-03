import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { useSessionRevokedStore } from '@/store/sessionRevokedStore'
import { shouldOpenAccountSuspendedModal } from '@/utils/accountSuspendedModalPolicy'
import { getStoredAuthToken } from '@/utils/authToken'

// Phải khớp prefix Spring Boot: /api/v1/... (trước đây /api khiến /admin/users → /api/admin/users → sai route).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getStoredAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    const ax = err as {
      config?: InternalAxiosRequestConfig
      response?: { status?: number; data?: { errorCode?: string; message?: string } }
    }
    const status = ax.response?.status
    const data = ax.response?.data
    if (status === 403 && data?.errorCode === 'ACCOUNT_SUSPENDED') {
      if (shouldOpenAccountSuspendedModal(ax.config)) {
        useSessionRevokedStore.getState().openBlocking(data.message)
      }
    }
    return Promise.reject(err)
  },
)
