import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Card, Button, Modal } from '@/components'
import { customerApi } from '@/api/customerApi'
import { useQuery } from '@tanstack/react-query'

export function AppointmentsPage() {
  const [qrModalId, setQrModalId] = useState<string | null>(null)

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => customerApi.getAppointments(),
  })

  const selected = appointments.find((a) => a.id === qrModalId)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Lịch hẹn xem xe</h1>
      <div className="space-y-4">
        {appointments.map((apt) => (
          <Card key={apt.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">{apt.carName}</p>
                <p className="text-sm text-gray-600">{apt.showroomName}</p>
                <p className="text-sm text-gray-600">{apt.date} - {apt.time}</p>
                <span
                  className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${
                    apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {apt.status}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setQrModalId(apt.id)}>
                Mã QR
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!qrModalId} onClose={() => setQrModalId(null)} title="Mã QR hẹn xem xe">
        {selected && (
          <div className="flex flex-col items-center py-4">
            <QRCodeSVG value={selected.id} size={200} />
            <p className="mt-4 text-sm text-gray-600">Mã: {selected.id}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
