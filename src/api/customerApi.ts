import type { Car } from '@/types'
import { API_CONFIG } from '@/config/apiConfig'
import { mockResponse } from './mockService'
import { httpClient } from './baseApi'
import { categoriesApi } from './categoriesApi'

export interface Banner {
  id: string
  title: string
  image: string
  link?: string
  type: 'promotion' | 'featured' | 'partner'
}

export interface Appointment {
  id: string
  carId: string
  carName: string
  showroomId: string
  showroomName: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

export interface Transaction {
  id: string
  carId: string
  carName: string
  amount: number
  status: 'pending' | 'completed' | 'refunded'
  date: string
  type: 'deposit' | 'payment' | 'refund'
}

export type { CarType, CarBrand } from './categoriesApi'

export interface Voucher {
  id: string
  name: string
  description: string
  expiryDate: string
  status: 'active' | 'used' | 'expired'
}

const carsParams = (p?: { brand?: string; minPrice?: number; maxPrice?: number; location?: string }) => {
  const q = new URLSearchParams()
  if (p?.brand) q.set('brand', p.brand)
  if (p?.minPrice != null) q.set('minPrice', String(p.minPrice))
  if (p?.maxPrice != null) q.set('maxPrice', String(p.maxPrice))
  if (p?.location) q.set('location', p.location)
  return q.toString()
}

export const customerApi = {
  async getCarCategories() {
    return categoriesApi.getCarCategories()
  },

  async getBanners(): Promise<Banner[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockBanners } = await import('@/mock/mockCustomer')
        return [...mockBanners]
      })
    }
    const res = await httpClient.get<Banner[]>('/banners')
    return res.data
  },

  async getCars(params?: { brand?: string; minPrice?: number; maxPrice?: number; location?: string }): Promise<Car[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockCars } = await import('@/mock/mockCars')
        let result = [...mockCars]
        if (params?.brand) result = result.filter((c) => c.name.toLowerCase().includes(params!.brand!.toLowerCase()))
        if (params?.minPrice) result = result.filter((c) => c.price >= params.minPrice!)
        if (params?.maxPrice) result = result.filter((c) => c.price <= params.maxPrice!)
        return result
      })
    }
    const q = carsParams(params)
    const res = await httpClient.get<Car[]>(`/cars${q ? `?${q}` : ''}`)
    return res.data
  },

  async getCarById(id: string): Promise<Car | undefined> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockCars } = await import('@/mock/mockCars')
        return mockCars.find((c) => c.id === id)
      })
    }
    const res = await httpClient.get<Car>(`/cars/${id}`)
    return res.data
  },

  async createAppointment(data: { carId: string; date: string; time: string }): Promise<Appointment> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const car = (await import('@/mock/mockCars')).mockCars.find((c) => c.id === data.carId)
        const showroom = (await import('@/mock/mockShowrooms')).mockShowrooms[0]
        return {
          id: `apt-${Date.now()}`,
          carId: data.carId,
          carName: car?.name ?? 'Car',
          showroomId: showroom.id,
          showroomName: showroom.name,
          date: data.date,
          time: data.time,
          status: 'pending',
        }
      })
    }
    const res = await httpClient.post<Appointment>('/appointments', data)
    return res.data
  },

  async cancelAppointment(appointmentId: string): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.delete(`/appointments/${appointmentId}`)
    return { success: true }
  },

  async createDepositPayment(_carId: string, _amount: number): Promise<{ success: boolean; transactionId?: string }> {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, transactionId: `TXN-${Date.now()}` })
    const res = await httpClient.post<{ success: boolean; transactionId?: string }>('/payments/deposit', {
      carId: _carId,
      amount: _amount,
    })
    return res.data
  },

  async requestRefund(_data: {
    transactionId: string
    reason: string
    fileUrls?: string[]
  }): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post('/refund-requests', _data)
    return { success: true }
  },

  async requestRescue(_location?: { lat: number; lng: number }): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post('/rescue', _location ?? {})
    return { success: true }
  },

  async getAppointments(): Promise<Appointment[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockAppointments } = await import('@/mock/mockCustomer')
        return [...mockAppointments]
      })
    }
    const res = await httpClient.get<Appointment[]>('/appointments')
    return res.data
  },

  async getTransactions(): Promise<Transaction[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockTransactions } = await import('@/mock/mockCustomer')
        return [...mockTransactions]
      })
    }
    const res = await httpClient.get<Transaction[]>('/transactions')
    return res.data
  },

  async getFavorites(): Promise<Car[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockCars } = await import('@/mock/mockCars')
        return mockCars.slice(0, 3)
      })
    }
    const res = await httpClient.get<Car[]>('/favorites')
    return res.data
  },

  async addFavorite(carId: string): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/favorites/${carId}`)
    return { success: true }
  },

  async removeFavorite(carId: string): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.delete(`/favorites/${carId}`)
    return { success: true }
  },

  async getVouchers(): Promise<Voucher[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockVouchers } = await import('@/mock/mockCustomer')
        return [...mockVouchers]
      })
    }
    const res = await httpClient.get<Voucher[]>('/vouchers')
    return res.data
  },

  async getProfile() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockUserProfile } = await import('@/mock/mockProfile')
        return { ...mockUserProfile }
      })
    }
    const res = await httpClient.get('/profile')
    return res.data
  },

  async updateProfile(data: { name?: string; phone?: string }) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.patch('/profile', data)
    return { success: true }
  },

  async changePassword(oldPassword: string, newPassword: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post('/profile/change-password', { oldPassword, newPassword })
    return { success: true }
  },

  async uploadAvatar(file: File) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, avatarUrl: URL.createObjectURL(file) })
    const form = new FormData()
    form.append('avatar', file)
    const res = await httpClient.post<{ avatarUrl: string }>('/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async createReview(carId: string, data: { rating: number; comment: string }) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, id: `rv-${Date.now()}` })
    const res = await httpClient.post('/reviews', { carId, ...data })
    return res.data
  },

  async getCarReviews(carId: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockShowroomReviews } = await import('@/mock/mockShowroom')
        return mockShowroomReviews.map((r) => ({ ...r, carId }))
      })
    }
    const res = await httpClient.get(`/cars/${carId}/reviews`)
    return res.data
  },

  async getSearchFilters() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockCarCategories } = await import('@/mock/mockCategory')
        return { brands: mockCarCategories, priceRange: { min: 0, max: 5_000_000_000 } }
      })
    }
    const res = await httpClient.get('/search/filters')
    return res.data
  },

  async getSuggestedCars(limit = 9) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockCars } = await import('@/mock/mockCars')
        return mockCars.slice(0, limit)
      })
    }
    const res = await httpClient.get<Car[]>(`/search/suggested?limit=${limit}`)
    return res.data
  },

  async getSimilarCars(carId: string, limit = 6) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockCars } = await import('@/mock/mockCars')
        return mockCars.filter((c) => c.id !== carId).slice(0, limit)
      })
    }
    const res = await httpClient.get<Car[]>(`/cars/${carId}/similar?limit=${limit}`)
    return res.data
  },

  async getArticles(params?: { category?: string; status?: 'draft' | 'published'; limit?: number }) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockBlogPosts } = await import('@/mock/mockStaff')
        let items = mockBlogPosts.filter((p) => p.status === 'published')
        if (params?.category) items = items.filter((p) => p.category === params.category)
        if (params?.limit) items = items.slice(0, params.limit)
        return items
      })
    }
    const q = new URLSearchParams()
    if (params?.category) q.set('category', params.category)
    if (params?.status) q.set('status', params.status)
    if (params?.limit) q.set('limit', String(params.limit))
    const res = await httpClient.get(`/blog/articles${q.toString() ? `?${q}` : ''}`)
    return res.data
  },

  async getArticleById(id: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockBlogPosts } = await import('@/mock/mockStaff')
        return mockBlogPosts.find((p) => p.id === id)
      })
    }
    const res = await httpClient.get(`/blog/articles/${id}`)
    return res.data
  },

  async getUserNotifications(limit = 20) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockNotifications } = await import('@/mock/mockNotifications')
        return mockNotifications.slice(0, limit)
      })
    }
    const res = await httpClient.get(`/notifications?limit=${limit}`)
    return res.data
  },
}
