import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Modal, Input } from '@/components'
import { adminApi } from '@/api/adminApi'
import { formatVnd } from '@/utils/formatters'

export function RefundApprovalPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  const { data: requests = [] } = useQuery({
    queryKey: ['refund-requests'],
    queryFn: () => adminApi.getPendingRefundRequests(),
  })

  const approveMutation = useMutation({
    mutationFn: (transactionId: string) => adminApi.executeRefund(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] })
      setShowApproveModal(false)
      setSelectedId(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectRefund(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] })
      setShowRejectModal(false)
      setSelectedId(null)
    },
  })

  const handleApprove = (transactionId: string) => {
    setSelectedId(transactionId)
    setShowApproveModal(true)
  }

  const handleReject = (id: string) => {
    setSelectedId(id)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const confirmApprove = () => {
    if (selectedId) approveMutation.mutate(selectedId)
  }

  const confirmReject = () => {
    if (selectedId && rejectReason.trim()) rejectMutation.mutate({ id: selectedId, reason: rejectReason })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Phê duyệt hoàn trả tiền cọc</h1>

      <div className="space-y-6">
        {requests.map((req) => (
          <Card key={req.id} className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h3>
                <p className="text-sm text-gray-600">Tên: {req.customerName}</p>
                <p className="text-sm text-gray-600">SĐT: {req.customerPhone}</p>
                <p className="text-sm text-gray-600">Email: {req.customerEmail}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Thông tin xe</h3>
                <p className="text-sm text-gray-600">Xe: {req.carName}</p>
                <p className="text-sm text-gray-600">VIN: {req.carVin}</p>
                <p className="text-sm text-gray-600">Tiền cọc: {formatVnd(req.depositAmount)}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Thông tin showroom</h3>
                <p className="text-sm text-gray-600">Showroom: {req.showroomName}</p>
                <p className="text-sm text-gray-600">SĐT: {req.showroomPhone}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Bằng chứng kiểm tra</h3>
              <p className="text-sm text-gray-600 mb-2">Báo cáo 142-point: {req.inspectionSummary}</p>
              <p className="text-sm text-gray-600 mb-2">Ảnh hư hỏng: {req.damagePhotos.length} ảnh</p>
              <p className="text-sm text-gray-600">Ghi chú staff: {req.staffNotes}</p>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="primary" onClick={() => handleApprove(req.transactionId)}>
                Duyệt hoàn cọc
              </Button>
              <Button variant="danger" onClick={() => handleReject(req.id)}>
                Từ chối
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <Card className="p-8 text-center text-gray-500">Không có yêu cầu hoàn cọc chờ duyệt</Card>
      )}

      <Modal open={showApproveModal} onClose={() => setShowApproveModal(false)} title="Xác nhận duyệt hoàn cọc">
        <p className="text-gray-600 mb-4">Bạn có chắc muốn duyệt hoàn cọc cho giao dịch này?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowApproveModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={confirmApprove} disabled={approveMutation.isPending}>
            Duyệt
          </Button>
        </div>
      </Modal>

      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)} title="Từ chối hoàn cọc">
        <div className="space-y-4">
          <Input
            label="Lý do từ chối"
            placeholder="Nhập lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={confirmReject}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Đang xử lý...' : 'Từ chối'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
