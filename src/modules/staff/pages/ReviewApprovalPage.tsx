import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Modal } from '@/components'
import { staffApi } from '@/api/staffApi'
import { Star } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface PendingReview {
  id: string
  reviewerName: string
  showroom: string
  reviewText: string
  rating: number
  createdAt: string
}

export function ReviewApprovalPage() {
  const queryClient = useQueryClient()
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showHideModal, setShowHideModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null)

  const { data: reviews = [] } = useQuery({
    queryKey: ['staff-pending-reviews'],
    queryFn: () => staffApi.getPendingReviews(),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => staffApi.approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-pending-reviews'] })
      setShowApproveModal(false)
      setSelectedReview(null)
    },
  })

  const hideMutation = useMutation({
    mutationFn: (id: string) => staffApi.hideReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-pending-reviews'] })
      setShowHideModal(false)
      setSelectedReview(null)
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Duyệt đánh giá</h1>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">{review.reviewerName}</span>
                  <span className="text-sm text-gray-500">• {review.showroom}</span>
                </div>
                <p className="text-gray-600 mb-2">{review.reviewText}</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-1">{review.createdAt}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedReview(review)
                    setShowApproveModal(true)
                  }}
                  disabled={approveMutation.isPending || hideMutation.isPending}
                >
                  Duyệt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedReview(review)
                    setShowHideModal(true)
                  }}
                  disabled={approveMutation.isPending || hideMutation.isPending}
                >
                  Ẩn
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <Card className="p-8 text-center text-gray-500">Không có đánh giá chờ duyệt</Card>
      )}

      <Modal open={showApproveModal} onClose={() => setShowApproveModal(false)} title="Duyệt đánh giá">
        <p className="text-gray-600 mb-4">Bạn có chắc muốn duyệt đánh giá này?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowApproveModal(false)} disabled={approveMutation.isPending}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => selectedReview && approveMutation.mutate(selectedReview.id)}
            disabled={approveMutation.isPending}
          >
            {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Duyệt
          </Button>
        </div>
      </Modal>

      <Modal open={showHideModal} onClose={() => setShowHideModal(false)} title="Ẩn đánh giá">
        <p className="text-gray-600 mb-4">Bạn có chắc muốn ẩn đánh giá này?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowHideModal(false)} disabled={hideMutation.isPending}>
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={() => selectedReview && hideMutation.mutate(selectedReview.id)}
            disabled={hideMutation.isPending}
          >
            {hideMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Ẩn
          </Button>
        </div>
      </Modal>
    </div>
  )
}
