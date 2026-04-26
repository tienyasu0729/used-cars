import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import type {
  CanReviewResponse,
  ReviewResponse,
  ReviewSummary,
  SubmitReviewRequest,
} from '@/types/review.types'

interface PageMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

function unwrapMeta(raw: unknown): PageMeta {
  const m = raw as Record<string, number>
  return {
    page: m?.page ?? 0,
    size: m?.size ?? 10,
    totalElements: m?.totalElements ?? 0,
    totalPages: m?.totalPages ?? 0,
  }
}

export const reviewService = {
  async getApprovedReviews(vehicleId: number, params: { page?: number; size?: number }) {
    const res = (await axiosInstance.get(`/vehicles/${vehicleId}/reviews`, { params })) as unknown as ApiResponse<ReviewResponse[]>
    return { items: res.data ?? [], meta: unwrapMeta(res.meta) }
  },

  async getReviewSummary(vehicleId: number): Promise<ReviewSummary> {
    const res = (await axiosInstance.get(`/vehicles/${vehicleId}/reviews/summary`)) as unknown as ApiResponse<ReviewSummary>
    return res.data
  },

  async canReview(vehicleId: number): Promise<CanReviewResponse> {
    const res = (await axiosInstance.get(`/vehicles/${vehicleId}/reviews/can-review`)) as unknown as ApiResponse<CanReviewResponse>
    return res.data
  },

  async submitReview(vehicleId: number, body: SubmitReviewRequest): Promise<ReviewResponse> {
    const res = (await axiosInstance.post(`/vehicles/${vehicleId}/reviews`, body)) as unknown as ApiResponse<ReviewResponse>
    return res.data
  },

  // Admin
  async getAdminReviews(params: { vehicleId?: number; status?: string; page?: number; size?: number }) {
    const res = (await axiosInstance.get('/admin/reviews', { params })) as unknown as ApiResponse<ReviewResponse[]>
    return { items: res.data ?? [], meta: unwrapMeta(res.meta) }
  },

  async approveReview(id: number): Promise<ReviewResponse> {
    const res = (await axiosInstance.patch(`/admin/reviews/${id}/approve`)) as unknown as ApiResponse<ReviewResponse>
    return res.data
  },

  async rejectReview(id: number): Promise<ReviewResponse> {
    const res = (await axiosInstance.patch(`/admin/reviews/${id}/reject`)) as unknown as ApiResponse<ReviewResponse>
    return res.data
  },

  async hideReview(id: number): Promise<ReviewResponse> {
    const res = (await axiosInstance.patch(`/admin/reviews/${id}/hide`)) as unknown as ApiResponse<ReviewResponse>
    return res.data
  },

  async deleteReview(id: number): Promise<void> {
    await axiosInstance.delete(`/admin/reviews/${id}`)
  },
}
