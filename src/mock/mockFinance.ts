import type { FinanceProfile, FinanceProduct, FinanceLead, AffiliateContract } from '@/api/financeApi'

export const mockFinanceProfile: FinanceProfile = {
  id: 'fp-001',
  companyName: 'Vietcombank Auto Finance',
  phone: '1900 1234',
  supportEmail: 'auto@vcb.com.vn',
}

export const mockFinanceProducts: FinanceProduct[] = [
  { id: 'prod-1', type: 'bank', interestRate: 7.5, maxLoanTerm: 8, maxLtv: 80 },
  { id: 'prod-2', type: 'insurance', vehicleInsuranceFee: 2.5, liabilityInsuranceFee: 1.2 },
]

export const mockFinanceLeads: FinanceLead[] = [
  { id: 'lead-1', customerName: 'Nguyễn Văn A', phone: '0901234567', carInterest: 'Toyota Camry 2024', loanAmount: 500_000_000, status: 'new' },
  { id: 'lead-2', customerName: 'Trần Thị B', phone: '0907654321', carInterest: 'Honda CR-V 2023', loanAmount: 800_000_000, status: 'under_review' },
  { id: 'lead-3', customerName: 'Lê Văn C', phone: '0912345678', carInterest: 'VinFast VF 8', loanAmount: 350_000_000, status: 'approved' },
]

export const mockAffiliateReports: AffiliateContract[] = [
  { id: 'c-1', customer: 'Nguyễn A', car: 'Toyota Camry', loanAmount: 500_000_000, status: 'pending', commissionRate: 1.5 },
  { id: 'c-2', customer: 'Trần B', car: 'Honda CR-V', loanAmount: 800_000_000, status: 'disbursed', commissionRate: 1.5, commissionAmount: 12_000_000 },
]

export const mockFinanceStats = {
  leadsThisMonth: 24,
  conversionRate: 12.5,
  totalLoanApproved: 4_200_000_000,
  insuranceContracts: 18,
}
