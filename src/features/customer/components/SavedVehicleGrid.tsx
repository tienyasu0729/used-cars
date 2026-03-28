/**
 * SavedVehicleGrid — Grid hiển thị danh sách xe đã lưu
 *
 * Chuyển sang API Vehicle type (Dev 2)
 * Xóa dependency mock data: mockSavedListingExtras
 */
import type { Vehicle } from '@/types/vehicle.types'
import { VehicleCard } from '@/features/vehicles/components/VehicleCard'
import { EmptyState } from '@/components/ui'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

interface SavedVehicleGridProps {
  vehicles: Vehicle[]
  isLoading?: boolean
  /** Nút X bỏ lưu (trang /dashboard/saved) */
  onRemoveSaved?: (vehicleId: number) => void
}

export function SavedVehicleGrid({ vehicles, isLoading, onRemoveSaved }: SavedVehicleGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Bạn chưa lưu xe nào"
        description="Khám phá và lưu những xe yêu thích của bạn."
        actionButton={
          <Link to="/vehicles">
            <Button variant="accent">Khám Phá Xe</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((v) => (
        <div key={v.id} className="relative">
          {onRemoveSaved && (
            <button
              type="button"
              onClick={() => onRemoveSaved(v.id)}
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-lg font-bold text-slate-600 shadow-md transition hover:bg-red-50 hover:text-red-600"
              title="Bỏ lưu"
              aria-label="Bỏ lưu xe"
            >
              ×
            </button>
          )}
          <VehicleCard vehicle={v} />
        </div>
      ))}
    </div>
  )
}
