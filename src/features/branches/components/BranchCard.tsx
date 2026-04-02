import { Link } from 'react-router-dom'
import { MapPin, Phone } from 'lucide-react'
import type { Branch } from '@/types'
import { Button } from '@/components/ui'

interface BranchCardProps {
  branch: Branch
}

export function BranchCard({ branch }: BranchCardProps) {
  const coverSrc =
    branch.images?.[0] ??
    `https://placehold.co/400x225/1a3c6e/white?text=${encodeURIComponent(branch.name)}`
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-video bg-gray-100">
        <img src={coverSrc} alt={branch.name} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{branch.name}</h3>
        <div className="mt-2 space-y-1 text-sm text-gray-500">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            {branch.address}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            {branch.phone}
          </div>
        </div>
        {branch.hoursSummaryLine && (
          <p className="mt-2 text-xs text-gray-500">{branch.hoursSummaryLine}</p>
        )}
        {branch.vehicleCount !== undefined && (
          <span className="mt-2 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            {branch.vehicleCount} xe
          </span>
        )}
        <Link to={`/branches/${branch.id}`} className="mt-4 block">
          <Button variant="outline" size="sm" className="w-full">
            Xem Chi Tiết
          </Button>
        </Link>
      </div>
    </div>
  )
}
