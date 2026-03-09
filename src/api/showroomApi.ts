import type { Car } from '@/types'
import { API_CONFIG } from '@/config/apiConfig'
import { mockResponse } from './mockService'
import { httpClient } from './baseApi'
import { carsApi } from './carsApi'

export interface ShowroomAppointment {
  id: string
  customerName: string
  carName: string
  carId: string
  appointmentTime: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

export interface ShowroomTransaction {
  id: string
  customer: string
  car: string
  depositAmount: number
  status: 'deposit_received' | 'sale_confirmed' | 'commission_deducted'
}

export interface ShowroomReview {
  id: string
  customerName: string
  rating: number
  comment: string
  date: string
  reply?: string
}

export interface ServicePackage {
  id: string
  name: string
  price: number
  description: string
}

export const showroomApi = {
  async getInventory() {
    if (API_CONFIG.USE_MOCK) return carsApi.getCars()
    const res = await httpClient.get<Car[]>('/showroom/inventory')
    return res.data
  },

  async updateCarStatus(carId: string, status: string) {
    if (API_CONFIG.USE_MOCK) {
      return carsApi.updateCar(carId, { status: status as Car['status'] }) as Promise<Car | undefined>
    }
    const res = await httpClient.patch<Car>(`/showroom/cars/${carId}`, { status })
    return res.data
  },

  async addCarListing(data: Omit<Car, 'id' | 'views'>) {
    if (API_CONFIG.USE_MOCK) return carsApi.createCarListing(data)
    const res = await httpClient.post<Car>('/showroom/cars', data)
    return res.data
  },

  async getAppointments() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockShowroomAppointments } = await import('@/mock/mockShowroom')
        return [...mockShowroomAppointments]
      })
    }
    const res = await httpClient.get<ShowroomAppointment[]>('/showroom/appointments')
    return res.data
  },

  async confirmAppointment(appointmentId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/showroom/appointments/${appointmentId}/confirm`)
    return { success: true }
  },

  async rescheduleAppointment(appointmentId: string, date: string, time: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/showroom/appointments/${appointmentId}/reschedule`, { date, time })
    return { success: true }
  },

  async verifyQrCode(appointmentId: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse({
        success: true,
        message: 'Customer verified. SCUDN lead recorded. Rescue package activated.',
      })
    }
    const res = await httpClient.post<{ success: boolean; message: string }>(
      '/showroom/qr/verify',
      { appointmentId }
    )
    return res.data
  },

  async getTransactions() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockShowroomTransactions } = await import('@/mock/mockShowroom')
        return [...mockShowroomTransactions]
      })
    }
    const res = await httpClient.get<ShowroomTransaction[]>('/showroom/transactions')
    return res.data
  },

  async confirmSale(transactionId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/showroom/transactions/${transactionId}/confirm`)
    return { success: true }
  },

  async getReviews() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockShowroomReviews } = await import('@/mock/mockShowroom')
        return [...mockShowroomReviews]
      })
    }
    const res = await httpClient.get<ShowroomReview[]>('/showroom/reviews')
    return res.data
  },

  async replyToReview(reviewId: string, reply: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/showroom/reviews/${reviewId}/reply`, { reply })
    return { success: true }
  },

  async getServicePackages() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockServicePackages } = await import('@/mock/mockShowroom')
        return [...mockServicePackages]
      })
    }
    const res = await httpClient.get<ServicePackage[]>('/showroom/service-packages')
    return res.data
  },

  async getDashboardStats() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockShowroomStats } = await import('@/mock/mockShowroom')
        return mockShowroomStats
      })
    }
    const res = await httpClient.get('/showroom/dashboard')
    return res.data
  },

  async getProfile(showroomId?: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockShowrooms } = await import('@/mock/mockShowrooms')
        return mockShowrooms[0]
      })
    }
    const id = showroomId ?? 'current'
    const res = await httpClient.get(`/showroom/profile/${id}`)
    return res.data
  },

  async uploadLogo(file: File) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, logoUrl: URL.createObjectURL(file) })
    const form = new FormData()
    form.append('logo', file)
    const res = await httpClient.post<{ logoUrl: string }>('/showroom/profile/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async uploadCoverImage(file: File) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, coverUrl: URL.createObjectURL(file) })
    const form = new FormData()
    form.append('cover', file)
    const res = await httpClient.post<{ coverUrl: string }>('/showroom/profile/cover', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
}
