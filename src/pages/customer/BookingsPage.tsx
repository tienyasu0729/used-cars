import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookingCard } from '@/features/customer/components/BookingCard'
import { useBookings } from '@/hooks/useBookings'
import { useVehicles } from '@/hooks/useVehicles'
import { useBranches } from '@/hooks/useBranches'
import { EmptyState } from '@/components/ui'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui'

const tabs = [
  { key: 'all', label: 'Tất Cả' },
  { key: 'pending', label: 'Chờ Xác Nhận' },
  { key: 'confirmed', label: 'Đã Xác Nhận' },
  { key: 'cancelled', label: 'Đã Hủy' },
]

export function BookingsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const { data: bookings, isLoading, isError } = useBookings()
  const { data: vehiclesData } = useVehicles()
  const { data: branches } = useBranches()
  const vehicles = vehiclesData?.data ?? []

  const filtered =
    activeTab === 'all'
      ? bookings ?? []
      : (bookings ?? []).filter((b) => {
          if (activeTab === 'pending') return b.status === 'Pending'
          if (activeTab === 'confirmed') return b.status === 'Confirmed' || b.status === 'Completed'
          if (activeTab === 'cancelled') return b.status === 'Cancelled'
          return true
        })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lịch Lái Thử</h1>
        <p className="mt-1 text-slate-500">Quản lý các lịch hẹn lái thử của bạn</p>
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? 'border-[#1A3C6E] text-[#1A3C6E]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Không thể tải lịch hẹn. Vui lòng thử lại.
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Bạn chưa có lịch lái thử nào"
          actionButton={
            <Link to="/vehicles">
              <Button variant="accent">Đặt Lịch Ngay</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const vehicle = vehicles.find((v) => v.id === b.vehicleId)
            const branch = branches?.find((br) => br.id === b.branchId)
            return (
              <BookingCard
                key={b.id}
                booking={b}
                vehicle={vehicle}
                branch={branch}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
