import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { useSessionRevokedStore } from '@/store/sessionRevokedStore'
import { shouldOpenAccountSuspendedModal } from '@/utils/accountSuspendedModalPolicy'
import { getStoredAuthToken } from '@/utils/authToken'
import {
  fixAbsoluteBaseUrlLeadingSlash,
  normalizeApiBaseUrl,
  stripDuplicateApiV1Path,
} from '@/utils/apiBaseUrl'

// Phải khớp prefix Spring Boot: /api/v1/... (trước đây /api khiến /admin/users → /api/admin/users → sai route).
export const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
  allowAbsoluteUrls: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const fixedDup = stripDuplicateApiV1Path(config.baseURL, config.url)
  if (fixedDup !== undefined) config.url = fixedDup

  const fixedSlash = fixAbsoluteBaseUrlLeadingSlash(config.baseURL, config.url)
  if (fixedSlash !== undefined) config.url = fixedSlash

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
