import axiosInstance from '@/utils/axiosInstance'
import type { ManagerPricingEstimateRequest, ManagerPricingEstimateResponse } from '@/types/pricing.types'

const PRICING_REQUEST_TIMEOUT_MS = 600_000

export const managerPricingService = {
  estimate: async (payload: ManagerPricingEstimateRequest): Promise<ManagerPricingEstimateResponse> => {
    const res = await axiosInstance.post<{ data: ManagerPricingEstimateResponse }>(
      '/manager/vehicle-pricing/estimate',
      payload,
      { timeout: PRICING_REQUEST_TIMEOUT_MS },
    )
    return (res as unknown as { data?: ManagerPricingEstimateResponse }).data ?? (res as ManagerPricingEstimateResponse)
  },
}
