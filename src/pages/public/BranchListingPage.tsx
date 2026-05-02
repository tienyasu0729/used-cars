import { BranchMap } from '@/components/map/BranchMap'
import { BranchCard } from '@/features/branches/components/BranchCard'
import { useBranches } from '@/hooks/useBranches'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function BranchListingPage() {
  useDocumentTitle('Các chi nhánh')

  const { data: branches, isLoading } = useBranches()
  const mapBranches = (branches ?? [])
    .filter((branch) => typeof branch.lat === 'number' && typeof branch.lng === 'number')
    .map((branch) => ({
      id: branch.id,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      lat: branch.lat,
      lng: branch.lng,
    }))

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Các Chi Nhánh SCUDN</h1>
        <p className="mt-2 text-gray-500">Khám phá các showroom của chúng tôi tại Đà Nẵng</p>
      </div>

      <div className="mb-8 h-[350px] overflow-hidden rounded-xl bg-gray-200">
        {isLoading ? (
          <div className="h-full w-full animate-pulse bg-gray-200" />
        ) : (
          <BranchMap branches={mapBranches} />
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-64 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {branches?.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      )}
    </div>
  )
}
