import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { useAdminConfig, usePutAdminConfig, configListToMap } from '@/hooks/useAdminConfig'
import { useToastStore } from '@/store/toastStore'

const K = {
  vnpayOn: 'vnpay_enabled',
  zaloOn: 'zalopay_enabled',
  minDep: 'payment_min_deposit',
  resHrs: 'payment_reservation_hours',
} as const

function readBool(v: string | undefined) {
  return String(v).toLowerCase() === 'true'
}

export function ConfigPaymentTab() {
  const toast = useToastStore()
  const { data, isLoading } = useAdminConfig()
  const putCfg = usePutAdminConfig()
  const [vnpayEnabled, setVnpayEnabled] = useState(false)
  const [zaloEnabled, setZaloEnabled] = useState(false)
  const [minDeposit, setMinDeposit] = useState('10000000')
  const [reservationHours, setReservationHours] = useState('48')

  useEffect(() => {
    if (!data) return
    const m = configListToMap(data)
    setVnpayEnabled(readBool(m[K.vnpayOn]))
    setZaloEnabled(readBool(m[K.zaloOn]))
    setMinDeposit(m[K.minDep] || '10000000')
    setReservationHours(m[K.resHrs] || '48')
  }, [data])

  const save = async () => {
    try {
      await putCfg.mutateAsync([
        { key: K.vnpayOn, value: vnpayEnabled ? 'true' : 'false' },
        { key: K.zaloOn, value: zaloEnabled ? 'true' : 'false' },
        { key: K.minDep, value: minDeposit },
        { key: K.resHrs, value: reservationHours },
      ])
      toast.addToast('success', 'Đã lưu cấu hình thanh toán.')
    } catch {
      toast.addToast('error', 'Không lưu được.')
    }
  }

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Đang tải cấu hình...</div>
  }

  return (
    <div className="space-y-8">
      <div className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-slate-900">Cổng thanh toán</h3>
        <p className="mb-4 text-sm text-slate-500">
          Bật/tắt VNPay và ZaloPay. TMN, secret, URL và Zalo key cấu hình trên server (
          <code className="text-xs">app.payment</code> trong <code className="text-xs">application-local.yml</code> hoặc biến môi trường), không lưu trong DB.
        </p>
        <div className="space-y-6 rounded-lg border border-slate-100 bg-slate-50/50 p-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={vnpayEnabled}
              onChange={(e) => setVnpayEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#1A3C6E]"
            />
            <span className="text-sm text-slate-700">Bật VNPay</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={zaloEnabled}
              onChange={(e) => setZaloEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#1A3C6E]"
            />
            <span className="text-sm text-slate-700">Bật ZaloPay</span>
          </label>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-slate-900">Đặt cọc</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Tiền cọc tối thiểu (VNĐ)</label>
            <input
              type="text"
              inputMode="numeric"
              value={minDeposit}
              onChange={(e) => setMinDeposit(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Giữ chỗ (giờ)</label>
            <input
              type="text"
              inputMode="numeric"
              value={reservationHours}
              onChange={(e) => setReservationHours(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="primary" onClick={save} loading={putCfg.isPending}>
          Lưu cấu hình
        </Button>
      </div>
    </div>
  )
}
