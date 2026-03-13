import { useParams } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import { useBranch } from '@/hooks/useBranches'
import { VehicleCard } from '@/features/vehicles/components/VehicleCard'
import { useVehicles } from '@/hooks/useVehicles'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function BranchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: branch, isLoading } = useBranch(id)
  useDocumentTitle(branch ? `Chi nhánh - ${branch.name}` : 'Chi tiết chi nhánh')
  const { data } = useVehicles()
  const branchVehicles = data?.data?.filter((v) => v.branchId === id) ?? []

  if (isLoading || !branch) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div
        className="relative h-[300px] overflow-hidden rounded-xl bg-gray-900"
        style={{
          backgroundImage: `url(https://placehold.co/1200x300/1a3c6e/white?text=${encodeURIComponent(branch.name)})`,
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white">{branch.name}</h1>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Xe Tại Chi Nhánh</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {branchVehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} compact />
            ))}
          </div>
        </div>
        <div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="font-semibold">Thông Tin Liên Hệ</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-sm">{branch.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="text-sm">{branch.phone}</span>
              </div>
              {branch.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{branch.email}</span>
                </div>
              )}
              <p className="text-sm text-gray-500">
                {branch.openTime} - {branch.closeTime} | {branch.workingDays}
              </p>
            </div>
          </div>

          <div className="mt-6 h-64 overflow-hidden rounded-xl bg-gray-200">
            <iframe
              title="Branch map"
              src={`https://www.google.com/maps?q=${branch.lat},${branch.lng}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
