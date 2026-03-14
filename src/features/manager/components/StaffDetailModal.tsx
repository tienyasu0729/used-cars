import { X, UserPlus, Calendar, CheckCircle, Pencil, Trash2 } from 'lucide-react'
import type { ManagerStaffMember } from '@/mock/mockManagerData'

interface StaffDetailModalProps {
  staff: ManagerStaffMember | null
  isOpen: boolean
  onClose: () => void
  onActivate?: (id: string) => void
  onDeactivate?: (id: string) => void
}

const MOCK_ACTIVITIES = [
  { icon: Calendar, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', title: 'Hoàn tất lịch hẹn lái thử', desc: 'Khách hàng: Trần Văn B - Toyota Camry', time: '2 giờ trước' },
  { icon: CheckCircle, iconBg: 'bg-green-50', iconColor: 'text-green-600', title: 'Ký hợp đồng mua bán', desc: 'Mã đơn: #ORD-9921 - VinFast VF8', time: 'Hôm qua, 14:30' },
  { icon: Pencil, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', title: 'Cập nhật trạng thái xe', desc: 'Mercedes-Benz C200 - Đã nhận cọc', time: '3 ngày trước' },
]

const REVENUE_BARS = [100, 50, 90, 100, 70, 60]

function formatStaffId(id: string) {
  return `STF-${id.replace('s', '').padStart(4, '0')}`
}

export function StaffDetailModal({
  staff,
  isOpen,
  onClose,
  onActivate,
  onDeactivate,
}: StaffDetailModalProps) {
  if (!staff || !isOpen) return null

  const staffId = formatStaffId(staff.id)

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} aria-hidden />
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-[380px] flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold">Chi tiết nhân viên</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-[#1A3C6E]/10 bg-slate-100">
              {staff.avatar ? (
                <img src={staff.avatar} alt={staff.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-600">
                  {staff.name[0]?.toUpperCase()}
                </span>
              )}
            </div>
            {staff.status === 'active' && (
              <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{staff.name}</h3>
            <p className="text-sm font-medium text-[#1A3C6E]">{staff.role}</p>
            <p className="mt-1 font-mono text-xs tracking-wider text-slate-500">ID: {staffId}</p>
          </div>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A3C6E] py-2.5 font-semibold text-white transition-colors hover:bg-[#1A3C6E]/90">
            <UserPlus className="h-5 w-5" />
            Phân Công Công Việc
          </button>
        </div>
        <div className="border-y border-slate-100 bg-slate-50/50 px-6 py-4">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Thống kê hiệu suất</h4>
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="mb-1 text-xs text-slate-500">Đơn hàng</p>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold">{staff.orderCount}</span>
                <span className="pb-1 text-xs font-medium text-green-600">+12%</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="mb-1 text-xs text-slate-500">Lịch hẹn</p>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold">128</span>
                <span className="pb-1 text-xs font-medium text-green-600">+5%</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-500">Doanh thu (VND)</p>
                <p className="text-lg font-bold text-[#1A3C6E]">2.4 tỷ</p>
              </div>
              <p className="text-[10px] font-medium text-slate-400">6 THÁNG QUA</p>
            </div>
            <div className="flex h-24 items-end justify-between gap-2 px-1">
              {REVENUE_BARS.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-sm bg-[#1A3C6E]"
                    style={{ height: `${h}%`, opacity: i === 3 ? 1 : 0.2 }}
                  />
                  <span className="text-[10px] font-bold uppercase text-slate-400">T{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Hoạt động gần đây</h4>
          <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {MOCK_ACTIVITIES.map((a, i) => (
              <div key={i} className="relative pl-8">
                <span className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${a.iconBg} ${a.iconColor}`}>
                  <a.icon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.desc}</p>
                  <p className="mt-1 text-[10px] uppercase text-slate-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto flex gap-3 border-t border-slate-100 p-6">
          <button className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50">
            Chỉnh sửa
          </button>
          <button
            onClick={() => staff.status === 'active' && onDeactivate?.(staff.id)}
            className="rounded-lg border border-slate-200 p-2 text-slate-400 transition-colors hover:border-red-200 hover:text-red-500"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </aside>
    </>
  )
}
