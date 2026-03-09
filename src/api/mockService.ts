import { API_CONFIG } from '@/config/apiConfig'

export async function mockResponse<T>(data: T | (() => Promise<T>)): Promise<T> {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
  await delay(API_CONFIG.MOCK_DELAY_MS)
  if (typeof data === 'function') return (data as () => Promise<T>)()
  return data
}
