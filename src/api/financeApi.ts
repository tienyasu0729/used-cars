import { API_CONFIG } from '@/config/apiConfig'
import { mockResponse } from './mockService'
import { httpClient } from './baseApi'

export interface FinanceProfile {
  id: string
  companyName: string
  phone: string
  supportEmail: string
  logo?: string
  businessLicense?: string
  insuranceLicense?: string
  bankCertification?: string
}

export interface FinanceProduct {
  id: string
  type: 'bank' | 'insurance'
  interestRate?: number
  maxLoanTerm?: number
  maxLtv?: number
  vehicleInsuranceFee?: number
  liabilityInsuranceFee?: number
}

export interface FinanceLead {
  id: string
  customerName: string
  phone: string
  carInterest: string
  loanAmount: number
  status: 'new' | 'under_review' | 'approved' | 'rejected'
}

export interface AffiliateContract {
  id: string
  customer: string
  car: string
  loanAmount: number
  status: 'pending' | 'disbursed'
  commissionRate: number
  commissionAmount?: number
}

export const financeApi = {
  async getFinanceDashboard() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockFinanceStats } = await import('@/mock/mockFinance')
        return mockFinanceStats
      })
    }
    const res = await httpClient.get('/finance/dashboard')
    return res.data
  },

  async getFinanceProfile() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockFinanceProfile } = await import('@/mock/mockFinance')
        return { ...mockFinanceProfile }
      })
    }
    const res = await httpClient.get<FinanceProfile>('/finance/profile')
    return res.data
  },

  async updateFinanceProfile(id: string, data: Partial<FinanceProfile>) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.patch(`/finance/profile/${id}`, data)
    return { success: true }
  },

  async getFinanceProducts() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockFinanceProducts } = await import('@/mock/mockFinance')
        return [...mockFinanceProducts]
      })
    }
    const res = await httpClient.get<FinanceProduct[]>('/finance/products')
    return res.data
  },

  async updateFinanceProducts(data: FinanceProduct[]) {
    if (API_CONFIG.USE_MOCK) return mockResponse({ success: true })
    await httpClient.put('/finance/products', data)
    return { success: true }
  },

  async getLeads() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockFinanceLeads } = await import('@/mock/mockFinance')
        return [...mockFinanceLeads]
      })
    }
    const res = await httpClient.get<FinanceLead[]>('/finance/leads')
    return res.data
  },

  async updateLeadStatus(leadId: string, status: FinanceLead['status']) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockFinanceLeads } = await import('@/mock/mockFinance')
        const lead = mockFinanceLeads.find((l) => l.id === leadId)
        if (lead) lead.status = status
        return { success: true }
      })
    }
    await httpClient.patch(`/finance/leads/${leadId}`, { status })
    return { success: true }
  },

  async getAffiliateReports() {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockAffiliateReports } = await import('@/mock/mockFinance')
        return [...mockAffiliateReports]
      })
    }
    const res = await httpClient.get<AffiliateContract[]>('/finance/affiliate-reports')
    return res.data
  },

  async confirmLoanDisbursement(contractId: string) {
    if (API_CONFIG.USE_MOCK) {
      return mockResponse(async () => {
        const { mockAffiliateReports } = await import('@/mock/mockFinance')
        const c = mockAffiliateReports.find((r) => r.id === contractId)
        if (c) {
          c.status = 'disbursed'
          c.commissionAmount = Math.round(c.loanAmount * (c.commissionRate / 100))
        }
        return { success: true }
      })
    }
    await httpClient.post(`/finance/affiliate/${contractId}/confirm-payout`)
    return { success: true }
  },
}
