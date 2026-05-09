import type { ApiResponse } from '@/types/auth.types'

export function unwrapApiResponse<T>(res: ApiResponse<T>): T {
  if (res == null || typeof res !== 'object') throw new Error('EMPTY_RESPONSE')
  if (res.data !== undefined) return res.data
  if (res.success === true) return undefined as T
  throw new Error('EMPTY_RESPONSE')
}
