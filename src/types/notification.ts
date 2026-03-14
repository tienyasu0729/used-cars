export type NotificationType = 'Booking' | 'Deposit' | 'Order' | 'PriceDrop' | 'System'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  createdAt: string
  link?: string
}
