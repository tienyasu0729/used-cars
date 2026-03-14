import type { VehicleStatus } from '@/types'

type BadgeVariant = 'available' | 'reserved' | 'sold' | 'pending' | 'confirmed' | 'default'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  available: 'bg-green-100 text-green-700 border-green-200',
  reserved: 'bg-orange-100 text-orange-700 border-orange-200',
  sold: 'bg-gray-100 text-gray-600 border-gray-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  default: 'bg-gray-100 text-gray-600 border-gray-200',
}

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const map: Record<VehicleStatus, BadgeVariant> = {
    Available: 'available',
    Reserved: 'reserved',
    Sold: 'sold',
  }
  const labels: Record<VehicleStatus, string> = {
    Available: 'Còn Hàng',
    Reserved: 'Đã Đặt Cọc',
    Sold: 'Đã Bán',
  }
  return <Badge variant={map[status]}>{labels[status]}</Badge>
}
