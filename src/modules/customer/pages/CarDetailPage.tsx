import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, Card, Modal, CarImage } from '@/components'
import { customerApi } from '@/api/customerApi'
import { useQuery } from '@tanstack/react-query'
import { formatVnd } from '@/utils/formatters'

const INSPECTION_SECTIONS = [
  { title: 'Kiểm tra ngoại thất', items: ['Sơn xe', 'Kính chắn gió', 'Đèn pha', 'Lốp xe'], passed: [true, true, false, true] },
  { title: 'Kiểm tra nội thất', items: ['Ghế ngồi', 'Táp lô', 'Điều hòa', 'Hệ thống âm thanh'], passed: [true, true, true, true] },
  { title: 'Kiểm tra động cơ', items: ['Động cơ', 'Hệ thống làm mát', 'Dầu máy'], passed: [true, true, true] },
  { title: 'Hệ thống điện', items: ['Ắc quy', 'Hệ thống phanh', 'Cảm biến'], passed: [true, true, true] },
]

export function CarDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [imageIndex, setImageIndex] = useState(0)
  const [showNegotiateModal, setShowNegotiateModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)
  const [appointmentId, setAppointmentId] = useState('apt-demo')
  const [loanAmount, setLoanAmount] = useState('')
  const [interestRate, setInterestRate] = useState('8')
  const [termMonths, setTermMonths] = useState('12')

  const { data: car } = useQuery({
    queryKey: ['car', id],
    queryFn: () => customerApi.getCarById(id!),
    enabled: !!id,
  })

  const monthlyPayment =
    loanAmount && interestRate && termMonths
      ? Math.round(
          (Number(loanAmount) * (Number(interestRate) / 100 / 12) * Math.pow(1 + Number(interestRate) / 100 / 12, Number(termMonths))) /
            (Math.pow(1 + Number(interestRate) / 100 / 12, Number(termMonths)) - 1)
        )
      : 0

  if (!car) return <div className="p-6">Đang tải...</div>

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="relative overflow-hidden rounded-xl">
            <CarImage car={car} index={imageIndex % (car.images?.length ?? 1)} aspectRatio="video" />
            {(car.images?.length ?? 0) > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setImageIndex((i) => (i + 1) % (car.images?.length ?? 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <span className="inline-block bg-[#FF6600] text-white text-xs px-2 py-0.5 rounded mb-2">SCUDN Certified</span>
          <h1 className="text-2xl font-bold text-gray-900">{car.name} {car.model}</h1>
          <p className="text-2xl font-bold text-[#FF6600] mt-2">{formatVnd(car.price)}</p>
          <p className="text-gray-600 mt-1">📍 {car.location ?? 'Đà Nẵng'}</p>
          <p className="text-lg text-gray-600 mt-2">CarHub Motors • ⭐ 4.8</p>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setShowNegotiateModal(true)}>
              Đàm phán giá
            </Button>
            <Button variant="primary" onClick={() => setShowBookingModal(true)}>
              Đặt lịch xem xe
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Báo cáo kiểm tra 142 điểm</h2>
        <div className="space-y-6">
          {INSPECTION_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-800 mb-2">{section.title}</h3>
              <div className="grid grid-cols-2 gap-2">
                {section.items.map((item, i) => (
                  <div key={item} className="flex items-center gap-2">
                    {section.passed[i] ? (
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tính toán vay</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Số tiền vay (VND)</label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="VD: 500000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Lãi suất (%/năm)</label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Kỳ hạn (tháng)</label>
            <input
              type="number"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <p className="mt-4 text-lg font-semibold text-[#FF6600]">
          Trả hàng tháng: {monthlyPayment > 0 ? formatVnd(monthlyPayment) : '-'}
        </p>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" size="lg" onClick={() => setShowQrModal(true)}>
          Lấy mã QR hẹn xem xe
        </Button>
        <Link to={`/checkout/${car.id}`}>
          <Button variant="primary" size="lg">
            Đặt cọc ngay
          </Button>
        </Link>
      </div>

      <Modal open={showNegotiateModal} onClose={() => setShowNegotiateModal(false)} title="Đàm phán giá" size="lg">
        <div className="space-y-4">
          <p className="text-gray-600">Gửi đề xuất giá của bạn cho showroom.</p>
          <input
            type="number"
            placeholder="Giá đề xuất (VND)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <textarea placeholder="Lời nhắn..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowNegotiateModal(false)}>
              Hủy
            </Button>
            <Button variant="primary">Gửi đề xuất</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showBookingModal} onClose={() => setShowBookingModal(false)} title="Đặt lịch xem xe" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ngày</label>
            <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Giờ</label>
            <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowBookingModal(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                const apt = await customerApi.createAppointment({
                  carId: car.id,
                  date: new Date().toISOString().slice(0, 10),
                  time: '10:00',
                })
                setAppointmentId(apt.id)
                setShowBookingModal(false)
                setShowQrModal(true)
              }}
            >
              Đặt lịch
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={showQrModal} onClose={() => setShowQrModal(false)} title="Mã QR hẹn xem xe">
        <div className="flex flex-col items-center py-4">
          <QRCodeSVG value={appointmentId} size={192} />
          <p className="mt-4 text-sm text-gray-600">Mã: {appointmentId}</p>
          <p className="text-xs text-gray-500 mt-1">Showroom quét mã để xác nhận</p>
        </div>
      </Modal>
    </div>
  )
}
