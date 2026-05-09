import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui'
import { useAdminConfig, usePutAdminConfig, configListToMap } from '@/hooks/useAdminConfig'
import { useToastStore } from '@/store/toastStore'

const K_BOOKING = 'notify_booking_email'
const K_NEW_VEHICLE = 'notify_new_vehicle'

function readBool(v: string | undefined) {
  return String(v).toLowerCase() === 'true'
}

export function ConfigNotificationTab() {
  const toast = useToastStore()
  const { data, isLoading } = useAdminConfig()
  const putCfg = usePutAdminConfig()
  const [booking, setBooking] = useState(true)
  const [newVehicle, setNewVehicle] = useState(true)

  useEffect(() => {
    if (!data) return
    const m = configListToMap(data)
    setBooking(readBool(m[K_BOOKING] ?? 'true'))
    setNewVehicle(readBool(m[K_NEW_VEHICLE] ?? 'true'))
  }, [data])

  const save = async () => {
    try {
      await putCfg.mutateAsync([
        { key: K_BOOKING, value: booking ? 'true' : 'false' },
        { key: K_NEW_VEHICLE, value: newVehicle ? 'true' : 'false' },
      ])
      toast.addToast('success', 'Đã lưu.')
    } catch {
      toast.addToast('error', 'Không lưu được.')
    }
  }

  if (isLoading) {
    return <div className="py-16 text-center text-slate-500">Đang tải...</div>
  }

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <MessageSquare className="mt-0.5 h-8 w-8 text-[#1A3C6E]" aria-hidden />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Thông báo</h3>
          <p className="text-sm text-slate-500">Cờ bật/tắt lưu trong SystemConfigs</p>
        </div>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={booking} onChange={(e) => setBooking(e.target.checked)} className="rounded" />
        <span className="text-sm text-slate-700">Gửi email xác nhận đặt lịch</span>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={newVehicle} onChange={(e) => setNewVehicle(e.target.checked)} className="rounded" />
        <span className="text-sm text-slate-700">Thông báo khi có xe mới</span>
      </label>
      <Button variant="primary" onClick={save} loading={putCfg.isPending}>Lưu</Button>
    </div>
  )
}
