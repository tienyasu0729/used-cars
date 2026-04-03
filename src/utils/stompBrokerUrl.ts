export function getStompBrokerUrl(): string {
  const explicit = import.meta.env.VITE_WS_URL as string | undefined
  if (explicit?.trim()) {
    return explicit.trim()
  }
  if (import.meta.env.DEV) {
    const host = ((import.meta.env.VITE_BACKEND_HOST as string | undefined) ?? '127.0.0.1').trim() || '127.0.0.1'
    const port = ((import.meta.env.VITE_BACKEND_PORT as string | undefined) ?? '8080').trim() || '8080'
    return `ws://${host}:${port}/ws`
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/ws`
}
