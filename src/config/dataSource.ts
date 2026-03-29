export type DataSourceMode = 'mock' | 'api'

export const DATA_SOURCE: DataSourceMode =
  (import.meta.env.VITE_DATA_SOURCE as DataSourceMode) || 'mock'

export const isMockMode = () => DATA_SOURCE === 'mock'
export const isApiMode = () => DATA_SOURCE === 'api'

/**
 * Backend hiện chưa có GET /api/v1/notifications|deposits|chat.
 * Chỉ bật khi đã triển khai API tương ứng (kèm JWT).
 */
export const customerExtrasApiEnabled = () =>
  import.meta.env.VITE_CUSTOMER_EXTRAS_API === 'true'

/** Backend chưa có GET /api/v1/orders — bật khi đã triển khai (kèm JWT). */
export const customerOrdersApiEnabled = () =>
  import.meta.env.VITE_ORDERS_API === 'true'
