import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Pagination, VehicleStatusBadge } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useStaffOrManagerBasePath } from '@/hooks/useStaffOrManagerBasePath'
import { useVehicles } from '@/hooks/useVehicles'
import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'
import { formatPrice, formatRelativeTime } from '@/utils/format'
import type { VehicleStatus } from '@/types/vehicle.types'

const tabs = ['Tat Ca', 'Con Hang', 'Da Dat Coc', 'Da Ban']
const TAB_API_STATUS: (VehicleStatus | undefined)[] = [undefined, 'Available', 'Reserved', 'Sold']

export function StaffInventoryPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { deposits } = useStaffOrManagerBasePath()
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const status = TAB_API_STATUS[activeTab]
  const inventoryQuery = useVehicles({
    managed: true,
    branchId: user?.branchId ?? undefined,
    status,
    q: debouncedSearch || undefined,
    size: pageSize,
    page: page - 1,
    sort: 'idDesc',
  })

  useEffect(() => {
    setPage(1)
  }, [activeTab, debouncedSearch])

  const inventory = inventoryQuery.vehicles
  const totalPages = Math.max(1, inventoryQuery.totalPages || 1)
  const totalElements = inventoryQuery.totalElements

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`border-b-2 px-6 py-4 text-sm font-bold ${
                activeTab === index ? 'border-[#1A3C6E] text-[#1A3C6E]' : 'border-transparent text-slate-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4">
          <input
            type="text"
            placeholder="Tim kiem ma tin hoac ten xe..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-4 text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Hinh anh</th>
                <th className="px-6 py-4">Ten xe</th>
                <th className="px-6 py-4 text-center">Ma tin</th>
                <th className="px-6 py-4 text-center">Nam SX</th>
                <th className="px-6 py-4 text-right">Gia niem yet</th>
                <th className="px-6 py-4 text-center">Trang thai</th>
                <th className="px-6 py-4">Cap nhat cuoi</th>
                <th className="px-6 py-4 text-right">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {inventoryQuery.isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-slate-400">
                    Dang tai du lieu...
                  </td>
                </tr>
              ) : inventoryQuery.error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-red-500">
                    {inventoryQuery.error}
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-slate-400">
                    Khong co xe nao
                  </td>
                </tr>
              ) : (
                inventory.map((vehicle) => {
                  const image = vehicle.images?.[0]
                  const thumb = externalImageDisplayUrl(typeof image === 'string' ? image : image?.url)
                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div
                          className="h-12 w-20 rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${thumb || 'https://placehold.co/80x48'})` }}
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <Link to={`/vehicles/${vehicle.id}?view=manager`} className="hover:text-[#1A3C6E] hover:underline">
                          {vehicle.title || `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() || 'Xe'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-slate-600">{vehicle.listing_id || '-'}</td>
                      <td className="px-6 py-4 text-center">{vehicle.year}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#1A3C6E]">{formatPrice(vehicle.price)}</td>
                      <td className="px-6 py-4 text-center">
                        <VehicleStatusBadge status={vehicle.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{formatRelativeTime(vehicle.updated_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/vehicles/${vehicle.id}?view=manager`}
                          className="mr-2 text-sm font-medium text-[#1A3C6E] hover:underline"
                        >
                          Xem
                        </Link>
                        {vehicle.status === 'Available' && (
                          <button
                            onClick={() => navigate(`${deposits}/new?vehicleId=${vehicle.id}`)}
                            className="text-sm font-medium text-[#E8612A] hover:underline"
                          >
                            Dat coc
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={totalElements}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        label="xe"
      />
    </div>
  )
}
