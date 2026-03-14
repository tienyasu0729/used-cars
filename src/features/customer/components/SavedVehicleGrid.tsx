import { VehicleCard } from '@/features/vehicles/components/VehicleCard'
import type { Vehicle } from '@/types'
import { EmptyState } from '@/components/ui'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

interface SavedVehicleGridProps {
  vehicles: Vehicle[]
  isLoading?: boolean
}

export function SavedVehicleGrid({ vehicles, isLoading }: SavedVehicleGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((v) => (
        <VehicleCard key={v.id} vehicle={v} />
      ))}
    </div>
  )
}
