import { Car, Coins, Pencil } from 'lucide-react'
import { formatPrice, formatPriceNumber } from '@/utils/format'
import type { Vehicle } from '@/types/vehicle.types'

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Tiền mặt', sub: 'Tại cửa hàng' },
  { value: 'bank_transfer', label: 'Chuyển khoản', sub: 'Bank Transfer' },
  { value: 'vnpay', label: 'VNPay', sub: 'QR Code' },
  { value: 'momo', label: 'MoMo', sub: 'Ví điện tử' },
]

interface CreateOrderStepDetailsProps {
  vehicle: Vehicle | null
  price: number
  deposit: number
  onDepositChange: (v: number) => void
  paymentMethod: string
  onPaymentChange: (v: string) => void
  notes: string
  onNotesChange: (v: string) => void
  onChangeVehicle: () => void
}

export function CreateOrderStepDetails({
  vehicle,
  price,
  deposit,
  onDepositChange,
  paymentMethod,
  onPaymentChange,
  notes,
  onNotesChange,
  onChangeVehicle,
}: CreateOrderStepDetailsProps) {
  const remaining = Math.max(0, price - deposit)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Chi tiết thanh toán & đơn hàng</h3>
        <span className="text-xs text-slate-500">MÃ NHẬP: #ORDER-TEMP</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Car className="h-4 w-4 text-slate-500" />
              Giá xe niêm yết (VNĐ)
            </label>
            <input
              type="text"
              readOnly
              value={formatPriceNumber(price)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Coins className="h-4 w-4 text-slate-500" />
              Số tiền đặt cọc (VNĐ)
            </label>
            <input
              type="number"
              value={deposit || ''}
              onChange={(e) => onDepositChange(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="0"
            />
          </div>
          <p className="text-base font-bold text-[#1A3C6E]">Số tiền còn lại: {formatPrice(remaining)}</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Phương thức thanh toán</label>
            <div className="space-y-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors ${
                    paymentMethod === opt.value ? 'border-[#1A3C6E] bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={paymentMethod === opt.value}
                    onChange={() => onPaymentChange(opt.value)}
                    className="h-4 w-4 text-[#1A3C6E]"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú đơn hàng</label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Thêm ghi chú đặc biệt cho đơn hàng này..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
            />
          </div>
        </div>
      </div>
      {vehicle && (
        <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-16 overflow-hidden rounded bg-slate-200">
              <img
                src={
                  (() => {
                    const im = vehicle.images?.[0]
                    return (typeof im === 'string' ? im : im?.url) || ''
                  })()
                }
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Đã chọn xe:</p>
              <p className="font-semibold text-slate-900">
                {vehicle.brand} {vehicle.model} {vehicle.year}
                {vehicle.trim ? ` - Phiên bản ${vehicle.trim}` : ''}
                {vehicle.exteriorColor ? ` (${vehicle.exteriorColor})` : ''}
              </p>
            </div>
          </div>
          <button type="button" onClick={onChangeVehicle} className="flex items-center gap-1 text-sm font-medium text-[#1A3C6E] hover:underline">
            <Pencil className="h-4 w-4" />
            Thay đổi xe
          </button>
        </div>
      )}
    </div>
  )
}
