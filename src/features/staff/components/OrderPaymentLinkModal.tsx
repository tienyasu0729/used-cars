import { useState } from 'react'
import { CheckCircle, Copy, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui'

interface OrderPaymentLinkModalProps {
  orderNumber: string
  orderId: number
  paymentUrl: string
  gateway: 'vnpay' | 'zalopay'
  customerEmail?: string
  onClose: () => void
}

// Modal hien thi link thanh toan + QR sau khi staff tao don online thanh cong
export function OrderPaymentLinkModal({
  orderNumber,
  paymentUrl,
  gateway,
  customerEmail,
  onClose,
}: OrderPaymentLinkModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = paymentUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(paymentUrl)}`
  const gatewayLabel = gateway === 'vnpay' ? 'VNPay' : 'ZaloPay'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Tạo đơn thành công</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 flex items-start gap-3 rounded-lg bg-green-50 p-4">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          <div className="text-sm">
            <p className="font-semibold text-green-800">Đơn hàng {orderNumber} đã được tạo!</p>
            <p className="mt-1 text-green-700">
              Link thanh toán {gatewayLabel} đã được tạo.
              {customerEmail && (
                <> Email thông báo đã gửi đến <span className="font-medium">{customerEmail}</span>.</>
              )}
            </p>
          </div>
        </div>

        <div className="mb-4 flex justify-center">
          <img
            src={qrUrl}
            alt={`QR thanh toán ${gatewayLabel}`}
            className="h-[220px] w-[220px] rounded-lg border border-slate-200 bg-white p-1"
          />
        </div>
        <p className="mb-3 text-center text-xs text-slate-500">
          Khách hàng quét mã QR hoặc mở link bên dưới để thanh toán
        </p>

        <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <input
            type="text"
            readOnly
            value={paymentUrl}
            className="min-w-0 flex-1 truncate bg-transparent text-xs text-slate-600 outline-none"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1 rounded bg-[#1A3C6E] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#15325A]"
          >
            {copied ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Đã copy
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>

        <a
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 flex items-center justify-center gap-1 text-sm font-medium text-[#1A3C6E] hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          Mở link thanh toán (tab mới)
        </a>

        <Button className="w-full" onClick={onClose}>
          Về danh sách đơn hàng
        </Button>
      </div>
    </div>
  )
}
