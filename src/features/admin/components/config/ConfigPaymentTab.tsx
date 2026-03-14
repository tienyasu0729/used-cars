import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui'

export function ConfigPaymentTab() {
  const [showVnpaySecret, setShowVnpaySecret] = useState(false)
  const [vnpayEnabled, setVnpayEnabled] = useState(true)
  const [momoEnabled, setMomoEnabled] = useState(false)
  const [minDeposit, setMinDeposit] = useState(10000000)
  const [reservationHours, setReservationHours] = useState(48)

  return (
    <div className="space-y-8">
      <div className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className="absolute right-4 top-4 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
          ĐANG HOẠT ĐỘNG
        </span>
        <h3 className="mb-1 text-lg font-semibold text-slate-900">Cổng Thanh Toán</h3>
        <p className="mb-6 text-sm text-slate-500">Quản lý API Keys cho VNPay và MoMo</p>
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">VNPay Gateway</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Tên mã (vnp_TmnCode)</label>
                <input
                  type="text"
                  defaultValue="Z9O4N2XB"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Chuỗi bí mật (vnp_HashSecret)</label>
                <div className="relative">
                  <input
                    type={showVnpaySecret ? 'text' : 'password'}
                    defaultValue="••••••••"
                    placeholder="Nhập chuỗi bí mật"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVnpaySecret(!showVnpaySecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showVnpaySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={vnpayEnabled}
                  onChange={(e) => setVnpayEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]"
                />
                <span className="text-sm text-slate-600">Bật VNPay</span>
              </label>
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">MoMo Wallet</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Partner Code</label>
                <input
                  type="text"
                  placeholder="MOMO_PARTNER_CODE"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">Secret Key</label>
                <input
                  type="password"
                  placeholder="MOMO_SECRET_KEY"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={momoEnabled}
                  onChange={(e) => setMomoEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]"
                />
                <span className="text-sm text-slate-600">Bật MoMo</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-slate-900">Chính Sách Đặt Cọc</h3>
        <p className="mb-6 text-sm text-slate-500">Quy định về số tiền và thời gian giữ chỗ</p>
        <div className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Tiền cọc tối thiểu (VNĐ)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₫</span>
              <input
                type="number"
                value={minDeposit}
                onChange={(e) => setMinDeposit(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-4 focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Số tiền thấp nhất để khách hàng có thể thực hiện đặt cọc giữ xe.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Thời hạn giữ xe (Giờ)</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReservationHours((h) => Math.max(1, h - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                −
              </button>
              <input
                type="number"
                value={reservationHours}
                onChange={(e) => setReservationHours(Number(e.target.value))}
                className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-center focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
              />
              <span className="text-sm text-slate-600">giờ</span>
              <button
                type="button"
                onClick={() => setReservationHours((h) => h + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                +
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Thời gian xe được gỡ khỏi danh sách công khai sau khi cọc thành công.</p>
          </div>
        </div>
      </div>
      <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
        Chuyển sang tab &quot;Thông báo&quot; để cấu hình SMTP và SMS Gateway
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline">Hủy Bỏ</Button>
        <Button variant="primary">Cập Nhật Cấu Hình</Button>
      </div>
    </div>
  )
}
