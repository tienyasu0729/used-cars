import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useVehicle } from '@/hooks/useVehicles'
import { useBranch } from '@/hooks/useBranches'
import { useVehicles } from '@/hooks/useVehicles'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { VehicleDetailGallery } from '@/features/vehicles/components/VehicleDetailGallery'
import { VehicleDetailSidebar } from '@/features/vehicles/components/VehicleDetailSidebar'
import { SimilarVehicleCard } from '@/features/vehicles/components/SimilarVehicleCard'
import { BookTestDriveModal } from '@/features/vehicles/components/BookTestDriveModal'
import { DepositWizardModal } from '@/features/vehicles/components/DepositWizardModal'

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: vehicle, isLoading } = useVehicle(id)
  useDocumentTitle(vehicle ? `Chi tiết xe - ${vehicle.brand} ${vehicle.model}` : 'Chi tiết xe')
  const { data: branch } = useBranch(vehicle?.branchId)
  const { data } = useVehicles()
  const allVehicles = data?.data ?? []
  const sameBrand = allVehicles.filter((v) => v.brand === vehicle?.brand && v.id !== vehicle?.id)
  const others = allVehicles.filter((v) => v.brand !== vehicle?.brand && v.branchId === vehicle?.branchId)
  const similarVehicles = [...sameBrand, ...others].filter((v) => v.id !== vehicle?.id).slice(0, 4)
  const [activeTab, setActiveTab] = useState('specs')
  const [bookingOpen, setBookingOpen] = useState(false)
  const [depositOpen, setDepositOpen] = useState(false)

  if (isLoading || !vehicle) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
      </div>
    )
  }

  const similarContent = (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {similarVehicles.map((v, i) => (
        <SimilarVehicleCard key={v.id} vehicle={v} showNewBadge={i === 0} />
      ))}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-12">
        <VehicleDetailGallery
          vehicle={vehicle}
          branch={branch ?? null}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          similarContent={similarContent}
        />
        <VehicleDetailSidebar
          vehicle={vehicle}
          branch={branch ?? null}
          onBookTestDrive={() => setBookingOpen(true)}
          onDeposit={() => setDepositOpen(true)}
        />
      </div>

      <section className="mt-16">
        <h2 className="mb-8 text-2xl font-black">Xe Tương Tự</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {similarVehicles.map((v, i) => (
            <SimilarVehicleCard key={v.id} vehicle={v} showNewBadge={i === 0} />
          ))}
        </div>
      </section>

      {branch && (
        <>
          <BookTestDriveModal
            isOpen={bookingOpen}
            onClose={() => setBookingOpen(false)}
            vehicleId={vehicle.id}
            branchId={branch.id}
            vehicleName={`${vehicle.brand} ${vehicle.model}`}
          />
          <DepositWizardModal
            isOpen={depositOpen}
            onClose={() => setDepositOpen(false)}
            vehicleId={vehicle.id}
            vehicleName={`${vehicle.brand} ${vehicle.model}`}
            vehiclePrice={vehicle.price}
          />
        </>
      )}
    </div>
  )
}
