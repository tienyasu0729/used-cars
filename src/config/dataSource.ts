export type DataSourceMode = 'mock' | 'api'

export const DATA_SOURCE: DataSourceMode =
  (import.meta.env.VITE_DATA_SOURCE as DataSourceMode) || 'mock'

export const isMockMode = () => DATA_SOURCE === 'mock'
export const isApiMode = () => DATA_SOURCE === 'api'
