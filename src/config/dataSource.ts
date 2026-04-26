export type DataSourceMode = 'mock' | 'api'

/** Mặc định API thật; chỉ đặt VITE_DATA_SOURCE=mock nếu cần debug tách biệt (không dùng dữ liệu giả trong UI). */
export const DATA_SOURCE: DataSourceMode =
  (import.meta.env.VITE_DATA_SOURCE as DataSourceMode) === 'mock' ? 'mock' : 'api'

export const isApiMode = () => DATA_SOURCE === 'api'

/**
 * Chat (và các extra khác) — bật khi backend đã có API tương ứng (`VITE_CUSTOMER_EXTRAS_API=true`).
 * Inbox thông báo dùng GET /notifications (JWT) theo chế độ `isApiMode()` — không phụ thuộc cờ này.
 */
/** Chat — mặc định bật cùng chế độ API thật (Sprint 9). */
export const customerExtrasApiEnabled = () => isApiMode()

/** Backend chưa có GET /api/v1/orders — bật khi đã triển khai (kèm JWT). */
export const customerOrdersApiEnabled = () =>
  import.meta.env.VITE_ORDERS_API === 'true'
