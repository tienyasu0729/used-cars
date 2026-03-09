import { API_CONFIG } from '@/config/apiConfig'
import { mockResponse } from './mockService'
import { httpClient } from './baseApi'
import type { Banner } from '@/api/customerApi'

export interface PendingCar {
  id: string
  carName: string
  showroom: string
  price: number
  submittedAt: string
  image?: string
}

export interface PendingReview {
  id: string
  reviewerName: string
  showroom: string
  reviewText: string
  rating: number
  createdAt: string
}

export interface FraudReport {
  id: string
  showroom: string
  issueType: string
  evidence: string[]
  status: 'pending' | 'investigating' | 'resolved'
  reportedAt: string
}

export interface CategoryNode {
  id: string
  name: string
  type: 'brand' | 'model' | 'vehicleType'
  children?: CategoryNode[]
}

export interface MediaItem {
  id: string
  url: string
  name: string
  type: 'image' | 'video'
}

export interface SeoPage {
  id: string
  pageUrl: string
  metaTitle: string
  metaDescription: string
  keywords: string
}

export interface AppointmentFlowItem {
  id: string
  appointmentId: string
  car: string
  customer: string
  showroom: string
  appointmentDate: string
  saleStatus: 'reported' | 'not_reported'
  suspicious: boolean
}

export interface ChangeLog {
  id: string
  user: string
  action: string
  module: string
  changedData: string
  timestamp: string
}

export interface ShowroomApplication {
  id: string
  showroomName: string
  owner: string
  phone: string
  location: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface StaffVoucher {
  id: string
  code: string
  discountPercent: number
  usageLimit: number
  expiryDate: string
  status: 'active' | 'disabled'
}

export interface BlogPost {
  id: string
  title: string
  content: string
  category: string
  status: 'draft' | 'published'
}

export const staffApi = {
  async getDashboardStats() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockStaffStats } = await import('@/mock/mockStaff')
        return mockStaffStats
      })
    }
    const res = await httpClient.get('/staff/dashboard')
    return res.data
  },

  async getPendingCars() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockPendingCars } = await import('@/mock/mockStaff')
        return [...mockPendingCars]
      })
    }
    const res = await httpClient.get<PendingCar[]>('/staff/pending-cars')
    return res.data
  },

  async approveCar(carId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/staff/cars/${carId}/approve`)
    return { success: true }
  },

  async rejectCar(carId: string, comment: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/staff/cars/${carId}/reject`, { comment })
    return { success: true }
  },

  async getPendingReviews() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockPendingReviews } = await import('@/mock/mockStaff')
        return [...mockPendingReviews]
      })
    }
    const res = await httpClient.get<PendingReview[]>('/staff/pending-reviews')
    return res.data
  },

  async approveReview(reviewId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/staff/reviews/${reviewId}/approve`)
    return { success: true }
  },

  async hideReview(reviewId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/staff/reviews/${reviewId}/hide`)
    return { success: true }
  },

  async getFraudReports() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockFraudReports } = await import('@/mock/mockStaff')
        return [...mockFraudReports]
      })
    }
    const res = await httpClient.get<FraudReport[]>('/staff/fraud-reports')
    return res.data
  },

  async resolveFraudReport(reportId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/staff/fraud-reports/${reportId}/resolve`)
    return { success: true }
  },

  async getHotCars(): Promise<string[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockHotCars } = await import('@/mock/mockStaff')
        return [...mockHotCars]
      })
    }
    const res = await httpClient.get<string[]>('/staff/hot-cars')
    return res.data
  },

  async addHotCar(carId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post('/staff/hot-cars', { carId })
    return { success: true }
  },

  async removeHotCar(carId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.delete(`/staff/hot-cars/${carId}`)
    return { success: true }
  },

  async getCategories() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockCategories } = await import('@/mock/mockStaff')
        return [...mockCategories]
      })
    }
    const res = await httpClient.get<CategoryNode[]>('/staff/categories')
    return res.data
  },

  async getBanners(): Promise<Banner[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockBanners } = await import('@/mock/mockStaff')
        return [...mockBanners]
      })
    }
    const res = await httpClient.get<Banner[]>('/staff/banners')
    return res.data
  },

  async getBlogPosts() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockBlogPosts } = await import('@/mock/mockStaff')
        return [...mockBlogPosts]
      })
    }
    const res = await httpClient.get('/staff/blog-posts')
    return res.data
  },

  async getMedia() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockMedia } = await import('@/mock/mockStaff')
        return [...mockMedia]
      })
    }
    const res = await httpClient.get('/staff/media')
    return res.data
  },

  async getMediaLibrary(params?: { type?: 'image' | 'video'; limit?: number }) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockMedia } = await import('@/mock/mockStaff')
        let items = [...mockMedia]
        if (params?.type) items = items.filter((m) => m.type === params.type)
        if (params?.limit) items = items.slice(0, params.limit)
        return { items, total: items.length }
      })
    }
    const q = new URLSearchParams()
    if (params?.type) q.set('type', params.type)
    if (params?.limit) q.set('limit', String(params.limit))
    const res = await httpClient.get<{ items: MediaItem[]; total: number }>(`/staff/media/library${q.toString() ? `?${q}` : ''}`)
    return res.data
  },

  async getSeoPages() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockSeoPages } = await import('@/mock/mockStaff')
        return [...mockSeoPages]
      })
    }
    const res = await httpClient.get('/staff/seo-pages')
    return res.data
  },

  async getAppointmentFlow() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockAppointmentFlow } = await import('@/mock/mockStaff')
        return [...mockAppointmentFlow]
      })
    }
    const res = await httpClient.get('/staff/appointment-flow')
    return res.data
  },

  async getChangeHistory() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockChangeHistory } = await import('@/mock/mockStaff')
        return [...mockChangeHistory]
      })
    }
    const res = await httpClient.get('/staff/change-history')
    return res.data
  },

  async getShowroomApplications() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockShowroomApplications } = await import('@/mock/mockStaff')
        return [...mockShowroomApplications]
      })
    }
    const res = await httpClient.get('/staff/showroom-applications')
    return res.data
  },

  async getVouchers() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockStaffVouchers } = await import('@/mock/mockStaff')
        return [...mockStaffVouchers]
      })
    }
    const res = await httpClient.get('/staff/vouchers')
    return res.data
  },

  async getRefundVerifications(): Promise<{ id: string; customerPhotos: string[]; inspectionReport: string }[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockRefundVerifications } = await import('@/mock/mockStaff')
        return [...mockRefundVerifications]
      })
    }
    const res = await httpClient.get('/staff/refund-verifications')
    return res.data
  },

  async createBanner(data: { title: string; link?: string; type?: Banner['type'] }) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, id: `b-${Date.now()}` })
    const res = await httpClient.post<{ success: boolean; id: string }>('/staff/banners', data)
    return res.data
  },

  async updateBanner(id: string, data: Partial<{ title: string; link: string; image: string }>) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.patch(`/staff/banners/${id}`, data)
    return { success: true }
  },

  async deleteBanner(id: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.delete(`/staff/banners/${id}`)
    return { success: true }
  },

  async uploadMedia(file: File) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse({
        success: true,
        media: { id: `m-${Date.now()}`, url: URL.createObjectURL(file), name: file.name, type: file.type.startsWith('video') ? 'video' as const : 'image' as const },
      })
    }
    const form = new FormData()
    form.append('file', file)
    const res = await httpClient.post<{ success: boolean; media: MediaItem }>('/staff/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async deleteMedia(id: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.delete(`/staff/media/${id}`)
    return { success: true }
  },

  async createArticle(data: Omit<BlogPost, 'id'>) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, id: `bp-${Date.now()}` })
    const res = await httpClient.post<{ success: boolean; id: string }>('/staff/blog-posts', data)
    return res.data
  },

  async updateArticle(id: string, data: Partial<BlogPost>) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.patch(`/staff/blog-posts/${id}`, data)
    return { success: true }
  },

  async deleteArticle(id: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.delete(`/staff/blog-posts/${id}`)
    return { success: true }
  },

  async createVoucher(data: Omit<StaffVoucher, 'id'>) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, id: `sv-${Date.now()}` })
    const res = await httpClient.post<{ success: boolean; id: string }>('/staff/vouchers', data)
    return res.data
  },

  async updateVoucher(id: string, data: Partial<StaffVoucher>) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.patch(`/staff/vouchers/${id}`, data)
    return { success: true }
  },

  async deleteVoucher(id: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.delete(`/staff/vouchers/${id}`)
    return { success: true }
  },

  async updateSeoPage(id: string, data: Partial<SeoPage>) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.patch(`/staff/seo-pages/${id}`, data)
    return { success: true }
  },

  async getNotifications() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockNotifications } = await import('@/mock/mockNotifications')
        return [...mockNotifications]
      })
    }
    const res = await httpClient.get('/staff/notifications')
    return res.data
  },

  async markNotificationRead(id: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/staff/notifications/${id}/read`)
    return { success: true }
  },

  async sendNotification(data: { title: string; message: string; target: 'all' | 'showroom' | 'customer' }) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post('/staff/notifications/send', data)
    return { success: true }
  },
}
