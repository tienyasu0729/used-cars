import { BranchCard } from '@/features/branches/components/BranchCard'
import { useBranches } from '@/hooks/useBranches'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function BranchListingPage() {
  useDocumentTitle('Các chi nhánh')
  const { data: branches, isLoading } = useBranches()

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Các Chi Nhánh SCUDN</h1>
        <p className="mt-2 text-gray-500">Khám phá các showroom của chúng tôi tại Đà Nẵng</p>
      </div>

      <div className="mb-8 h-[350px] overflow-hidden rounded-xl bg-gray-200">
        <iframe
          title="Branches map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.9242408000003!2d108.2022!3d16.0544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDAzJzE1LjgiTiAxMDjCsDEyJzA3LjkiRQ!5e0!3m2!1svi!2s!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200" />
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
