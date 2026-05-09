/** Ảnh tĩnh từ backend (/uploads/...) — cùng origin hoặc qua proxy Vite */
export function resolveUploadPublicUrl(path: string | null | undefined): string | undefined {
  const u = path?.trim()
  if (!u) return undefined
  if (u.startsWith('http')) return u
  return u.startsWith('/') ? u : `/${u}`
}
