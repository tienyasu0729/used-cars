import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Modal, Input } from '@/components'
import { staffApi } from '@/api/staffApi'
import { formatVnd } from '@/utils/formatters'
import { Loader2 } from 'lucide-react'

export function CarApprovalPage() {
  const queryClient = useQueryClient()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectComment, setRejectComment] = useState('')
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const { data: cars = [] } = useQuery({
    queryKey: ['staff-pending-cars'],
    queryFn: () => staffApi.getPendingCars(),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => staffApi.approveCar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-pending-cars'] })
      setApprovingId(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => staffApi.rejectCar(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-pending-cars'] })
      setRejectingId(null)
      setRejectComment('')
    },
  })

  const handleReject = (id: string) => {
    setRejectingId(id)
    setRejectComment('')
  }

  const confirmReject = () => {
    if (rejectingId && rejectComment.trim()) {
      rejectMutation.mutate({ id: rejectingId, comment: rejectComment })
    }
  }

  const confirmApprove = () => {
    if (approvingId) approveMutation.mutate(approvingId)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Duyệt tin đăng xe</h1>

      <div className="space-y-4">
        {cars.map((car) => (
          <Card key={car.id} className="p-6">
            <div className="flex gap-6">
              <div className="w-32 h-24 bg-gray-200 rounded flex items-center justify-center shrink-0">
                <span className="text-gray-400 text-xs">Ảnh xe</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{car.carName}</h3>
                <p className="text-sm text-gray-500">Showroom: {car.showroom}</p>
                <p className="text-lg font-bold text-[#FF6600] mt-1">{formatVnd(car.price)}</p>
                <p className="text-sm text-gray-500">Đăng lúc: {car.submittedAt}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setApprovingId(car.id)}
                  disabled={approveMutation.isPending}
                >
                  Duyệt
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleReject(car.id)}>
                  Từ chối
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {cars.length === 0 && (
        <Card className="p-8 text-center text-gray-500">Không có tin đăng chờ duyệt</Card>
      )}

      <Modal open={!!approvingId} onClose={() => setApprovingId(null)} title="Duyệt tin đăng xe">
        <p className="text-gray-600 mb-4">Bạn có chắc chắn muốn duyệt tin đăng xe này?</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setApprovingId(null)} disabled={approveMutation.isPending}>
            Hủy
          </Button>
          <Button variant="primary" onClick={confirmApprove} disabled={approveMutation.isPending}>
            {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Xác nhận
          </Button>
        </div>
      </Modal>

      <Modal open={!!rejectingId} onClose={() => setRejectingId(null)} title="Từ chối tin đăng">
        <div className="space-y-4">
          <Input
            label="Lý do từ chối (bắt buộc)"
            placeholder="Nhập lý do..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRejectingId(null)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={confirmReject} disabled={!rejectComment.trim() || rejectMutation.isPending}>
              Từ chối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
