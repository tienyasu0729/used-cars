export interface ReviewResponse {
  id: number
  rating: number
  comment: string | null
  reviewerName: string | null
  reviewerAvatar: string | null
  anonymous: boolean
  status: string
  createdAt: string
  vehicleId: number | null
  vehicleTitle: string | null
}

export interface ReviewSummary {
  averageRating: number | null
  totalReviews: number
  ratingDistribution: Record<number, number>
}

export interface CanReviewResponse {
  canReview: boolean
  reason: string | null
}

export interface SubmitReviewRequest {
  rating: number
  comment?: string
  anonymous?: boolean
  bookingId: number
}
