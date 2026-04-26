import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '@/hooks/useOrders'
import { useVehicles } from '@/hooks/useVehicles'
import { formatPrice, formatDate, formatMileage } from '@/utils/format'
import { ExportMenu, ExportSelectionBar, Pagination } from '@/components/ui'
import { Plus, MoreVertical, Search, X } from 'lucide-react'
import { downloadExcel, todayStr } from '@/utils/excelExport'

const statusMap: Record<string, { label: string; className: string }> = {
  Completed: { label: 'Hoàn thành', className: 'bg-green-100 text-green-700' },
  Processing: { label: 'Đang xử lý', className: 'bg-amber-100 text-amber-700' },
  Pending: { label: 'Chờ xử lý', className: 'bg-blue-100 text-blue-700' },
  Cancelled: { label: 'Đã hủy', className: 'bg-slate-100 text-slate-700' },
}

const tabFilters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Pending', label: 'Chờ xử lý' },
  { key: 'Processing', label: 'Đang xử lý' },
  { key: 'Completed', label: 'Đã hoàn thành' },
  { key: 'Cancelled', label: 'Đã hủy' },
]

export function OrdersPage() {
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const { data: ordData, isLoading } = useOrders({ size: 500 })
  const orders = ordData?.orders ?? []
  const { vehicles } = useVehicles()

  const filtered = useMemo(() => {
    let list = tab === 'all' ? orders : orders.filter((o) => o.status === tab)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((o) => {
        const orderNum = (o.orderNumber ?? String(o.id)).toLowerCase()
        return orderNum.includes(q)
      })
    }
    return list
  }, [orders, tab, searchQuery])
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  const toggleId = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const buildExcelRows = (items: typeof orders) =>
    items.map((o) => {
      const v = vehicles.find((ve) => String(ve.id) === String(o.vehicleId))
      const status = statusMap[o.status]?.label ?? o.status
      return [o.orderNumber ?? String(o.id), v?.title ?? 'Xe', String(o.price), formatDate(o.createdAt), status]
    })

  const exportHeaders = ['Mã đơn', 'Xe', 'Giá (VNĐ)', 'Ngày đặt', 'Trạng thái']

  const handleExportSelected = () => {
    const items = filtered.filter((o) => selectedIds.has(o.id))
    downloadExcel(`don-hang-chon-${todayStr()}.xlsx`, exportHeaders, buildExcelRows(items))
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="transition-colors hover:text-[#1A3C6E]">Trang chủ</Link>
        <span>/</span>
        <span className="font-medium text-slate-900">Đơn hàng của tôi</span>
      </nav>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Đơn hàng của tôi</h1>
          <p className="mt-1 text-slate-500">Theo dõi trạng thái và lịch sử giao dịch xe của bạn tại Đà Nẵng</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu
            onExportAll={() => {
              downloadExcel(`don-hang-tat-ca-${todayStr()}.xlsx`, exportHeaders, buildExcelRows(orders))
            }}
            onExportFiltered={() => {
              setSelectMode(true)
              setSelectedIds(new Set())
            }}
          />
          <Link
            to="/vehicles"
            className="flex items-center gap-2 rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1A3C6E]/90"
          >
            <Plus className="h-5 w-5" />
            Mua xe mới
          </Link>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-8">
            {tabFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => { setTab(f.key); setPage(1) }}
                className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                  tab === f.key
                    ? 'border-[#1A3C6E] text-[#1A3C6E]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.key === 'all' ? `Tất cả (${orders?.length ?? 0})` : f.label}
              </button>
            ))}
          </div>
          <div className="relative ml-auto mb-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              placeholder="Tìm mã đơn hàng..."
              className="h-9 w-56 rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]/30"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setPage(1) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {selectMode && (
        <ExportSelectionBar
          selectedCount={selectedIds.size}
          totalCount={filtered.length}
          onSelectAll={() => setSelectedIds(new Set(filtered.map((o) => o.id)))}
          onDeselectAll={() => setSelectedIds(new Set())}
          onExport={handleExportSelected}
          onCancel={() => { setSelectMode(false); setSelectedIds(new Set()) }}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {selectMode && (
                  <th className="w-10 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={paginated.length > 0 && paginated.every((o) => selectedIds.has(o.id))}
                      onChange={() => {
                        const pageIds = paginated.map((o) => o.id)
                        const allChecked = pageIds.every((id) => selectedIds.has(id))
                        setSelectedIds((prev) => {
                          const next = new Set(prev)
                          pageIds.forEach((id) => allChecked ? next.delete(id) : next.add(id))
                          return next
                        })
                      }}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                    />
                  </th>
                )}
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mã đơn hàng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Phương tiện</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Giá bán</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày đặt</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginated.map((o) => {
                const vehicle = vehicles.find((v) => String(v.id) === String(o.vehicleId))
                const status = statusMap[o.status] ?? { label: o.status, className: 'bg-slate-100 text-slate-700' }
                const detail = vehicle
                  ? `Đời ${vehicle.year} • ${vehicle.exteriorColor ?? '-'} • ${vehicle.mileage != null && vehicle.mileage === 0 ? 'Mới 100%' : formatMileage(vehicle.mileage)}`
                  : '-'
                return (
                  <tr key={o.id} className={`transition-colors hover:bg-slate-50 ${selectMode && selectedIds.has(o.id) ? 'bg-blue-50/50' : ''}`}>
                    {selectMode && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(o.id)}
                          onChange={() => toggleId(o.id)}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]/20"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-[#1A3C6E]">
                        {o.orderNumber ?? `#${o.id}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
                          <img
                            src={vehicle?.images?.[0]?.url || 'https://placehold.co/160x112?text=No+Image'}
                            alt={vehicle?.title ?? 'Xe'}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-none text-slate-900">
                            {vehicle?.title || (vehicle ? `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() : 'Xe')}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{detail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-[#1A3C6E]">
                        {formatPrice(o.price).replace(' VNĐ', '₫')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(o.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/dashboard/orders/${o.id}`}
                        className="inline-flex text-slate-400 transition-colors hover:text-[#1A3C6E]"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} label="đơn hàng" />

      {total === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Chưa có đơn hàng nào
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1A3C6E] to-blue-900">
        <div className="relative flex flex-col gap-6 px-8 py-10 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black text-white">Đặc quyền bảo hiểm cho đơn hàng tiếp theo</h3>
            <p className="mt-2 max-w-lg text-blue-100/80">
              Giảm ngay 10% phí bảo hiểm vật chất xe cho tất cả khách hàng đã hoàn thành tối thiểu 1 giao dịch tại BanXeOTo Da Nang.
            </p>
          </div>
          <button className="shrink-0 rounded-lg bg-white px-6 py-3 font-bold text-[#1A3C6E] transition-colors hover:bg-slate-100">
            Xem chi tiết ưu đãi
          </button>
        </div>
      </div>
    </div>
  )
}
