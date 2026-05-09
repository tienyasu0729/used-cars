export interface InboxNotificationRow {
  id: number
  type: string
  title: string
  body: string
  link: string | null
  read: boolean
  createdAt: string
}

export interface InboxUnreadCount {
  count: number
}
