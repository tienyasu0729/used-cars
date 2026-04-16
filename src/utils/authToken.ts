/** Key chuẩn; key `token` chỉ đọc để tương thích bản cũ. */
const CANONICAL_TOKEN_KEY = 'auth_token'
const LEGACY_TOKEN_KEY = 'token'

export function getStoredAuthToken(): string | null {
  return localStorage.getItem(CANONICAL_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY)
}

/** Ghi token mới — chỉ dùng key chuẩn (migration từ key cũ do getStoredAuthToken vẫn đọc được). */
export function setStoredAuthToken(token: string): void {
  localStorage.setItem(CANONICAL_TOKEN_KEY, token)
}
