/**
 * SavedVehicleGrid — Grid hiển thị danh sách xe đã lưu
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        description="Hãy duyệt xe và lưu mẫu yêu thích!"
        actionButton={
          <Link to="/vehicles">
            <Button variant="accent">Khám Phá Xe</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((v) => (
        <div key={v.id} className="relative">
          {onRemoveSaved && (
            <button
              type="button"
              onClick={() => onRemoveSaved(v.id)}
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-md transition hover:bg-red-50"
              title="Bỏ lưu"
              aria-label="Bỏ lưu xe"
            >
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            </button>
          )}
          <VehicleCard vehicle={v} initialSaved showSaveButton={!onRemoveSaved} />
        </div>
      ))}
    </div>
  )
}
