import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, UserPlus, Search } from 'lucide-react'
import { useBranchStaff } from '@/hooks/useBranchStaff'
import { Badge } from '@/components/ui'
import { StaffDetailModal } from '@/features/manager/components'
import type { ManagerStaffMember } from '@/mock/mockManagerData'

const ROLES = ['', 'Nhân viên bán hàng', 'Tư vấn kỹ thuật', 'Trưởng nhóm kinh doanh']

export function ManagerStaffPage() {
  const { data: staff, isLoading } = useBranchStaff()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<ManagerStaffMember | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filtered = (staff ?? []).filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search)
    const matchRole = !roleFilter || s.role === roleFilter
    return matchSearch && matchRole
  })

  const openDetail = (s: ManagerStaffMember) => {
    setSelectedStaff(s)
    setDetailOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Quản Lý Nhân Viên
          </h1>
          <p className="mt-1 text-slate-500">
            Quản lý và giám sát đội ngũ nhân sự của showroom tại Đà Nẵng
          </p>
        </div>
        <Link
          to="/manager/staff/new"
          className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-5 py-2.5 font-bold text-white transition-opacity hover:opacity-90"
        >
          <UserPlus className="h-5 w-5" />
          Thêm Nhân Viên
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:ring-[#1A3C6E]"
        >
          <option value="">Tất cả vai trò</option>
          {ROLES.filter(Boolean).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nhân viên
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Liên hệ
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ngày bắt đầu
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Đơn hàng
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="cursor-pointer transition-colors hover:bg-slate-50/50"
                  onClick={() => openDetail(s)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                        <span className="text-sm font-medium text-slate-600">
                          {s.name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p>{s.email}</p>
                      <p className="text-slate-500">{s.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{s.startDate}</td>
                  <td className="px-6 py-4 text-sm font-medium">{s.orderCount} đơn</td>
                  <td className="px-6 py-4">
                    <Badge variant={s.status === 'active' ? 'available' : 'default'}>
                      {s.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openDetail(s)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:text-[#1A3C6E]"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button className="rounded-lg p-1.5 text-slate-400 transition-colors hover:text-red-500">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <StaffDetailModal
        staff={selectedStaff}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
