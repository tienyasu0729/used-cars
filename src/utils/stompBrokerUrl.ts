import { getRuntimeEnv, isViteDev } from '@/config/runtimeEnv'

export function getStompBrokerUrl(): string {
  const explicit = getRuntimeEnv('VITE_WS_URL')
  if (explicit?.trim()) {
    return explicit.trim()
  }
  if (isViteDev) {
    const host = getRuntimeEnv('VITE_BACKEND_HOST', '127.0.0.1')
    const port = getRuntimeEnv('VITE_BACKEND_PORT', '8080')
    return `ws://${host}:${port}/ws`
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/ws`
}
