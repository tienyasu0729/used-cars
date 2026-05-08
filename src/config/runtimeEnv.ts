export type RuntimeEnvKey =
  | 'VITE_AI_CHATBOT_ENABLED'
  | 'VITE_API_BASE_URL'
  | 'VITE_API_TIMEOUT_MS'
  | 'VITE_API_URL'
  | 'VITE_BACKEND_HOST'
  | 'VITE_BACKEND_PORT'
  | 'VITE_CLOUDINARY_CLOUD_NAME'
  | 'VITE_CLOUDINARY_UPLOAD_PRESET'
  | 'VITE_DATA_SOURCE'
  | 'VITE_GOOGLE_CLIENT_ID'
  | 'VITE_GOONG_API_KEY'
  | 'VITE_GOONG_MAPTILES_KEY'
  | 'VITE_ORDERS_API'
  | 'VITE_WS_URL'

type RuntimeEnvMap = Partial<Record<RuntimeEnvKey, string>>

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeEnvMap
  }
}

function readValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function getRuntimeEnv(key: RuntimeEnvKey, fallback = ''): string {
  if (typeof window !== 'undefined') {
    const runtimeValue = readValue(window.__APP_CONFIG__?.[key])
    if (runtimeValue !== undefined) return runtimeValue
  }

  const buildValue = readValue(import.meta.env[key])
  if (buildValue !== undefined) return buildValue

  return fallback
}

export function getRuntimeBoolean(key: RuntimeEnvKey, fallback = false): boolean {
  const value = getRuntimeEnv(key)
  if (!value) return fallback
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

export function getRuntimeNumber(key: RuntimeEnvKey, fallback: number): number {
  const parsed = Number(getRuntimeEnv(key))
  return Number.isFinite(parsed) ? parsed : fallback
}

export const isViteDev = import.meta.env.DEV
