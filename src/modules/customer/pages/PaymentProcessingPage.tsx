import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { customerPaymentApi } from '@/api/customerPaymentApi'
import type { PaymentMethod } from '@/types/payment'

const DEPOSIT_AMOUNT = 20_000_000
const API_TIMEOUT_MS = 10_000

const GATEWAY_LABELS: Record<PaymentMethod, string> = {
  vnpay: 'VNPay',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
}

export function PaymentProcessingPage() {
  const { carId } = useParams<{ carId: string }>()
  const [searchParams] = useSearchParams()
  const method = (searchParams.get('method') || 'vnpay') as PaymentMethod
  const [error, setError] = useState<string | null>(null)

  const doRedirect = useCallback(async () => {
    if (!carId) {
      setError('Thiếu thông tin xe')
      return
    }
    setError(null)
    try {
      const res = await Promise.race([
        customerPaymentApi.createDepositPayment({ carId, amount: DEPOSIT_AMOUNT, method }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), API_TIMEOUT_MS)
        ),
      ])
      window.location.href = res.paymentUrl
    } catch (e) {
      setError(e instanceof Error && e.message === 'timeout'
        ? 'Kết nối tới cổng thanh toán đang chậm. Vui lòng thử lại.'
        : 'Không thể kết nối cổng thanh toán')
    }
  }, [carId, method])

  useEffect(() => {
    doRedirect()
  }, [doRedirect])

  const handleRetry = () => doRedirect()

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <p className="text-red-600 text-center">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-4 px-6 py-2 bg-[#FF6600] text-white rounded-lg font-medium"
        >
          Thử lại
        </button>
        <a href="/" className="mt-4 text-[#FF6600] font-medium">
          Quay về trang chủ
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <Loader2 className="w-16 h-16 text-[#FF6600] animate-spin mb-6" />
      <p className="text-gray-700 text-center max-w-sm">
        Vui lòng đợi, đang chuyển hướng an toàn đến Cổng thanh toán...
      </p>
      <div className="mt-8 flex gap-4 text-xs text-gray-400">
        <span>SCUDN</span>
        <span>•</span>
        <span>{GATEWAY_LABELS[method]}</span>
      </div>
    </div>
  )
}
