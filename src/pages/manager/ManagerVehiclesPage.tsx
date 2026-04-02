import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Eye, Plus, Search, FileDown, Trash2, ArrowRightLeft, RotateCcw, Truck, CheckSquare } from 'lucide-react'
import { useManagerVehicle, useManagerVehicles } from '@/hooks/useManagerVehicles'
import { useAuthStore } from '@/store/authStore'
import { VehicleStatusBadge, Modal, Button } from '@/components/ui'
import { VehicleDetailModal } from '@/features/manager/components'
import { TransferDetailModal } from '@/components/manager/transfers'
import { transferService } from '@/services/transfer.service'
import { vehicleService } from '@/services/vehicle.service'
import { formatPrice, formatMileage } from '@/utils/format'
import type { Vehicle } from '@/types/vehicle.types'
import type { UserProfile } from '@/types/auth.types'
import type { TransferRequest } from '@/types/transfer.types'

const PAGE_SIZE = 10

type TabScope = 'MINE' | 'NETWORK'

type VisibilityConfirm = { kind: 'hide' | 'restore'; vehicle: Vehicle }

/** Dòng 1 bảng: giống listing công khai — ưu tiên tiêu đề tin; tránh lặp hãng khi catalog dòng = "Audi TT" chẳng hạn. */
function vehicleTablePrimaryLine(v: Vehicle): string {
  const t = v.title?.trim()
  if (t) return t
  const brand = (v.brand ?? '').trim()
  const model = (v.model ?? '').trim()
  if (!brand && !model) return 'Xe'
  const mLower = model.toLowerCase()
  const bLower = brand.toLowerCase()
  if (model && (mLower === bLower || mLower.startsWith(`${bLower} `))) return model
  return `${brand} ${model}`.trim()
}

/** Dòng 2: km + năm + nhiên liệu (API thường không có màu ngoại thất → không dùng N/A • xăng). */
function vehicleTableMetaLine(v: Vehicle): string {
  const parts: string[] = [formatMileage(v.mileage)]
  if (v.year > 0) parts.push(String(v.year))
  parts.push(v.fuel?.trim() || '—')
  return parts.join(' • ')
}

type RowCtx = {
  activeTab: TabScope
  user: UserProfile | null
  isSubmitting: boolean
  navigate: ReturnType<typeof useNavigate>
  openDetail: (v: Vehicle) => void
  setVisibilityConfirm: (v: VisibilityConfirm | null) => void
  selectedIds: Set<number>
  toggleSelect: (id: number) => void
}

function vehicleInventoryTableRow(v: Vehicle, ctx: RowCtx) {
  const { activeTab, user, isSubmitting, navigate, openDetail, setVisibilityConfirm, selectedIds, toggleSelect } = ctx
  const im = v.images?.[0]
  const thumb = typeof im === 'string' ? im : im?.url
  const isSelected = selectedIds.has(v.id)
  return (
    <tr
      key={v.id}
      className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/50'}`}
      onClick={() => openDetail(v)}
    >
      {/* Checkbox — chỉ hiện ở tab MINE */}
      {activeTab === 'MINE' && (
        <td className="w-10 p-4" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelect(v.id)}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]/20"
          />
        </td>
      )}
      <td className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200 bg-cover bg-center"
            style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
          />
          <div className="min-w-0">
            <p className="line-clamp-2 font-bold text-slate-900" title={vehicleTablePrimaryLine(v)}>
              {vehicleTablePrimaryLine(v)}
            </p>
            <p className="text-xs text-slate-500">{vehicleTableMetaLine(v)}</p>
          </div>
        </div>
      </td>
      <td className="p-4 font-mono text-sm font-medium" onClick={(e) => e.stopPropagation()}>
        {v.listing_id ?? '-'}
      </td>
      <td className="p-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium">{v.year}</p>
        <p className="text-sm font-bold text-[#E8612A]">{formatPrice(v.price)}</p>
      </td>
      <td className="p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-1">
          <VehicleStatusBadge status={v.status} />
          {v.deleted ? (
            <span className="w-fit rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
              Ẩn khỏi trang chủ
            </span>
          ) : null}
        </div>
      </td>
      <td className="p-4 text-sm text-slate-600" onClick={(e) => e.stopPropagation()}>
        {v.branch_name ?? '—'}
      </td>
      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
        {activeTab === 'NETWORK' ? (
          <button
            type="button"
            disabled={v.status !== 'Available' || v.branch_id === user?.branchId}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1A3C6E] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1A3C6E]/90 disabled:cursor-not-allowed disabled:opacity-40"
            title={
              v.branch_id === user?.branchId
                ? 'Xe đã thuộc chi nhánh của bạn'
                : v.status !== 'Available'
                  ? 'Chỉ xe Available mới điều chuyển được'
                  : 'Tạo yêu cầu điều chuyển xe về chi nhánh của bạn'
            }
            onClick={(e) => {
              e.preventDefault()
              void navigate(`/manager/transfers?vehicleId=${v.id}`)
            }}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Yêu cầu điều chuyển
          </button>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <Link to={`/manager/vehicles/${v.id}/edit`}>
              <button type="button" className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100">
                <Pencil className="h-5 w-5" />
              </button>
            </Link>
            {v.deleted ? (
              <button
                type="button"
                disabled
                title="Xe đã ẩn — không còn trang công khai"
                className="cursor-not-allowed rounded-lg p-1.5 text-slate-400 opacity-40"
              >
                <Eye className="h-5 w-5" />
              </button>
            ) : (
              <Link to={`/vehicles/${v.id}`}>
                <button type="button" className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100" title="Xem trang công khai">
                  <Eye className="h-5 w-5" />
                </button>
              </Link>
            )}
            {v.deleted ? (
              <button
                type="button"
                disabled={isSubmitting}
                title="Hiển thị lại trên trang công khai"
                className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-50"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setVisibilityConfirm({ kind: 'restore', vehicle: v })
                }}
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                title="Ẩn khỏi trang công khai"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setVisibilityConfirm({ kind: 'hide', vehicle: v })
                }}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

const VEHICLE_LIST_STATUS_PARAMS = ['Available', 'Reserved', 'Sold'] as const

export function ManagerVehiclesPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'Admin'
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [activeTab, setActiveTab] = useState<TabScope>('MINE')
  const scope = activeTab === 'NETWORK' ? 'NETWORK' : undefined

  const { data: vehicles, isLoading, refetch } = useManagerVehicles({ scope })
  const { deleteVehicle, restoreVehicleVisibility, isSubmitting } = useManagerVehicle()
  const queryClient = useQueryClient()
  const [visibilityConfirm, setVisibilityConfirm] = useState<VisibilityConfirm | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  // Sprint 4 — Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    const pageIds = paginated.map((v) => v.id)
    setSelectedIds((prev) => {
      const allSelected = pageIds.every((id) => prev.has(id))
      const next = new Set(prev)
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id))
      } else {
        pageIds.forEach((id) => next.add(id))
      }
      return next
    })
  }, [])

  // Hàm xử lý bulk actions — gọi API thực
  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    try {
      await vehicleService.bulkChangeStatus(Array.from(selectedIds), newStatus)
      setSelectedIds(new Set())
      void refetch()
    } catch (err) {
      console.error('Bulk status change failed:', err)
    } finally {
      setBulkLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Xác nhận ẩn ${selectedIds.size} xe khỏi trang chủ?`)) return
    setBulkLoading(true)
    try {
      await vehicleService.bulkDeleteVehicles(Array.from(selectedIds))
      setSelectedIds(new Set())
      void refetch()
    } catch (err) {
      console.error('Bulk delete failed:', err)
    } finally {
      setBulkLoading(false)
    }
  }

  const statusFilter = useMemo(() => {
    const raw = searchParams.get('status')
    if (raw == null || raw === '') return ''
    if (VEHICLE_LIST_STATUS_PARAMS.includes(raw as (typeof VEHICLE_LIST_STATUS_PARAMS)[number])) {
      return raw
    }
    return ''
  }, [searchParams])
  const [selectedVehicle, setSelectedVehicle] = useState<typeof vehicles[0] | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [transferDetailId, setTransferDetailId] = useState<number | null>(null)

  const splitInventory = !isAdmin && activeTab === 'MINE'
  const myBranchId = user?.branchId

  const { data: incomingApproved = [] } = useQuery({
    queryKey: ['manager-incoming-transfers', myBranchId],
    queryFn: async (): Promise<TransferRequest[]> => {
      const acc: TransferRequest[] = []
      let p = 0
      let totalPages = 1
      while (p < totalPages) {
        const r = await transferService.getTransfers({ status: 'Approved', page: p, size: 50 })
        acc.push(...r.items.filter((t) => t.toBranchId === myBranchId))
        totalPages = r.meta.totalPages
        p += 1
      }
      return acc
    },
    enabled: Boolean(splitInventory && myBranchId != null),
    staleTime: 15_000,
  })

  const filtered = (vehicles ?? []).filter((v) => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      `${v.brand ?? ''} ${v.model ?? ''} ${v.title ?? ''}`.toLowerCase().includes(q) ||
      (v.listing_id ?? '').toLowerCase().includes(q) ||
      (v.branch_name ?? '').toLowerCase().includes(q)
    const matchStatus = !statusFilter || v.status === statusFilter
    return matchSearch && matchStatus
  })

  const stockList = splitInventory ? filtered.filter((v) => v.status !== 'InTransfer') : filtered
  const outgoingList = splitInventory ? filtered.filter((v) => v.status === 'InTransfer') : []
  const paginateSource = stockList
  const totalPages = Math.ceil(paginateSource.length / PAGE_SIZE) || 1
  const paginated = paginateSource.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const rowCtx: RowCtx = {
    activeTab,
    user: user ?? null,
    isSubmitting,
    navigate,
    openDetail: (v) => {
      setSelectedVehicle(v)
      setDetailOpen(true)
    },
    setVisibilityConfirm,
    selectedIds,
    toggleSelect,
  }

  const handleTabChange = (tab: TabScope) => {
    setActiveTab(tab)
    setSearch('')
    const next = new URLSearchParams(searchParams)
    next.delete('status')
    setSearchParams(next, { replace: true })
    setPage(1)
  }

  const closeTransferModal = () => {
    setTransferDetailId(null)
    void queryClient.invalidateQueries({ queryKey: ['manager-incoming-transfers'] })
    void refetch()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-bold">Quản lý kho xe</h1>
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100">
            <FileDown className="h-5 w-5" />
          </button>
          {activeTab === 'MINE' && (
            <Link
              to="/manager/vehicles/new"
              className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1A3C6E]/90"
            >
              <Plus className="h-4 w-4" />
              Thêm Xe Mới
            </Link>
          )}
        </div>
      </div>

      {/* Tabs — chỉ hiện khi không phải Admin (Admin đã thấy toàn bộ) */}
      {!isAdmin && (
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => handleTabChange('MINE')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'MINE'
                ? 'bg-white text-[#1A3C6E] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Kho xe chi nhánh
          </button>
          <button
            onClick={() => handleTabChange('NETWORK')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === 'NETWORK'
                ? 'bg-white text-[#1A3C6E] shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Tra cứu mạng lưới
            </span>
          </button>
        </div>
      )}

      {activeTab === 'NETWORK' && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Chọn xe và bấm <strong>Yêu cầu điều chuyển</strong> để đưa về chi nhánh của bạn.
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'NETWORK' ? 'Tìm theo tiêu đề, hãng, chi nhánh...' : 'Tìm theo tiêu đề, hãng, dòng, mã tin...'}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              const v = e.target.value
              setPage(1)
              const next = new URLSearchParams(searchParams)
              if (v === '') {
                next.delete('status')
              } else {
                next.set('status', v)
              }
              setSearchParams(next, { replace: true })
            }}
            className="rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
          >
            <option value="">Trạng Thái</option>
            <option value="Available">Đang Bán</option>
            <option value="Reserved">Đã Đặt Cọc</option>
            <option value="Sold">Đã Bán</option>
          </select>
        </div>
      </div>

      {/* {splitInventory && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
          <strong>Điều chuyển:</strong> tạo yêu cầu ở tab <strong>Tra cứu mạng lưới</strong> hoặc{' '}
          <Link className="font-semibold text-[#1A3C6E] underline" to="/manager/transfers">
            trang Yêu cầu điều chuyển
          </Link>
          . Sau khi chi nhánh nguồn duyệt, dùng nút <strong>Xác nhận nhận xe</strong> trong mục vàng &quot;đang chuyển
          đến&quot; (Trưởng chi nhánh).
        </div>
      )} */}

      {splitInventory && user?.role === 'BranchManager' && myBranchId == null && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Chưa gán chi nhánh cho tài khoản — danh sách xe đang chuyển đến có thể không đầy đủ. Hãy{' '}
          <strong>đăng xuất và đăng nhập lại</strong> sau khi quản trị đã cập nhật quyền và phân công chi nhánh cho bạn.
        </div>
      )}

      {splitInventory && incomingApproved.length > 0 && (
        <div className="overflow-hidden rounded-xl border-2 border-amber-400 bg-amber-50/40 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-amber-200 bg-amber-100/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
              <div>
                <h2 className="text-sm font-bold text-amber-950">Xe đang chuyển đến chi nhánh</h2>
                <p className="text-xs text-amber-900/90">
                  Đã được nguồn duyệt — khi xe đã về kho, Trưởng chi nhánh bấm <strong>Xác nhận nhận xe</strong> (mở form
                  có ghi chú).
                </p>
              </div>
            </div>
            <Link
              to="/manager/transfers"
              className="shrink-0 text-sm font-semibold text-[#1A3C6E] underline-offset-2 hover:underline"
            >
              Trang điều chuyển đầy đủ →
            </Link>
          </div>
          <div className="overflow-x-auto bg-white">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b bg-amber-50/80">
                  <th className="p-3 font-semibold text-slate-600">Mã yêu cầu</th>
                  <th className="p-3 font-semibold text-slate-600">Xe</th>
                  <th className="p-3 font-semibold text-slate-600">Từ chi nhánh</th>
                  <th className="p-3 text-right font-semibold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {incomingApproved.map((t) => (
                  <tr key={t.id} className="bg-white hover:bg-amber-50/50">
                    <td className="p-3 font-mono text-xs text-slate-600">#{t.id}</td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-900">{t.vehicleTitle}</p>
                      <p className="text-xs text-slate-500">{t.vehicleListingId}</p>
                    </td>
                    <td className="p-3 text-slate-700">{t.fromBranchName}</td>
                    <td className="p-3 text-right">
                      {user?.role === 'BranchManager' ? (
                        <Button
                          type="button"
                          size="sm"
                          className="!bg-emerald-600 hover:!bg-emerald-700"
                          onClick={() => setTransferDetailId(t.id)}
                        >
                          Xác nhận nhận xe
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-500">Chỉ Trưởng chi nhánh xác nhận</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {splitInventory && outgoingList.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-sky-300 bg-sky-50/30 shadow-sm">
          <div className="border-b border-sky-200 bg-sky-100/50 px-4 py-3">
            <h2 className="text-sm font-bold text-sky-950">Xe đang điều chuyển đi (tại chi nhánh này)</h2>
            <p className="text-xs text-sky-900/90">Trạng thái Đang điều chuyển — chờ hoàn tất hoặc hủy theo nghiệp vụ.</p>
          </div>
          <div className="overflow-x-auto bg-white">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 text-sm font-semibold text-slate-600">Hình ảnh & Xe</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Mã tin</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Năm/Giá</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Trạng thái</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Chi nhánh</th>
                  <th className="p-4 text-right text-sm font-semibold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {outgoingList.map((v) => vehicleInventoryTableRow(v, rowCtx))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {splitInventory && (
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-900">Xe trong kho hiện tại</h2>
            {/* <p className="text-xs text-slate-500">
              Không gồm xe đang điều chuyển đi (xem khối xanh phía trên nếu có).
            </p> */}
          </div>
        )}
        {/* Sprint 4 — Bulk action toolbar */}
        {activeTab === 'MINE' && selectedIds.size > 0 && (
          <div className="flex items-center gap-3 border-b border-blue-200 bg-blue-50 px-4 py-2.5">
            <CheckSquare className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">{selectedIds.size} xe đã chọn</span>
            <div className="ml-auto flex items-center gap-2">
              <select
                disabled={bulkLoading}
                onChange={(e) => {
                  if (e.target.value) void handleBulkStatusChange(e.target.value)
                  e.target.value = ''
                }}
                className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Đổi trạng thái...</option>
                <option value="Available">→ Đang bán</option>
                <option value="Reserved">→ Đã đặt cọc</option>
                <option value="Sold">→ Đã bán</option>
                <option value="Hidden">→ Ẩn</option>
              </select>
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => void handleBulkDelete()}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                Ẩn ({selectedIds.size})
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Bỏ chọn
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {activeTab === 'MINE' && (
                  <th className="w-10 p-4">
                    <input
                      type="checkbox"
                      checked={paginated.length > 0 && paginated.every((v) => selectedIds.has(v.id))}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                    />
                  </th>
                )}
                <th className="p-4 text-sm font-semibold text-slate-600">Hình ảnh & Xe</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Mã tin</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Năm/Giá</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Trạng thái</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Chi nhánh</th>
                <th className="p-4 text-right text-sm font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((v) => vehicleInventoryTableRow(v, rowCtx))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 p-4">
          <p className="text-sm text-slate-500">
            Hiển thị {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, paginateSource.length)} của{' '}
            {paginateSource.length} xe
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
            >
              ‹
            </button>
            <span className="px-2 text-sm text-slate-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
            >
              ›
            </button>
          </div>
        </div>
      </div>
      <TransferDetailModal
        transferId={transferDetailId}
        isOpen={transferDetailId != null}
        onClose={closeTransferModal}
        role={user?.role ?? 'BranchManager'}
        myBranchId={user?.branchId}
      />

      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      <Modal
        isOpen={visibilityConfirm != null}
        onClose={() => {
          if (!isSubmitting) setVisibilityConfirm(null)
        }}
        title={visibilityConfirm?.kind === 'hide' ? 'Ẩn tin đăng khỏi trang công khai?' : 'Hiển thị lại tin đăng?'}
        footer={
          <>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setVisibilityConfirm(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant={visibilityConfirm?.kind === 'hide' ? 'danger' : 'primary'}
              disabled={isSubmitting}
              className={
                visibilityConfirm?.kind === 'restore' ? '!bg-emerald-600 hover:!bg-emerald-700' : ''
              }
              onClick={async () => {
                if (!visibilityConfirm) return
                const { kind, vehicle: vv } = visibilityConfirm
                const ok =
                  kind === 'hide' ? await deleteVehicle(vv.id) : await restoreVehicleVisibility(vv.id)
                if (ok) {
                  setVisibilityConfirm(null)
                  void refetch()
                }
              }}
            >
              {visibilityConfirm?.kind === 'hide' ? 'Ẩn tin' : 'Hiển thị lại'}
            </Button>
          </>
        }
      >
        {visibilityConfirm ? (
          <p className="text-sm text-slate-600">
            {visibilityConfirm.kind === 'hide' ? (
              <>
                Xe <strong className="text-slate-900">{vehicleTablePrimaryLine(visibilityConfirm.vehicle)}</strong> sẽ
                không còn xuất hiện trên trang chủ và tin đăng công khai. Bạn vẫn quản lý được trong kho chi nhánh và có
                thể hiển thị lại sau.
              </>
            ) : (
              <>
                Xe <strong className="text-slate-900">{vehicleTablePrimaryLine(visibilityConfirm.vehicle)}</strong> sẽ
                hiển thị lại cho khách (trừ khi trạng thái là &quot;Ẩn&quot; trong form sửa — khi đó vẫn không lên
                list công khai).
              </>
            )}
          </p>
        ) : null}
      </Modal>
    </div>
  )
}
