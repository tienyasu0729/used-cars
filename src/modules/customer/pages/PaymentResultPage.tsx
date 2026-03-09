import { useSearchParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button, Card } from '@/components'
import { formatVnd } from '@/utils/formatters'
import { usePayment } from '@/hooks/usePayment'
import { customerPaymentApi } from '@/api/customerPaymentApi'
import type { PaymentResult } from '@/api/customerPaymentApi'

const GATEWAY_LABELS: Record<string, string> = {
  vnpay: 'VNPay',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
}

export function PaymentResultPage() {
  const [searchParams] = useSearchParams()
  const transactionId = searchParams.get('transactionId') || ''
  const carId = searchParams.get('carId') || ''
  const [verified, setVerified] = useState<PaymentResult | null>(null)
  const [verifying, setVerifying] = useState(true)
  const { reset } = usePayment()

  useEffect(() => {
    if (!transactionId) {
      setVerifying(false)
      setVerified({ status: 'FAILED', reason: 'Thiếu mã giao dịch' })
      return
    }
    const urlParams = { status: searchParams.get('status') ?? '' }
    customerPaymentApi
      .verifyPayment(transactionId, urlParams)
      .then((res) => {
        setVerified(res)
        if (res.status === 'SUCCESS') reset()
      })
      .catch(() => setVerified({ status: 'FAILED', reason: 'Xác minh thất bại' }))
      .finally(() => setVerifying(false))
  }, [transactionId, reset])

  if (verifying) {
    return (
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="w-16 h-16 text-[#FF6600] animate-spin mb-6" />
          <p className="text-gray-700">Đang xác minh giao dịch với cổng thanh toán...</p>
        </div>
      </div>
    )
  }

  const isSuccess = verified?.status === 'SUCCESS'

  if (isSuccess && verified) {
    const amount = verified.amount ?? 20_000_000
    const methodLabel = verified.method ? GATEWAY_LABELS[verified.method] || verified.method : '—'
    const paidAt = verified.paidAt
      ? new Date(verified.paidAt).toLocaleString('vi-VN')
      : new Date().toLocaleString('vi-VN')

    return (
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Thanh toán Đặt cọc Thành công!
          </h1>
          <Card className="w-full p-4 mt-6 text-left space-y-2">
            <p className="text-sm text-gray-600">Xe: {verified.carName ?? '—'}</p>
            <p className="text-sm text-gray-600">Số tiền: {formatVnd(amount)}</p>
            <p className="text-sm text-gray-600">Mã giao dịch: {verified.transactionId}</p>
            <p className="text-sm text-gray-600">Phương thức: {methodLabel}</p>
            <p className="text-sm text-gray-600">Thời gian: {paidAt}</p>
          </Card>
          <div className="flex flex-col gap-3 w-full mt-6">
            <Link to="/account/appointments">
              <Button variant="primary" size="lg" className="w-full">
                Xem mã QR lịch hẹn
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg" className="w-full">
                Quay về trang chủ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <XCircle className="w-20 h-20 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Thanh toán thất bại hoặc Giao dịch bị hủy
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Có thể do số dư không đủ hoặc bạn đã hủy giao dịch.
        </p>
        <div className="flex flex-col gap-3 w-full">
          {carId && (
            <Link to={`/checkout/${carId}`}>
              <Button variant="primary" size="lg" className="w-full">
                Thử thanh toán lại
              </Button>
            </Link>
          )}
          <Link to={carId ? `/cars/${carId}` : '/'}>
            <Button variant="outline" size="lg" className="w-full">
              {carId ? 'Quay về trang chi tiết xe' : 'Quay về trang chủ'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
