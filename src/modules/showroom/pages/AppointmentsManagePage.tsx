import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Modal } from '@/components'
import { showroomApi } from '@/api/showroomApi'
import { Check, X, Calendar } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface Appointment {
  id: string
  customerName: string
  carName: string
  appointmentTime: string
  status: string
}

export function AppointmentsManagePage() {
  const queryClient = useQueryClient()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const { data: appointments = [] } = useQuery({
    queryKey: ['showroom-appointments'],
    queryFn: () => showroomApi.getAppointments(),
  })

  const confirmMutation = useMutation({
    mutationFn: (id: string) => showroomApi.confirmAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showroom-appointments'] })
      setShowConfirmModal(false)
      setSelectedAppointment(null)
    },
  })

  const statusLabels: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Lịch hẹn & Quét QR</h1>

      <div className="mb-6">
        <Link to="/showroom/qr-scanner">
          <Button variant="outline">Mở Camera Quét QR</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">Khách hàng</th>
              <th className="text-left py-3 px-4">Xe</th>
              <th className="text-left py-3 px-4">Thời gian</th>
              <th className="text-left py-3 px-4">Trạng thái</th>
              <th className="text-left py-3 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr
                key={apt.id}
                className={`border-b border-gray-100 hover:bg-gray-50 ${apt.status === 'pending' ? 'bg-amber-50/50' : ''}`}
              >
                <td className="py-3 px-4 font-medium">{apt.customerName}</td>
                <td className="py-3 px-4">{apt.carName}</td>
                <td className="py-3 px-4">{apt.appointmentTime}</td>
                <td className="py-3 px-4">{statusLabels[apt.status]}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {apt.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(apt)
                            setShowConfirmModal(true)
                          }}
                          disabled={confirmMutation.isPending}
                        >
                          {confirmMutation.isPending && selectedAppointment?.id === apt.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {appointments.length === 0 && (
        <Card className="p-8 text-center text-gray-500 mt-4">Chưa có lịch hẹn</Card>
      )}

      <Modal open={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Xác nhận lịch hẹn">
        <p className="text-gray-600 mb-4">
          Bạn có chắc muốn xác nhận lịch hẹn {selectedAppointment?.customerName} - {selectedAppointment?.carName}?
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={confirmMutation.isPending}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => selectedAppointment && confirmMutation.mutate(selectedAppointment.id)}
            disabled={confirmMutation.isPending}
          >
            {confirmMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Xác nhận
          </Button>
        </div>
      </Modal>
    </div>
  )
}
