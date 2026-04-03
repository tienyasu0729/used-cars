export function getStoredAuthToken(): string | null {
  return localStorage.getItem('auth_token') || localStorage.getItem('token')
}
