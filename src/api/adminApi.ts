import { API_CONFIG } from '@/config/apiConfig'
import { mockResponse } from './mockService'
import { httpClient } from './baseApi'

export interface ShowroomManage {
  id: string
  logo?: string
  name: string
  contact: string
  location: string
  totalCars: number
  trustScore: number
  status: 'pending' | 'active' | 'blocked'
}

export interface TransactionManage {
  id: string
  customer: string
  showroom: string
  depositAmount: number
  status: 'Pending' | 'Escrow' | 'Completed' | 'Refunded'
  date: string
}

export interface CommissionRecord {
  saleId: string
  showroom: string
  car: string
  salePrice: number
  commissionRate: number
  commissionAmount: number
}

export interface SubscriptionPackage {
  id: string
  name: string
  price: number
  duration: string
  status: 'active' | 'inactive'
}

export interface RescuePartner {
  id: string
  garageName: string
  location: string
  phone: string
  coverageArea: string
  status: 'pending' | 'approved' | 'suspended'
}

export interface CustomerManage {
  id: string
  name: string
  email: string
  phone: string
  registeredAt: string
  transactionCount: number
  status: 'active' | 'blocked'
}

export interface SystemLog {
  id: string
  timestamp: string
  user: string
  role: string
  action: string
  targetModule: string
  status: 'success' | 'failed'
}

export interface RefundRequest {
  id: string
  transactionId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  carName: string
  carVin: string
  showroomName: string
  showroomPhone: string
  depositAmount: number
  inspectionSummary: string
  damagePhotos: string[]
  staffNotes: string
  status: 'pending' | 'approved' | 'rejected'
}

export const adminApi = {
  async getDashboardStats() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse({
        commissionRevenue: 1_250_000_000,
        escrowBalance: 320_000_000,
        pendingRefunds: 6,
      })
    }
    const res = await httpClient.get('/admin/dashboard')
    return res.data
  },

  async getShowrooms(): Promise<ShowroomManage[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockShowroomsManage } = await import('@/mock/mockAdmin')
        return [...mockShowroomsManage]
      })
    }
    const res = await httpClient.get<ShowroomManage[]>('/admin/showrooms')
    return res.data
  },

  async getTransactions(): Promise<TransactionManage[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockTransactionsManage } = await import('@/mock/mockAdmin')
        return [...mockTransactionsManage]
      })
    }
    const res = await httpClient.get<TransactionManage[]>('/admin/transactions')
    return res.data
  },

  async getCommissions(): Promise<CommissionRecord[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockCommissions } = await import('@/mock/mockAdmin')
        return [...mockCommissions]
      })
    }
    const res = await httpClient.get<CommissionRecord[]>('/admin/commissions')
    return res.data
  },

  async getCommissionSummary() {
    if (API_CONFIG.USE_MOCK) return mockResponse({ today: 5_200_000, thisMonth: 125_000_000 })
    const res = await httpClient.get('/admin/commissions/summary')
    return res.data
  },

  async getSubscriptionPackages(): Promise<SubscriptionPackage[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockSubscriptionPackages } = await import('@/mock/mockAdmin')
        return [...mockSubscriptionPackages]
      })
    }
    const res = await httpClient.get<SubscriptionPackage[]>('/admin/subscription-packages')
    return res.data
  },

  async getRescuePartners(): Promise<RescuePartner[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockRescuePartners } = await import('@/mock/mockAdmin')
        return [...mockRescuePartners]
      })
    }
    const res = await httpClient.get<RescuePartner[]>('/admin/rescue-partners')
    return res.data
  },

  async getCustomers(): Promise<CustomerManage[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockCustomers } = await import('@/mock/mockAdmin')
        return [...mockCustomers]
      })
    }
    const res = await httpClient.get<CustomerManage[]>('/admin/customers')
    return res.data
  },

  async getSystemLogs(): Promise<SystemLog[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockSystemLogs } = await import('@/mock/mockAdmin')
        return [...mockSystemLogs]
      })
    }
    const res = await httpClient.get<SystemLog[]>('/admin/system-logs')
    return res.data
  },

  async getPendingRefundRequests(): Promise<RefundRequest[]> {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockRefundRequests } = await import('@/mock/mockAdmin')
        return mockRefundRequests.filter((r) => r.status === 'pending')
      })
    }
    const res = await httpClient.get<RefundRequest[]>('/admin/refund-requests?status=pending')
    return res.data
  },

  async executeRefund(transactionId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, message: 'Refund executed' })
    const res = await httpClient.post(`/admin/refund/${transactionId}/approve`)
    return res.data
  },

  async rejectRefund(requestId: string, reason: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, message: 'Refund rejected' })
    await httpClient.post(`/admin/refund/${requestId}/reject`, { reason })
    return { success: true, message: 'Refund rejected' }
  },

  async getStaff() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockStaffList } = await import('@/mock/mockStaff')
        return [...mockStaffList]
      })
    }
    const res = await httpClient.get('/admin/staff')
    return res.data
  },

  async createStaff(data: { name: string; email: string; role: string }) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, id: `staff-${Date.now()}` })
    const res = await httpClient.post('/admin/staff', data)
    return res.data
  },

  async confirmStaff(staffId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/admin/staff/${staffId}/confirm`)
    return { success: true }
  },

  async deleteStaff(staffId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.delete(`/admin/staff/${staffId}`)
    return { success: true }
  },

  async createShowroom(data: {
    name: string
    contact: string
    email: string
    location: string
    address: string
  }) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, id: `sr-${Date.now()}` })
    const res = await httpClient.post('/admin/showrooms', data)
    return res.data
  },

  async approveShowroom(showroomId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/admin/showrooms/${showroomId}/approve`)
    return { success: true }
  },

  async blockShowroom(showroomId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post(`/admin/showrooms/${showroomId}/block`)
    return { success: true }
  },

  async bulkApproveShowrooms(showroomIds: string[]) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post('/admin/showrooms/bulk-approve', { ids: showroomIds })
    return { success: true }
  },

  async bulkBlockShowrooms(showroomIds: string[]) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.post('/admin/showrooms/bulk-block', { ids: showroomIds })
    return { success: true }
  },

  async banCustomer(customerId: string, reason: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, message: 'Customer banned' })
    await httpClient.post(`/admin/customers/${customerId}/ban`, { reason })
    return { success: true, message: 'Customer banned' }
  },

  async bulkBanCustomers(customerIds: string[], reason = 'Khóa hàng loạt') {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, message: `${customerIds.length} customers banned` })
    await httpClient.post('/admin/customers/bulk-ban', { ids: customerIds, reason })
    return { success: true, message: `${customerIds.length} customers banned` }
  },

  async createSubscriptionPackage(data: Omit<SubscriptionPackage, 'id'>) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true, id: `pkg-${Date.now()}` })
    const res = await httpClient.post('/admin/subscription-packages', data)
    return res.data
  },

  async updateSubscriptionPackage(id: string, data: Partial<SubscriptionPackage>) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.patch(`/admin/subscription-packages/${id}`, data)
    return { success: true }
  },

  async deleteSubscriptionPackage(packageId: string) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.delete(`/admin/subscription-packages/${packageId}`)
    return { success: true }
  },

  async getSystemSettings() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockSystemSettings } = await import('@/mock/mockSystem')
        return { ...mockSystemSettings }
      })
    }
    const res = await httpClient.get('/admin/system-settings')
    return res.data
  },

  async updateSystemSettings(data: {
    logoUrl?: string
    hotline?: string
    supportEmail?: string
    facebook?: string
    zalo?: string
    website?: string
  }) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.patch('/admin/system-settings', data)
    return { success: true }
  },
}
