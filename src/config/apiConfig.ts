export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '',
  USE_MOCK: import.meta.env.VITE_USE_MOCK_API !== 'false',
  MOCK_DELAY_MS: 200,
}
