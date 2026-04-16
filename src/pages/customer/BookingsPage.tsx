import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookingCard } from '@/features/customer/components/BookingCard'
import { BookingDetailModal } from '@/features/customer/components/BookingDetailModal'
import { useMyBookings } from '@/hooks/useMyBookings'
import { useVehicles } from '@/hooks/useVehicles'
import { useBranches } from '@/hooks/useBranches'
import { EmptyState, Pagination } from '@/components/ui'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui'
import type { Booking } from '@/types/booking.types'

const tabs = [
  { key: 'all', label: 'Tất Cả' },
  { key: 'pending', label: 'Chờ Xác Nhận' },
  { key: 'confirmed', label: 'Đã Xác Nhận' },
  { key: 'cancelled', label: 'Đã Hủy' },
]

export function BookingsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const { bookings: allBookings, isLoading, isError, cancelBooking } = useMyBookings()
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const handleCancelBooking = useCallback(
    async (id: number) => {
      setCancellingId(id)
      try {
        await cancelBooking(id)
        setSelectedBooking(null)
      } catch (e) {
        const msg =
          e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
            ? (e as { message: string }).message
            : 'Không thể hủy lịch. Vui lòng thử lại.'
        window.alert(msg)
      } finally {
        setCancellingId(null)
      }
    },
    [cancelBooking],
  )
  const { vehicles } = useVehicles()
  const { data: branches } = useBranches()

  const filtered =
    activeTab === 'all'
      ? allBookings
      : allBookings.filter((b) => {
          if (activeTab === 'pending') return b.status === 'Pending' || b.status === 'Rescheduled'
          if (activeTab === 'confirmed') return b.status === 'Confirmed' || b.status === 'Completed'
          if (activeTab === 'cancelled') return b.status === 'Cancelled'
          return true
        })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const tabCounts = useMemo(() => {
    const pending = allBookings.filter((b) => b.status === 'Pending' || b.status === 'Rescheduled').length
    const confirmed = allBookings.filter((b) => b.status === 'Confirmed' || b.status === 'Completed').length
    const cancelled = allBookings.filter((b) => b.status === 'Cancelled').length
    return {
      all: allBookings.length,
      pending,
      confirmed,
      cancelled,
    }
  }, [allBookings])

  const selectedVehicle = selectedBooking
    ? vehicles.find((v) => v.id === selectedBooking.vehicleId) ?? null
    : null
  const selectedBranch = selectedBooking
    ? branches?.find((br) => Number(br.id) === selectedBooking.branchId) ?? null
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lịch Lái Thử</h1>
        <p className="mt-1 text-slate-500">Quản lý các lịch hẹn lái thử của bạn</p>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((t) => {
          const count = tabCounts[t.key as keyof typeof tabCounts]
          const showBadge = count > 0
          const isPendingTab = t.key === 'pending'
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => { setActiveTab(t.key); setPage(1) }}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === t.key
                  ? 'border-[#1A3C6E] text-[#1A3C6E]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{t.label}</span>
              {showBadge && (
                <span
                  className={
                    isPendingTab
                      ? 'min-w-[1.25rem] rounded-full bg-red-100 px-1.5 py-0.5 text-center text-xs font-bold text-red-700'
                      : 'min-w-[1.25rem] rounded-full bg-slate-200 px-1.5 py-0.5 text-center text-xs font-semibold text-slate-700'
                  }
                  aria-label={`${count} lịch`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
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
        <>
          <div className="space-y-3">
            {paginated.map((b) => {
              const vehicle = vehicles.find((v) => v.id === b.vehicleId)
              const branch = branches?.find((br) => Number(br.id) === b.branchId)
              return (
                <BookingCard
                  key={b.id}
                  booking={b}
                  vehicle={vehicle}
                  branch={branch}
                  onViewDetail={setSelectedBooking}
                />
              )
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
            label="lịch hẹn"
          />
        </>
      )}

      <BookingDetailModal
        booking={selectedBooking}
        vehicle={selectedVehicle}
        branch={selectedBranch}
        isOpen={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
        onCancelBooking={handleCancelBooking}
        isCancelling={cancellingId === selectedBooking?.id}
      />
    </div>
  )
}
