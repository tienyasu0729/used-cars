export type NotificationType =
  | 'Booking'
  | 'Deposit'
  | 'Order'
  | 'PriceDrop'
  | 'System'
  | 'AppointmentTestDrive'
  | 'AppointmentConsultation'
  | 'TransferIncoming'
  | 'TransferOutgoing'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  createdAt: string
  link?: string
}
