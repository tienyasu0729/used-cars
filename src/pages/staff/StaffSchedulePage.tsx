import { useStaffSchedule } from '@/hooks/useStaffSchedule'
import { Badge } from '@/components/ui'

const typeLabels: Record<string, string> = {
  test_drive: 'Lái thử',
  consultation: 'Tư vấn',
  handover: 'Bàn giao xe',
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
}

export function StaffSchedulePage() {
  const { data: schedule, isLoading } = useStaffSchedule()

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const todayItems = schedule?.filter((s) => s.date === today) ?? []
  const upcoming = schedule?.filter((s) => s.date >= today).slice(0, 10) ?? []

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Lịch trình hôm nay</h2>
        <p className="text-sm text-slate-500">Các cuộc hẹn trong ngày</p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-slate-900">Hôm nay ({todayItems.length})</h3>
          <div className="space-y-3">
            {todayItems.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Không có lịch hẹn hôm nay
              </p>
            ) : (
              todayItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <p className="min-w-[80px] text-sm font-bold text-slate-500">{item.timeSlot}</p>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{item.customerName}</p>
                    <p className="text-sm text-slate-500">
                      {typeLabels[item.type]}: <span className="text-[#1A3C6E] font-medium">{item.vehicleName}</span>
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.status === 'completed' ? 'available' :
                      item.status === 'confirmed' ? 'confirmed' :
                      item.status === 'cancelled' ? 'default' : 'pending'
                    }
                  >
                    {statusLabels[item.status]}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Sắp tới</h3>
          <div className="space-y-2">
            {upcoming.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <p className="text-xs text-slate-500">{item.date} {item.timeSlot}</p>
                <p className="text-sm font-medium text-slate-900">{item.customerName}</p>
                <p className="text-xs text-slate-600">{item.vehicleName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
