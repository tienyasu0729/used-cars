import { Link } from 'react-router-dom'
import type { Vehicle } from '@/types/vehicle.types'
import { formatPrice } from '@/utils/format'
import { Heart, Share2 } from 'lucide-react'
import { useBranches } from '@/hooks/useBranches'
import { useSavedVehicles } from '@/hooks/useSavedVehicles'

const fuelLabel: Record<string, string> = {
  Gasoline: 'Máy xăng',
  Diesel: 'Máy dầu',
  Hybrid: 'Hybrid',
  Electric: 'Xe điện',
}

interface DashboardOverviewCardProps {
  vehicle: Vehicle
  showNewBadge?: boolean
}

export function DashboardOverviewCard({ vehicle, showNewBadge }: DashboardOverviewCardProps) {
  const { data: branches } = useBranches()
  const { savedVehicles } = useSavedVehicles()
  const branch = branches?.find((b) => Number(b.id) === vehicle.branch_id)
  const isSaved = savedVehicles.some((v) => v.id === vehicle.id) ?? false
  const img0 = vehicle.images?.[0]
  const cover = typeof img0 === 'string' ? img0 : img0?.url

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg"
    >
      <div className="relative h-48 overflow-hidden bg-slate-200">
        <img
          src={cover || 'https://placehold.co/400x192'}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
          onClick={(e) => e.preventDefault()}
        >
          <Share2 className="h-4 w-4 text-slate-600" />
        </button>
        {showNewBadge && (
          <span className="absolute left-3 top-3 rounded bg-[#E8612A] px-2 py-0.5 text-xs font-bold text-white">
            Mới
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-slate-900">{vehicle.title}</p>
            <p className="mt-1 text-xs text-slate-500">{branch?.name ?? 'Chi nhánh'}</p>
          </div>
          <Heart className={`h-5 w-5 shrink-0 ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-300'}`} />
        </div>
        <p className="mt-2 text-lg font-black text-[#E8612A]">{formatPrice(vehicle.price)}</p>
        <p className="mt-1 text-xs text-slate-500">
          {vehicle.year} · {fuelLabel[vehicle.fuel] ?? vehicle.fuel}
        </p>
      </div>
    </Link>
  )
}
