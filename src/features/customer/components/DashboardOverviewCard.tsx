import { Link } from 'react-router-dom'
import type { Vehicle } from '@/types'
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
  const { data: saved } = useSavedVehicles()
  const branch = branches?.find((b) => b.id === vehicle.branchId)
  const isSaved = saved?.some((v) => v.id === vehicle.id) ?? false

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg"
    >
      <div className="relative h-48 overflow-hidden bg-slate-200">
        <img
          src={vehicle.images?.[0] || 'https://placehold.co/400x192'}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>
        {showNewBadge && (
          <span className="absolute bottom-3 left-3 rounded bg-[#1A3C6E] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Mới về
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900">{vehicle.brand} {vehicle.model} {vehicle.trim || ''}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {branch?.name ?? 'Đà Nẵng'} • {vehicle.year} • {fuelLabel[vehicle.fuelType] ?? vehicle.fuelType}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold text-[#1A3C6E]">{formatPrice(vehicle.price).replace(' VNĐ', ' ₫')}</p>
          <button className="text-slate-400 transition-colors hover:text-[#1A3C6E]" onClick={(e) => e.preventDefault()}>
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Link>
  )
}
