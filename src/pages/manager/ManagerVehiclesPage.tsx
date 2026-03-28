import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Eye, EyeOff, Plus, Search, FileDown } from 'lucide-react'
import { useManagerVehicles } from '@/hooks/useManagerVehicles'
import { VehicleStatusBadge } from '@/components/ui'
import { VehicleDetailModal } from '@/features/manager/components'
import { formatPrice } from '@/utils/format'

const PAGE_SIZE = 10
const BRANDS = ['', 'Toyota', 'Mazda', 'Ford', 'Honda', 'Hyundai']

export function ManagerVehiclesPage() {
  const { data: vehicles, isLoading } = useManagerVehicles()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedVehicle, setSelectedVehicle] = useState<typeof vehicles[0] | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filtered = (vehicles ?? []).filter((v) => {
    const matchSearch =
      !search ||
      `${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase()) ||
      (v.listing_id ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || v.status === statusFilter
    const matchBrand = !brandFilter || v.brand === brandFilter
    return matchSearch && matchStatus && matchBrand
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openDetail = (v: typeof vehicles[0]) => {
    setSelectedVehicle(v)
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
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-bold">Quản lý kho xe</h1>
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100">
            <FileDown className="h-5 w-5" />
          </button>
          <Link
            to="/manager/vehicles/new"
            className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1A3C6E]/90"
          >
            <Plus className="h-4 w-4" />
            Thêm Xe Mới
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên xe, biển số..."
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
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
          >
            <option value="">Trạng Thái</option>
            <option value="Available">Đang Bán</option>
            <option value="Reserved">Đã Đặt Cọc</option>
            <option value="Sold">Đã Bán</option>
          </select>
          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm focus:ring-2 focus:ring-[#1A3C6E]/20"
          >
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b || 'Hãng Xe'}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-sm font-semibold text-slate-600">Hình ảnh & Xe</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Biển số</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Năm/Giá</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Trạng thái</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Nhân viên phụ trách</th>
                <th className="p-4 text-right text-sm font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((v) => {
                const im = v.images?.[0]
                const thumb = typeof im === 'string' ? im : im?.url
                return (
                <tr
                  key={v.id}
                  className="cursor-pointer transition-colors hover:bg-slate-50/50"
                  onClick={() => openDetail(v)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200 bg-cover bg-center"
                        style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
                      />
                      <div>
                        <p className="font-bold text-slate-900">
                          {v.brand} {v.model}
                        </p>
                        <p className="text-xs text-slate-500">
                          {v.exteriorColor ?? 'N/A'} • {v.fuel}
                        </p>
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
                    <VehicleStatusBadge status={v.status} />
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-200" />
                      <span className="text-sm">Trần Văn An</span>
                    </div>
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/manager/vehicles/${v.id}/edit`}>
                        <button className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100">
                          <Pencil className="h-5 w-5" />
                        </button>
                      </Link>
                      <Link to={`/vehicles/${v.id}`}>
                        <button className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100">
                          <Eye className="h-5 w-5" />
                        </button>
                      </Link>
                      <button className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50">
                        <EyeOff className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 p-4">
          <p className="text-sm text-slate-500">
            Hiển thị {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} của{' '}
            {filtered.length} xe
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
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
