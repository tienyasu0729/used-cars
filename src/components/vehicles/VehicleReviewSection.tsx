import { useState } from 'react'
import { Star, ChevronDown } from 'lucide-react'
import { useVehicleReviews, useReviewSummary, useCanReview, useSubmitReview } from '@/hooks/useReviews'
import { useAuthStore } from '@/store/authStore'
import { useBookings } from '@/hooks/useBookings'
import { Spinner } from '@/components/ui'

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => setHover(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star
            className={`h-5 w-5 transition ${
              s <= (hover || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right text-gray-500">{star} ★</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-gray-400">{count}</span>
    </div>
  )
}

export function VehicleReviewSection({ vehicleId }: { vehicleId: number }) {
  const { isAuthenticated } = useAuthStore()
  const [page, setPage] = useState(0)

  const { data: summary } = useReviewSummary(vehicleId)
  const { data: reviewsData, isLoading } = useVehicleReviews(vehicleId, { page, size: 5 })
  const { data: canReviewData } = useCanReview(vehicleId, isAuthenticated)

  const reviews = reviewsData?.items ?? []
  const meta = reviewsData?.meta

  return (
    <section id="reviews" className="mt-10 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Đánh giá từ khách hàng</h2>

      {summary && (
        <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4">
            <span className="text-4xl font-bold text-gray-900">
              {summary.averageRating != null ? summary.averageRating.toFixed(1) : '—'}
            </span>
            {summary.averageRating != null && (
              <StarRating value={Math.round(summary.averageRating)} readonly />
            )}
            <span className="mt-1 text-sm text-gray-400">{summary.totalReviews} đánh giá</span>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((s) => (
              <RatingBar
                key={s}
                star={s}
                count={summary.ratingDistribution?.[s] ?? 0}
                total={summary.totalReviews}
              />
            ))}
          </div>
        </div>
      )}

      {canReviewData?.canReview ? (
        <ReviewForm vehicleId={vehicleId} />
      ) : canReviewData?.reason ? (
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          {canReviewData.reason}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : reviews.length === 0 ? (
        <p className="py-6 text-center text-gray-400">Chưa có đánh giá nào cho xe này.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-t border-gray-100 pt-4 first:border-0 first:pt-0">
              <div className="flex items-start gap-3">
                {r.reviewerAvatar && !r.anonymous ? (
                  <img src={r.reviewerAvatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-400">
                    {r.anonymous ? '?' : (r.reviewerName?.[0] ?? '?')}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{r.reviewerName ?? 'Ẩn danh'}</span>
                    <StarRating value={r.rating} readonly />
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-gray-600">{r.comment}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          {page < meta.totalPages - 1 && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 text-sm font-medium text-[#1A3C6E] hover:underline"
            >
              Xem thêm đánh giá <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function ReviewForm({ vehicleId }: { vehicleId: number }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [anonymous, setAnonymous] = useState(false)

  const { data: bookings } = useBookings()
  const submitReview = useSubmitReview(vehicleId)

  const completedBookings = (bookings ?? []).filter(
    (b) => b.status === 'Completed' && b.vehicleId === vehicleId
  )
  const latestCompletedBooking = completedBookings
    .slice()
    .sort((a, b) => {
      const aTs = new Date(`${a.bookingDate}T${a.timeSlot}`).getTime()
      const bTs = new Date(`${b.bookingDate}T${b.timeSlot}`).getTime()
      return bTs - aTs
    })[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating || !latestCompletedBooking) return
    await submitReview.mutateAsync({
      rating,
      comment: comment || undefined,
      anonymous,
      bookingId: latestCompletedBooking.id,
    })
    setRating(0)
    setComment('')
    setAnonymous(false)
  }

  if (completedBookings.length === 0) {
    return (
      <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        Hoàn tất lái thử xe này để có thể gửi đánh giá.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">Gửi đánh giá của bạn</h3>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm text-gray-600">Đánh giá:</span>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Nhận xét của bạn (không bắt buộc)..."
        rows={3}
        className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
      />

      <div className="mb-3 flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="anonymous" className="text-sm text-gray-600">Đánh giá ẩn danh</label>
      </div>

      <button
        type="submit"
        disabled={!rating || !latestCompletedBooking || submitReview.isPending}
        className="rounded-lg bg-[#1A3C6E] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#15325A] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitReview.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>

      {submitReview.isSuccess && (
        <p className="mt-2 text-sm text-green-600">Đánh giá đã được gửi thành công!</p>
      )}
    </form>
  )
}
