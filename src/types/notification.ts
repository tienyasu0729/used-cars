export type NotificationType =
  | 'Booking'
  | 'Deposit'
  | 'Order'
  | 'Installment'
  | 'PriceDrop'
  | 'System'
  | 'Consultation'
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
