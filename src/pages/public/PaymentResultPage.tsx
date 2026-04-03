import { Link, useSearchParams } from 'react-router-dom'

export function PaymentResultPage() {
  const [sp] = useSearchParams()
  const success = sp.get('success') === 'true'
  const code = sp.get('code') ?? ''
  const orderId = sp.get('orderId')

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="mb-2 text-2xl font-black text-slate-900">
        {success ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất'}
      </h1>
      <p className="mb-6 text-slate-600">
        {success
          ? 'Đơn hàng đã được cập nhật. Bạn có thể xem chi tiết trong mục đơn hàng.'
          : `Mã trả về: ${code || '—'}. Nếu tiền đã trừ, vui lòng chờ xác nhận hoặc liên hệ hỗ trợ.`}
      </p>
      {orderId && (
        <p className="mb-6 text-sm text-slate-500">
          Mã đơn (tham chiếu): <span className="font-mono font-semibold">{orderId}</span>
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/dashboard/orders"
          className="rounded-lg bg-[#1A3C6E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1A3C6E]/90"
        >
          Đơn hàng của tôi
        </Link>
        <Link to="/" className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
