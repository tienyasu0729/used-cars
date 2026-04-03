import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'

export interface AdminAnnouncementRow {
  id: number
  title: string
  body: string
  notifKind: string
  audience: string
  targetUserIds: number[]
  published: boolean
  sendEmail: boolean
  emailSentAt: string | null
  emailLastError: string | null
  createdAt: string
  updatedAt: string
}

export const adminAnnouncementsListKey = ['admin-announcements', 'list'] as const

export interface CreateAnnouncementBody {
  title: string
  body: string
  notifKind: 'announcement' | 'email'
  audience: 'ALL_CUSTOMERS' | 'STAFF_AND_MANAGERS' | 'SPECIFIC_USERS'
  targetUserIds?: number[]
  sendEmail: boolean
  published: boolean
}

export async function fetchAdminAnnouncements(
  page = 0,
  size = 50
): Promise<{ items: AdminAnnouncementRow[]; meta: unknown }> {
  const res = (await axiosInstance.get('/admin/notifications', { params: { page, size } })) as ApiResponse<
    AdminAnnouncementRow[]
  >
  const raw = res.data
  const list = Array.isArray(raw) ? raw : []
  return { items: list, meta: res.meta }
}

export async function createAdminAnnouncement(body: CreateAnnouncementBody): Promise<number> {
  const res = (await axiosInstance.post('/admin/notifications', body)) as ApiResponse<{ id: number }>
  return res.data.id
}

export async function updateAdminAnnouncement(id: number, body: CreateAnnouncementBody): Promise<void> {
  await axiosInstance.put(`/admin/notifications/${id}`, body)
}

export async function deleteAdminAnnouncement(id: number): Promise<void> {
  await axiosInstance.delete(`/admin/notifications/${id}`)
}

export async function publishAdminAnnouncement(id: number): Promise<void> {
  await axiosInstance.post(`/admin/notifications/${id}/publish`)
}
