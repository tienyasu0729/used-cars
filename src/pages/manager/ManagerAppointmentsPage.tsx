import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Calendar, List, Target, UserPlus, DollarSign, Search, X } from 'lucide-react'
import { downloadExcel, todayStr } from '@/utils/excelExport'
import { useAppointments } from '@/hooks/useAppointments'
import { useManagerBookingMutations } from '@/hooks/useManagerBookingMutations'
import { managerStaffService } from '@/services/managerStaff.service'
import { AppointmentDetailModal } from '@/features/manager/components'
import { ConfirmDialog, ExportMenu, ExportSelectionBar, Pagination } from '@/components/ui'
import { formatPrice } from '@/utils/format'
import { formatBookingDateTimeLines, formatBookingDateTimeVi } from '@/utils/bookingDisplay'
import { useAuthStore } from '@/store/authStore'
import type { ManagerAppointment } from '@/types/managerAppointment.types'

const STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Pending', label: 'Chờ Xử Lý' },
  { key: 'Confirmed', label: 'Đã Xác Nhận' },
  { key: 'Completed', label: 'Hoàn Thành' },
  { key: 'Cancelled', label: 'Đã Hủy' },
  { key: 'Rescheduled', label: 'Đổi Lịch' },
] as const

const TYPE_LABELS: Record<string, string> = {
  test_drive: 'Lái Thử',
  consultation: 'Tham Quan',
  showroom: 'Tham Quan',
  appraisal: 'Định Giá',
  delivery: 'Bàn Giao',
}

const STATUS_LABELS: Record<string, string> = {
  AwaitingContract: 'Chờ Ký HĐ',
  Confirmed: 'Đã Xác Nhận',
  Pending: 'Chờ Xử Lý',
  Rescheduled: 'Đổi Lịch',
  Completed: 'Hoàn Thành',
  Cancelled: 'Đã Hủy',
}

function canManagerConfirm(status: string): boolean {
  return status === 'Pending' || status === 'Rescheduled'
}

function canManagerCancel(status: string): boolean {
  return status === 'Pending' || status === 'Confirmed' || status === 'Rescheduled'
}

function canAssignStaffResponsible(status: string): boolean {
  return status === 'Pending' || status === 'Confirmed' || status === 'Rescheduled'
}

function statusBadgeClass(status: string): string {
  if (status === 'Confirmed' || status === 'Completed') return 'bg-green-100 text-green-700'
  if (status === 'Pending' || status === 'Rescheduled') return 'bg-amber-100 text-amber-700'
  if (status === 'Cancelled') return 'bg-slate-200 text-slate-600'
  return 'bg-slate-100 text-slate-600'
}

function getWeekBounds() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
}

export function ManagerAppointmentsPage() {
  const { user } = useAuthStore()
  const branchId = typeof user?.branchId === 'number' ? user.branchId : 1
  const { data: appointments, isLoading } = useAppointments()
  const { confirmBooking, cancelBooking, assignBookingStaff, actionBookingId } = useManagerBookingMutations(branchId)
  const { data: branchStaffRaw = [] } = useQuery({
    queryKey: ['manager-branch-staff', branchId],
    queryFn: () => managerStaffService.list(branchId),
    staleTime: 60_000,
  })
  const assignableStaff = useMemo(
    () => branchStaffRaw.filter((s) => !s.deleted && s.status?.toLowerCase() === 'active'),
    [branchStaffRaw],
  )
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selected, setSelected] = useState<ManagerAppointment | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const openDetail = (a: ManagerAppointment) => {
    setSelected(a)
    setDetailOpen(true)
  }

  const apiErrorMessage = (e: unknown): string => {
    if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string') {
      return (e as { message: string }).message
    }
    return 'Thao tác thất bại. Vui lòng thử lại.'
  }

  const handleConfirm = useCallback(
    async (id: number) => {
      try {
        await confirmBooking(id)
      } catch (e) {
        window.alert(apiErrorMessage(e))
      }
    },
    [confirmBooking],
  )

  const handleCancelBooking = useCallback(
    async (id: number) => {
      try {
        await cancelBooking(id)
      } catch (e) {
        window.alert(apiErrorMessage(e))
      }
    },
    [cancelBooking],
  )

  const handleAssignStaff = useCallback(
    async (bookingId: number, staffId: number | null) => {
      try {
        await assignBookingStaff(bookingId, staffId)
      } catch (e) {
        window.alert(apiErrorMessage(e))
      }
    },
    [assignBookingStaff],
  )

  useEffect(() => {
    if (!selected || !appointments?.length) return
    const fresh = appointments.find((a) => a.id === selected.id)
    if (
      fresh
      && (fresh.status !== selected.status
        || fresh.staffId !== selected.staffId
        || fresh.staffName !== selected.staffName)
    ) {
      setSelected(fresh)
    }
  }, [appointments, selected])

  const allItems = appointments ?? []

  const list = useMemo(() => {
    let result = statusFilter === 'all' ? allItems : allItems.filter((a) => a.status === statusFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((a) => {
        if (a.customerName?.toLowerCase().includes(q)) return true
        if (a.phone?.toLowerCase().includes(q)) return true
        if (a.vehicleName?.toLowerCase().includes(q)) return true
        if (a.staffName?.toLowerCase().includes(q)) return true
        if (String(a.staffId ?? '').includes(q)) return true
        return false
      })
    }
    return [...result].sort((a, b) => {
      const cmp = b.date.localeCompare(a.date)
      if (cmp !== 0) return cmp
      return (b.timeSlot ?? '').localeCompare(a.timeSlot ?? '')
    })
  }, [allItems, statusFilter, searchQuery])

  useEffect(() => { setPage(1) }, [statusFilter, searchQuery])

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  const listTotal = list.length
  const listTotalPages = Math.max(1, Math.ceil(listTotal / pageSize))
  const listStart = (page - 1) * pageSize
  const paginatedList = list.slice(listStart, listStart + pageSize)

  const { monday, sunday } = getWeekBounds()
  const weekList = list.filter((a) => {
    const d = new Date(a.date)
    return d >= monday && d <= sunday
  })
  const testDriveCount = weekList.filter((a) => a.type === 'test_drive').length
  const consultationCount = weekList.filter((a) => a.type === 'consultation').length
  const confirmedCount = list.filter((a) => a.status === 'Confirmed').length
  const completionRate = list.length > 0 ? Math.round((confirmedCount / list.length) * 100) : 0
  const uniqueCustomers = new Set(list.map((a) => a.customerName)).size
  const estRevenue = weekList.length * 500000000

  const kpis = [
    { icon: Calendar, label: 'Tổng Tuần Này', value: `${weekList.length} (${testDriveCount} lái thử + ${consultationCount} tham quan)` },
    { icon: Target, label: 'Tỷ Lệ Hoàn Thành', value: `${completionRate}%` },
    { icon: UserPlus, label: 'Khách Hàng Mới', value: uniqueCustomers },
    { icon: DollarSign, label: 'Doanh Thu Dự Kiến', value: formatPrice(estRevenue) },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Tổng Quan Lịch Hẹn
          </h1>
          <p className="text-slate-500">
            Quản lý lịch tham quan showroom và lái thử tại chi nhánh Đà Nẵng
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
                viewMode === 'list' ? 'bg-white text-[#1A3C6E] shadow-sm' : 'hover:bg-white/50'
              }`}
            >
              <List className="h-4 w-4" />
              Danh Sách
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
                viewMode === 'calendar' ? 'bg-white text-[#1A3C6E] shadow-sm' : 'hover:bg-white/50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Lịch
            </button>
          </div>
          <ExportMenu
            onExportAll={() => {
              const rows = allItems.map((a) => [
                formatBookingDateTimeVi(a.date, a.timeSlot),
                a.customerName,
                a.phone ?? '',
                TYPE_LABELS[a.type] ?? a.type,
                a.vehicleName,
                a.staffName,
                STATUS_LABELS[a.status] ?? a.status,
              ])
              downloadExcel(`lich-hen-tat-ca-${todayStr()}.xlsx`,
                ['Thời gian hẹn', 'Khách hàng', 'SĐT', 'Loại', 'Xe', 'Nhân viên', 'Trạng thái'], rows)
            }}
            onExportFiltered={() => {
              setSelectMode(true)
              setSelectedIds(new Set())
            }}
          />
          <button className="flex items-center justify-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90">
            <Plus className="h-5 w-5" />
            Lịch Hẹn Mới
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-[#1A3C6E]/10 p-2">
                <kpi.icon className="h-5 w-5 text-[#1A3C6E]" />
              </div>
              <span className="text-sm font-medium text-slate-500">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === t.key
                  ? 'bg-[#1A3C6E] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm khách, SĐT, xe, nhân viên..."
            className="h-9 w-56 rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]/30"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {selectMode && (
        <ExportSelectionBar
          selectedCount={selectedIds.size}
          totalCount={list.length}
          onSelectAll={() => setSelectedIds(new Set(list.map((a) => a.id)))}
          onDeselectAll={() => setSelectedIds(new Set())}
          onExport={() => {
            const items = list.filter((a) => selectedIds.has(a.id))
            const rows = items.map((a) => [
              formatBookingDateTimeVi(a.date, a.timeSlot),
              a.customerName,
              a.phone ?? '',
              TYPE_LABELS[a.type] ?? a.type,
              a.vehicleName,
              a.staffName,
              STATUS_LABELS[a.status] ?? a.status,
            ])
            downloadExcel(`lich-hen-chon-${todayStr()}.xlsx`,
              ['Thời gian hẹn', 'Khách hàng', 'SĐT', 'Loại', 'Xe', 'Nhân viên', 'Trạng thái'], rows)
            setSelectMode(false)
            setSelectedIds(new Set())
          }}
          onCancel={() => { setSelectMode(false); setSelectedIds(new Set()) }}
        />
      )}

      {viewMode === 'calendar' ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-bold">Tháng 3 năm 2025</span>
            <div className="flex gap-2">
              <button className="rounded p-1 hover:bg-slate-100">‹</button>
              <button className="rounded p-1 hover:bg-slate-100">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
              <div key={d} className="p-2 text-center text-xs font-bold uppercase text-slate-400">
                {d}
              </div>
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <div key={`pad-${i}`} className="min-h-[80px]" />
            ))}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1
              const dayStr = `2025-03-${String(day).padStart(2, '0')}`
              const dayAppointments = list.filter((a) => a.date === dayStr)
              return (
                <div
                  key={day}
                  className="min-h-[80px] rounded-lg border border-slate-100 p-2"
                >
                  <span className="text-sm font-semibold">{day}</span>
                  {dayAppointments.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => openDetail(a)}
                      title={`${formatBookingDateTimeVi(a.date, a.timeSlot)} — ${a.customerName}`}
                      className="mt-1 block w-full truncate rounded bg-blue-100 px-2 py-0.5 text-left text-[10px] font-bold text-blue-700"
                    >
                      {a.timeSlot} · {a.customerName}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedList.map((a) => {
              const { dateLine, timeLine } = formatBookingDateTimeLines(a.date, a.timeSlot)
              return (
              <div
                key={a.id}
                onClick={() => !selectMode && openDetail(a)}
                className={`rounded-xl border bg-white p-4 shadow-sm transition-colors ${
                  selectMode
                    ? selectedIds.has(a.id) ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200'
                    : 'cursor-pointer border-slate-200 hover:border-[#1A3C6E]/40'
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    {selectMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(a.id)}
                        onChange={() => {
                          setSelectedIds((prev) => {
                            const next = new Set(prev)
                            if (next.has(a.id)) next.delete(a.id)
                            else next.add(a.id)
                            return next
                          })
                        }}
                        className="h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                      />
                    )}
                    <div className="flex min-w-[9.5rem] shrink-0 flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[#1A3C6E]">
                      <span className="text-[11px] font-medium capitalize leading-tight text-slate-600">{dateLine}</span>
                      <span className="mt-1 text-lg font-bold leading-none tracking-tight">{timeLine}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Khách hàng</p>
                      <h4 className="font-bold text-slate-900">{a.customerName}</h4>
                      {a.phone ? (
                        <p className="mt-0.5 text-sm text-slate-600">
                          <span className="text-slate-400">SĐT: </span>
                          <a href={`tel:${a.phone.replace(/\s/g, '')}`} className="font-medium text-[#1A3C6E] hover:underline" onClick={(e) => e.stopPropagation()}>{a.phone}</a>
                        </p>
                      ) : (
                        <p className="mt-0.5 text-sm italic text-slate-400">Chưa có số điện thoại</p>
                      )}
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">{TYPE_LABELS[a.type] ?? a.type}:</span>{' '}
                        <span className="text-slate-600">{a.vehicleName}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex w-full min-w-[10rem] flex-col gap-1 sm:w-auto sm:max-w-[16rem] sm:items-end">
                      <span className="text-xs text-slate-400">Nhân viên phụ trách</span>
                      <span className="text-sm font-semibold text-slate-900">{a.staffName}</span>
                      {canAssignStaffResponsible(a.status) && (
                        <select
                          value={a.staffId != null ? String(a.staffId) : ''}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation()
                            const v = e.target.value
                            void handleAssignStaff(Number(a.id), v === '' ? null : Number(v))
                          }}
                          disabled={actionBookingId === Number(a.id)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left text-xs font-medium text-slate-800 shadow-sm outline-none focus:border-[#1A3C6E] disabled:opacity-50 sm:max-w-[14rem]"
                          aria-label="Phân công nhân viên"
                        >
                          <option value="">— Chưa phân công —</option>
                          {assignableStaff.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          a.type === 'test_drive'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {TYPE_LABELS[a.type] ?? a.type}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(a.status)}`}>
                        {STATUS_LABELS[a.status] ?? a.status}
                      </span>
                      <div
                        className="flex flex-wrap gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canManagerConfirm(a.status) && (
                          <button
                            type="button"
                            disabled={actionBookingId === Number(a.id)}
                            onClick={() => void handleConfirm(Number(a.id))}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {actionBookingId === Number(a.id) ? '...' : 'Xác nhận'}
                          </button>
                        )}
                        {canManagerCancel(a.status) && (
                          <button
                            type="button"
                            disabled={actionBookingId === Number(a.id)}
                            onClick={() => setPendingCancelId(Number(a.id))}
                            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )
            })}
          </div>

          <Pagination page={page} totalPages={listTotalPages} total={listTotal} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} label="lịch hẹn" />
        </>
      )}
      {list.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 font-medium text-slate-600">Chưa có lịch hẹn nào</p>
        </div>
      )}
      <AppointmentDetailModal
        appointment={selected}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        onConfirm={handleConfirm}
        onCancelBooking={handleCancelBooking}
        actionBookingId={actionBookingId}
      />
      <ConfirmDialog
        isOpen={pendingCancelId != null}
        onClose={() => setPendingCancelId(null)}
        title="Hủy lịch hẹn"
        message="Hủy lịch hẹn này cho khách? Thao tác sẽ cập nhật trạng thái theo quy trình."
        confirmLabel="Hủy lịch"
        loading={pendingCancelId != null && actionBookingId === pendingCancelId}
        onConfirm={async () => {
          if (pendingCancelId == null) return
          await handleCancelBooking(pendingCancelId)
          setPendingCancelId(null)
        }}
      />
    </div>
  )
}
