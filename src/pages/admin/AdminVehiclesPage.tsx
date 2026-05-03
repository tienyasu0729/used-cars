import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Pencil, Eye, Plus, Search, Trash2, RotateCcw, CheckSquare } from 'lucide-react'
import { useManagerVehicle, useManagerVehicles } from '@/hooks/useManagerVehicles'
import { useHasPermission } from '@/hooks/usePermissions'
import {
  VehicleStatusBadge,
  Modal,
  Button,
  ConfirmDialog,
  ExportMenu,
  ExportSelectionBar,
  Pagination,
} from '@/components/ui'
import { VehicleDetailModal } from '@/features/manager/components'
import { vehicleService } from '@/services/vehicle.service'
import { formatPrice, formatMileage } from '@/utils/format'
import { downloadBlob, downloadExcel, todayStr } from '@/utils/excelExport'
import axiosInstance from '@/utils/axiosInstance'
import type { Vehicle } from '@/types/vehicle.types'

type VisibilityConfirm = { kind: 'hide' | 'restore'; vehicle: Vehicle }

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

function vehicleTableMetaLine(v: Vehicle): string {
  const parts: string[] = [formatMileage(v.mileage)]
  if (v.year > 0) parts.push(String(v.year))
  parts.push(v.fuel?.trim() || '—')
  return parts.join(' • ')
}

const VEHICLE_LIST_STATUS_PARAMS = ['Available', 'Reserved', 'Sold', 'Hidden'] as const
const VEHICLE_VISIBILITY_PARAMS = ['visible', 'hidden'] as const

export function AdminVehiclesPage() {
  const canCreateVehicle = useHasPermission('Vehicles', 'create')
  const canDeleteVehicle = useHasPermission('Vehicles', 'delete')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: vehicles, isLoading, refetch } = useManagerVehicles({ fetchAll: true })
  const { deleteVehicle, restoreVehicleVisibility, isSubmitting } = useManagerVehicle()
  const [visibilityConfirm, setVisibilityConfirm] = useState<VisibilityConfirm | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkHideConfirmOpen, setBulkHideConfirmOpen] = useState(false)
  const [exportSelectMode, setExportSelectMode] = useState(false)
  const [exportSelectedIds, setExportSelectedIds] = useState<Set<number>>(new Set())
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleExportSelect = useCallback((id: number) => {
    setExportSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

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

  const executeBulkHide = async () => {
    if (selectedIds.size === 0) return
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

  const visibilityFilter = useMemo(() => {
    const raw = searchParams.get('visibility')
    if (raw == null || raw === '') return ''
    if (VEHICLE_VISIBILITY_PARAMS.includes(raw as (typeof VEHICLE_VISIBILITY_PARAMS)[number])) {
      return raw
    }
    return ''
  }, [searchParams])

  const branchFilter = useMemo(() => searchParams.get('branch')?.trim() ?? '', [searchParams])
  const brandFilter = useMemo(() => searchParams.get('brand')?.trim() ?? '', [searchParams])

  const branchOptions = useMemo(
    () =>
      Array.from(new Set((vehicles ?? []).map((v) => v.branch_name?.trim()).filter(Boolean) as string[])).sort((a, b) =>
        a.localeCompare(b, 'vi'),
      ),
    [vehicles],
  )

  const brandOptions = useMemo(
    () =>
      Array.from(new Set((vehicles ?? []).map((v) => v.brand?.trim()).filter(Boolean) as string[])).sort((a, b) =>
        a.localeCompare(b, 'vi'),
      ),
    [vehicles],
  )

  const filtered = (vehicles ?? []).filter((v) => {
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      `${v.brand ?? ''} ${v.model ?? ''} ${v.title ?? ''}`.toLowerCase().includes(q) ||
      (v.listing_id ?? '').toLowerCase().includes(q) ||
      (v.branch_name ?? '').toLowerCase().includes(q)
    const matchStatus = !statusFilter || v.status === statusFilter
    const matchVisibility =
      !visibilityFilter || (visibilityFilter === 'hidden' ? Boolean(v.deleted) : !v.deleted)
    const matchBranch = !branchFilter || (v.branch_name ?? '').trim() === branchFilter
    const matchBrand = !brandFilter || (v.brand ?? '').trim() === brandFilter
    return matchSearch && matchStatus && matchVisibility && matchBranch && matchBrand
  })

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

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
  }, [paginated])

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
        <div>
          <h1 className="text-xl font-bold">Quản lý xe toàn hệ thống</h1>
          <p className="mt-1 text-sm text-slate-500">Xem và quản trị toàn bộ xe trên các chi nhánh.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportMenu
            onExportAll={async () => {
              try {
                const res = await axiosInstance.get('/manager/vehicles/export', { responseType: 'blob' })
                downloadBlob(res as unknown as Blob, `danh-sach-xe-tat-ca-${todayStr()}.xlsx`)
              } catch {
                // silent
              }
            }}
            onExportFiltered={() => {
              setExportSelectMode(true)
              setExportSelectedIds(new Set())
            }}
          />
          {canCreateVehicle && (
            <Link
              to="/admin/vehicles/new"
              className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1A3C6E]/90"
            >
              <Plus className="h-4 w-4" />
              Thêm xe mới
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, hãng, dòng, mã tin, chi nhánh..."
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
              if (v === '') next.delete('status')
              else next.set('status', v)
              setSearchParams(next, { replace: true })
            }}
            className="rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
          >
            <option value="">Trạng thái</option>
            <option value="Available">Đang bán</option>
            <option value="Reserved">Đã đặt cọc</option>
            <option value="Sold">Đã bán</option>
            <option value="Hidden">Ẩn</option>
          </select>
          <select
            value={visibilityFilter}
            onChange={(e) => {
              const v = e.target.value
              setPage(1)
              const next = new URLSearchParams(searchParams)
              if (v === '') next.delete('visibility')
              else next.set('visibility', v)
              setSearchParams(next, { replace: true })
            }}
            className="rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
          >
            <option value="">Hiển thị</option>
            <option value="visible">Đang công khai</option>
            <option value="hidden">Đang ẩn</option>
          </select>
          <select
            value={branchFilter}
            onChange={(e) => {
              const v = e.target.value
              setPage(1)
              const next = new URLSearchParams(searchParams)
              if (v === '') next.delete('branch')
              else next.set('branch', v)
              setSearchParams(next, { replace: true })
            }}
            className="rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
          >
            <option value="">Chi nhánh</option>
            {branchOptions.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <select
            value={brandFilter}
            onChange={(e) => {
              const v = e.target.value
              setPage(1)
              const next = new URLSearchParams(searchParams)
              if (v === '') next.delete('brand')
              else next.set('brand', v)
              setSearchParams(next, { replace: true })
            }}
            className="rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
          >
            <option value="">Hãng xe</option>
            {brandOptions.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      </div>

      {exportSelectMode && (
        <ExportSelectionBar
          selectedCount={exportSelectedIds.size}
          totalCount={filtered.length}
          onSelectAll={() => setExportSelectedIds(new Set(filtered.map((v) => v.id)))}
          onDeselectAll={() => setExportSelectedIds(new Set())}
          onExport={() => {
            const items = filtered.filter((v) => exportSelectedIds.has(v.id))
            const rows = items.map((v) => [
              String(v.id),
              v.listing_id ?? '',
              v.title ?? `${v.brand ?? ''} ${v.model ?? ''}`.trim(),
              v.brand ?? '',
              v.model ?? '',
              String(v.year ?? ''),
              String(v.price ?? ''),
              String(v.mileage ?? ''),
              v.fuel ?? '',
              v.transmission ?? '',
              v.status ?? '',
              v.branch_name ?? '',
            ])
            downloadExcel(
              `danh-sach-xe-chon-${todayStr()}.xlsx`,
              ['ID', 'Mã tin', 'Tiêu đề', 'Hãng xe', 'Dòng xe', 'Năm SX', 'Giá (VNĐ)', 'Số km', 'Nhiên liệu', 'Hộp số', 'Trạng thái', 'Chi nhánh'],
              rows,
            )
            setExportSelectMode(false)
            setExportSelectedIds(new Set())
          }}
          onCancel={() => {
            setExportSelectMode(false)
            setExportSelectedIds(new Set())
          }}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {selectedIds.size > 0 && (
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
                onClick={() => selectedIds.size > 0 && setBulkHideConfirmOpen(true)}
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
                {exportSelectMode ? (
                  <th className="w-10 p-4">
                    <input
                      type="checkbox"
                      checked={paginated.length > 0 && paginated.every((v) => exportSelectedIds.has(v.id))}
                      onChange={() => {
                        const pageIds = paginated.map((v) => v.id)
                        const allChecked = pageIds.every((id) => exportSelectedIds.has(id))
                        setExportSelectedIds((prev) => {
                          const next = new Set(prev)
                          pageIds.forEach((id) => (allChecked ? next.delete(id) : next.add(id)))
                          return next
                        })
                      }}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                    />
                  </th>
                ) : (
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
              {paginated.map((v) => {
                const im = v.images?.[0]
                const thumb = typeof im === 'string' ? im : im?.url
                const isSelected = selectedIds.has(v.id)
                const isExportSelected = exportSelectedIds.has(v.id)
                return (
                  <tr
                    key={v.id}
                    className={`cursor-pointer transition-colors ${
                      exportSelectMode && isExportSelected
                        ? 'bg-blue-50/60'
                        : isSelected
                          ? 'bg-blue-50/60'
                          : 'hover:bg-slate-50/50'
                    }`}
                    onClick={() => {
                      if (exportSelectMode) toggleExportSelect(v.id)
                      else {
                        setSelectedVehicle(v)
                        setDetailOpen(true)
                      }
                    }}
                  >
                    {exportSelectMode ? (
                      <td className="w-10 p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isExportSelected}
                          onChange={() => toggleExportSelect(v.id)}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                        />
                      </td>
                    ) : (
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
                        {v.listing_hold_active ? (
                          <span className="w-fit rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                            Có cọc / thanh toán đang xử lý
                          </span>
                        ) : null}
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
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/vehicles/${v.id}/edit`}>
                          <button type="button" className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100">
                            <Pencil className="h-5 w-5" />
                          </button>
                        </Link>
                        <Link to={`/vehicles/${v.id}?view=manager`}>
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100"
                            title="Xem xe trong chế độ quản trị"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </Link>
                        {canDeleteVehicle &&
                          (v.deleted ? (
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
                          ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s)
          setPage(1)
        }}
        label="xe"
      />

      <VehicleDetailModal vehicle={selectedVehicle} isOpen={detailOpen} onClose={() => setDetailOpen(false)} />

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
              className={visibilityConfirm?.kind === 'restore' ? '!bg-emerald-600 hover:!bg-emerald-700' : ''}
              onClick={async () => {
                if (!visibilityConfirm) return
                const { kind, vehicle } = visibilityConfirm
                const ok = kind === 'hide' ? await deleteVehicle(vehicle.id) : await restoreVehicleVisibility(vehicle.id)
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
                không còn xuất hiện trên trang chủ và tin đăng công khai. Bạn vẫn quản lý được trong khu admin và có
                thể hiển thị lại sau.
              </>
            ) : (
              <>
                Xe <strong className="text-slate-900">{vehicleTablePrimaryLine(visibilityConfirm.vehicle)}</strong> sẽ
                hiển thị lại cho khách, trừ khi trạng thái trong form sửa vẫn là “Ẩn”.
              </>
            )}
          </p>
        ) : null}
      </Modal>

      <ConfirmDialog
        isOpen={bulkHideConfirmOpen}
        onClose={() => setBulkHideConfirmOpen(false)}
        title="Ẩn xe đã chọn"
        message={`Xác nhận ẩn ${selectedIds.size} xe khỏi trang chủ và tin công khai?`}
        confirmLabel="Ẩn xe"
        loading={bulkLoading}
        onConfirm={async () => {
          await executeBulkHide()
          setBulkHideConfirmOpen(false)
        }}
      />
    </div>
  )
}
