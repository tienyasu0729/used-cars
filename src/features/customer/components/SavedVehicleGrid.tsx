import type { Vehicle } from '@/types'
import { SavedVehicleCard } from './SavedVehicleCard'
import { EmptyState } from '@/components/ui'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useBranches } from '@/hooks/useBranches'
import { mockSavedListingExtras } from '@/mock/mockSavedListingExtras'

interface SavedVehicleGridProps {
  vehicles: Vehicle[]
  isLoading?: boolean
}

export function SavedVehicleGrid({ vehicles, isLoading }: SavedVehicleGridProps) {
  const { data: branches } = useBranches()

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
      {vehicles.map((v) => {
        const branch = branches?.find((b) => b.id === v.branchId)
        const listingStatus = mockSavedListingExtras[v.id]?.listingStatus
        return (
          <SavedVehicleCard
            key={v.id}
            vehicle={v}
            branch={branch}
            listingStatus={listingStatus}
          />
        )
      })}
    </div>
  )
}
