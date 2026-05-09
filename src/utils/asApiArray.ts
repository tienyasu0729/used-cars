/**
 * Chuẩn hoá list từ backend: ApiResponse.data, mảng thô, hoặc Spring Page.content.
 * Dùng với axios: truyền `response.data` (body JSON).
 */
export function asApiArray<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>
    if (Array.isArray(o.data)) return o.data as T[]
    if (Array.isArray(o.content)) return o.content as T[]
  }
  return []
}
