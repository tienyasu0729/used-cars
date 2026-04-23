import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useInventory } from '@/hooks/useInventory'
import { useStaffOrManagerBasePath } from '@/hooks/useStaffOrManagerBasePath'
import { formatPrice, formatRelativeTime } from '@/utils/format'
import { VehicleStatusBadge, Pagination } from '@/components/ui'
import type { VehicleStatus } from '@/types/vehicle.types'

const tabs = ['Tất Cả', 'Còn Hàng', 'Đã Đặt Cọc', 'Đã Bán']

const TAB_API_STATUS: (VehicleStatus | undefined)[] = [undefined, 'Available', 'Reserved', 'Sold']

export function StaffInventoryPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const { data: inventory, setFilters, isLoading, error } = useInventory()
  const navigate = useNavigate()
  const { deposits } = useStaffOrManagerBasePath()

  useEffect(() => {
    const s = TAB_API_STATUS[activeTab]
    setFilters(s != null ? { status: s } : { status: undefined })
  }, [activeTab, setFilters])

  const filtered = (inventory ?? []).filter((v) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      (v.title?.toLowerCase().includes(q) ?? false) ||
      (v.listing_id?.toLowerCase().includes(q) ?? false) ||
      (v.brand?.toLowerCase().includes(q) ?? false) ||
      (v.model?.toLowerCase().includes(q) ?? false)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => { setPage(1) }, [activeTab, search])

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`border-b-2 px-6 py-4 text-sm font-bold ${
                activeTab === i ? 'border-[#1A3C6E] text-[#1A3C6E]' : 'border-transparent text-slate-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-4">
          <input
            type="text"
            placeholder="Tìm kiếm mã tin hoặc tên xe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Hình ảnh</th>
                <th className="px-6 py-4">Tên xe</th>
                <th className="px-6 py-4 text-center">Mã tin</th>
                <th className="px-6 py-4 text-center">Năm SX</th>
                <th className="px-6 py-4 text-right">Giá niêm yết</th>
                <th className="px-6 py-4 text-center">Trạng Thái</th>
                <th className="px-6 py-4">Cập Nhật Cuối</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center text-sm text-slate-400">Đang tải dữ liệu...</td></tr>
              ) : error ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center text-sm text-red-500">{error}</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center text-sm text-slate-400">Không có xe nào</td></tr>
              ) : paginated.map((v) => {
                const im = v.images?.[0]
                const thumb = typeof im === 'string' ? im : im?.url
                return (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div
                      className="h-12 w-20 rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${thumb || 'https://placehold.co/80x48'})` }}
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <Link to={`/vehicles/${v.id}`} className="hover:text-[#1A3C6E] hover:underline">
                      {v.title || `${v.brand ?? ''} ${v.model ?? ''}`.trim() || 'Xe'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-slate-600">{v.listing_id || '—'}</td>
                  <td className="px-6 py-4 text-center">{v.year}</td>
                  <td className="px-6 py-4 text-right font-bold text-[#1A3C6E]">{formatPrice(v.price)}</td>
                  <td className="px-6 py-4 text-center">
                    <VehicleStatusBadge status={v.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{formatRelativeTime(v.updated_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/vehicles/${v.id}`}
                      className="mr-2 text-sm font-medium text-[#1A3C6E] hover:underline"
                    >
                      Xem
                    </Link>
                    {v.status === 'Available' && (
                      <button
                        onClick={() => navigate(`${deposits}/new?vehicleId=${v.id}`)}
                        className="text-sm font-medium text-[#E8612A] hover:underline"
                      >
                        Đặt cọc
                      </button>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} totalPages={totalPages} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1) }} label="xe" />
    </div>
  )
}
