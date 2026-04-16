import { useEffect, useMemo } from 'react'
import { Car, Loader2, Pencil } from 'lucide-react'
import { formatPrice, formatPriceNumber } from '@/utils/format'
import type { Vehicle } from '@/types/vehicle.types'
import { usePaymentDepositMethods } from '@/hooks/usePaymentDepositMethods'

interface CreateOrderStepDetailsProps {
  vehicle: Vehicle | null
  vehiclePrice: number
  depositAmount: number | null
  depositsLoading: boolean
  customerSelected: boolean
  totalPrice: number
  onTotalPriceChange: (v: number) => void
  depositId: string
  onDepositIdChange: (v: string) => void
  paymentMethod: string
  onPaymentChange: (v: string) => void
  notes: string
  onNotesChange: (v: string) => void
  onChangeVehicle: () => void
}

export function CreateOrderStepDetails({
  vehicle,
  vehiclePrice,
  depositAmount,
  depositsLoading,
  customerSelected,
  totalPrice,
  onTotalPriceChange,
  depositId,
  onDepositIdChange,
  paymentMethod,
  onPaymentChange,
  notes,
  onNotesChange,
  onChangeVehicle,
}: CreateOrderStepDetailsProps) {
  const { data: pmCfg } = usePaymentDepositMethods(true)
  const paymentOptions = useMemo(() => {
    if (!pmCfg) {
      return [{ value: 'cash', label: 'Tiền mặt', sub: 'Tại cửa hàng' }]
    }
    const o: { value: string; label: string; sub: string }[] = []
    if (pmCfg.cash) o.push({ value: 'cash', label: 'Tiền mặt', sub: 'Tại cửa hàng' })
    if (pmCfg.vnpay) o.push({ value: 'vnpay', label: 'VNPay', sub: 'QR / cổng thanh toán' })
    if (pmCfg.zalopay) o.push({ value: 'zalopay', label: 'ZaloPay', sub: 'Ví / QR' })
    return o.length > 0 ? o : [{ value: 'cash', label: 'Tiền mặt', sub: 'Tại cửa hàng' }]
  }, [pmCfg])

  useEffect(() => {
    if (!paymentOptions.some((opt) => opt.value === paymentMethod)) {
      onPaymentChange(paymentOptions[0]?.value ?? 'cash')
    }
  }, [paymentOptions, paymentMethod, onPaymentChange])

  const showDepositRow = Boolean(vehicle && customerSelected)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Chi tiết đơn hàng</h3>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Car className="h-4 w-4 text-slate-500" />
              Số tiền còn lại — tổng giá đơn (VNĐ)
            </label>
            <p className="mb-2 text-xs text-slate-500">
              Mặc định = giá niêm yết − cọc đã xác nhận (nếu có). Có thể chỉnh nếu cần.
            </p>
            <input
              type="number"
              min={1}
              value={totalPrice || ''}
              onChange={(e) => onTotalPriceChange(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs font-medium text-slate-700">{formatPrice(totalPrice)}</p>
            {vehiclePrice > 0 && (
              <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
                <p>Giá niêm yết: {formatPriceNumber(vehiclePrice)} ₫</p>
                {depositAmount != null && depositAmount > 0 && (
                  <p className="mt-0.5">Đã cọc (phiếu đã xác nhận): −{formatPriceNumber(depositAmount)} ₫</p>
                )}
                <p className="mt-1 font-semibold text-slate-800">
                  Còn lại (gợi ý): {formatPriceNumber(Math.max(1, vehiclePrice - (depositAmount ?? 0)))} ₫
                </p>
              </div>
            )}
          </div>
          {showDepositRow && (
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                ID phiếu cọc đã xác nhận (tuỳ chọn)
                {depositsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={depositId}
                onChange={(e) => onDepositIdChange(e.target.value.replace(/\D/g, ''))}
                placeholder={depositsLoading ? 'Đang tải…' : 'Để trống nếu không gắn cọc'}
                disabled={depositsLoading}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
              />
              <p className="mt-1 text-xs text-slate-500">
                Hệ thống tự điền khi có phiếu cọc đã xác nhận đúng khách &amp; xe. Sửa ID nếu sai — khi tạo đơn sẽ kiểm tra
                khớp khách và xe.
              </p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Phương thức thanh toán</label>
            <div className="space-y-2">
              {paymentOptions.map((opt) => (
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
              <p className="text-xs text-slate-500">Niêm yết: {formatPriceNumber(vehicle.price)} ₫</p>
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
