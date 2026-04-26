import { api } from './apiClient'

export type ConfigEntry = { key: string; value: string; description?: string | null }

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as { data: T }).data
  }
  return raw as T
}

export async function fetchAdminConfig(): Promise<ConfigEntry[]> {
  const res = await api.get<unknown>('/admin/config')
  const arr = unwrap<ConfigEntry[]>(res.data)
  return Array.isArray(arr) ? arr : []
}

export async function putAdminConfig(items: { key: string; value: string }[]): Promise<void> {
  await api.put('/admin/config', items)
}
