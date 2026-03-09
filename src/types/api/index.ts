export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[]
  total: number
  page: number
  pageSize: number
}>

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl?: string
}

export interface ChatConversation {
  id: string
  name: string
  lastMsg: string
  unread: number
}

export interface ChatMessage {
  id: string
  from: 'customer' | 'showroom' | 'finance'
  text: string
  time: string
}

export interface SystemSettings {
  logoUrl?: string
  hotline: string
  supportEmail: string
  facebook?: string
  zalo?: string
  website?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}
