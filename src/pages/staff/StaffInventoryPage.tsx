import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useInventory } from '@/hooks/useInventory'
import { useStaffCustomerOptions } from '@/hooks/useStaffCustomerOptions'
import { depositApi } from '@/services/depositApi'
import { useToastStore } from '@/store/toastStore'
import { useQueryClient } from '@tanstack/react-query'
import { formatPrice } from '@/utils/format'
import { VehicleStatusBadge } from '@/components/ui'
import { ReserveVehicleModal } from '@/features/staff/components/ReserveVehicleModal'
import type { Vehicle, VehicleStatus } from '@/types/vehicle.types'

const tabs = ['Tất Cả', 'Còn Hàng', 'Đã Đặt Cọc', 'Đã Bán']

const TAB_API_STATUS: (VehicleStatus | undefined)[] = [undefined, 'Available', 'Reserved', 'Sold']

export function StaffInventoryPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState('')
  const [reserveVehicle, setReserveVehicle] = useState<Vehicle | null>(null)
  const { data: inventory, setFilters, refetch } = useInventory()
  const { data: customerRows = [] } = useStaffCustomerOptions()

  useEffect(() => {
    const s = TAB_API_STATUS[activeTab]
    setFilters(s != null ? { status: s } : { status: undefined })
  }, [activeTab, setFilters])

  const filtered = (inventory ?? []).filter((v) => {
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      (v.title?.toLowerCase().includes(q) ?? false) ||
      (v.brand?.toLowerCase().includes(q) ?? false) ||
      (v.model?.toLowerCase().includes(q) ?? false)
    return matchSearch
  })

  const toast = useToastStore()
  const queryClient = useQueryClient()

  const handleReserveSubmit = async (data: { customerId: string; notes?: string }) => {
    if (!reserveVehicle) return
    try {
      const amt = Math.max(1_000_000, Math.floor(reserveVehicle.price * 0.1))
      await depositApi.create({
        vehicleId: Number(reserveVehicle.id),
        customerId: Number(data.customerId),
        amount: amt,
        paymentMethod: 'cash',
        note: data.notes?.trim() || undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      void refetch()
      toast.addToast('success', 'Đã đặt chỗ xe thành công')
      setReserveVehicle(null)
    } catch {
      toast.addToast('error', 'Không thể đặt chỗ')
    }
  }

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
            placeholder="Tìm kiếm Biển số hoặc tên xe..."
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
                <th className="px-6 py-4 text-center">Biển số</th>
                <th className="px-6 py-4 text-center">Năm SX</th>
                <th className="px-6 py-4 text-right">Giá niêm yết</th>
                <th className="px-6 py-4 text-center">Trạng Thái</th>
                <th className="px-6 py-4">Cập Nhật Cuối</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((v) => {
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
                      {v.brand} {v.model}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-slate-600">43A-***.**</td>
                  <td className="px-6 py-4 text-center">{v.year}</td>
                  <td className="px-6 py-4 text-right font-bold text-[#1A3C6E]">{formatPrice(v.price)}</td>
                  <td className="px-6 py-4 text-center">
                    <VehicleStatusBadge status={v.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">2 giờ trước</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/vehicles/${v.id}`}
                      className="mr-2 text-sm font-medium text-[#1A3C6E] hover:underline"
                    >
                      Xem
                    </Link>
                    {v.status === 'Available' && (
                      <button
                        onClick={() => setReserveVehicle(v)}
                        className="text-sm font-medium text-[#E8612A] hover:underline"
                      >
                        Đặt chỗ
                      </button>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-xs text-slate-500">Hiển thị 1-{filtered.length} trong số {inventory?.length ?? 0} xe</p>
        </div>
      </div>
      <ReserveVehicleModal
        vehicle={reserveVehicle}
        isOpen={!!reserveVehicle}
        onClose={() => setReserveVehicle(null)}
        onSubmit={handleReserveSubmit}
        customers={customerRows.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  )
}
