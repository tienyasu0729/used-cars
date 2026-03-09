import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, CarImage } from '@/components'
import { customerApi } from '@/api/customerApi'
import { useQuery } from '@tanstack/react-query'
import { formatVnd } from '@/utils/formatters'
import { usePayment } from '@/hooks/usePayment'
import type { PaymentMethod } from '@/types/payment'
import { Loader2 } from 'lucide-react'

const DEPOSIT_AMOUNT = 20_000_000

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vnpay')
  const { startPayment, isProcessing, getTransactionStatus } = usePayment()
  const { status, carId, method: storedMethod } = getTransactionStatus()

  const { data: car } = useQuery({
    queryKey: ['car', id],
    queryFn: () => customerApi.getCarById(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (status === 'PROCESSING' && carId === id) {
      window.location.href = `/payment/processing/${id}?method=${storedMethod || paymentMethod}`
    }
  }, [status, carId, id, storedMethod, paymentMethod])

  const handlePayment = () => {
    if (id) startPayment({ carId: id, amount: DEPOSIT_AMOUNT, method: paymentMethod })
  }

  const paying = isProcessing && carId === id

  if (!car) return <div className="p-6">Đang tải...</div>

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-[#FF6600] mb-8">Thanh toán đặt cọc</h1>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Thông tin xe</h2>
        <div className="flex gap-4">
          <div className="w-32 h-24 rounded shrink-0 overflow-hidden">
            <CarImage car={car} aspectRatio="fill" className="h-full w-full" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{car.name} {car.model}</p>
            <p className="text-sm text-gray-600">CarHub Motors</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Số tiền đặt cọc</h2>
        <p className="text-2xl font-bold text-[#FF6600]">{formatVnd(DEPOSIT_AMOUNT)}</p>
        <p className="text-sm text-gray-500 mt-2">Tiền cọc giữ xe trong 48 giờ</p>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Phương thức thanh toán</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === 'vnpay'}
              onChange={() => setPaymentMethod('vnpay')}
            />
            <span>VNPay</span>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === 'momo'}
              onChange={() => setPaymentMethod('momo')}
            />
            <span>MoMo</span>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === 'zalopay'}
              onChange={() => setPaymentMethod('zalopay')}
            />
            <span>ZaloPay</span>
          </label>
        </div>
      </Card>

      <Button
        variant="primary"
        onClick={handlePayment}
        className="w-full"
        size="lg"
        disabled={paying}
      >
        {paying ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
            Đang chuyển hướng...
          </>
        ) : (
          'Thanh toán đặt cọc'
        )}
      </Button>
    </div>
  )
}
