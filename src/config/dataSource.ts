export type DataSourceMode = 'mock' | 'api'

/** Mặc định API thật; chỉ đặt VITE_DATA_SOURCE=mock nếu cần debug tách biệt (không dùng dữ liệu giả trong UI). */
export const DATA_SOURCE: DataSourceMode =
  (import.meta.env.VITE_DATA_SOURCE as DataSourceMode) === 'mock' ? 'mock' : 'api'

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
