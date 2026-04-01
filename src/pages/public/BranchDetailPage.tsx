import { useParams, Link } from 'react-router-dom'
import { Info, Car, Users, MapPin, ArrowRight, MessageCircle, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { useBranch, useBranchTeam } from '@/hooks/useBranches'
import { useVehicles } from '@/hooks/useVehicles'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { VehicleCard } from '@/features/vehicles/components/VehicleCard'

function staffAvatarUrl(avatarUrl: string | null | undefined): string {
  const u = avatarUrl?.trim()
  if (!u) return 'https://placehold.co/96x96/1a3c6e/white?text=NV'
  if (u.startsWith('http')) return u
  return u.startsWith('/') ? u : `/${u}`
}

export function BranchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const branchIdNum = id ? parseInt(id, 10) : NaN
  const branchIdFilter = Number.isFinite(branchIdNum) ? branchIdNum : undefined

  const { data: branch, isLoading: branchLoading } = useBranch(id)
  const { data: team = [], isLoading: teamLoading } = useBranchTeam(id)
  useDocumentTitle(branch ? `Chi nhánh - ${branch.name}` : 'Chi tiết chi nhánh')

  const {
    vehicles,
    isLoading: vehiclesLoading,
    totalPages,
    currentPage,
    totalElements,
    setPage,
  } = useVehicles({
    page: 0,
    size: 12,
    sort: 'postingDateDesc',
    branchId: branchIdFilter,
  })

  if (branchLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    )
  }

  if (!branch) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Không tìm thấy chi nhánh</h1>
        <Link to="/branches" className="mt-4 inline-block font-semibold text-[#1A3C6E] hover:underline">
          ← Quay lại danh sách chi nhánh
        </Link>
      </div>
    )
  }

  const heroBg =
    branch.images?.[0] ?? `https://placehold.co/1200x400/1a3c6e/white?text=${encodeURIComponent(branch.name)}`
  const mapUrl = `https://www.google.com/maps?q=${branch.lat},${branch.lng}`
  const branchCallDigits = branch.phone.replace(/\D/g, '')
  const canCallBranch = branchCallDigits.length >= 9

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-10">
      <nav className="mb-4 flex gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-[#1A3C6E]">
          Trang chủ
        </Link>
        <span>/</span>
        <Link to="/branches" className="hover:text-[#1A3C6E]">
          Chi nhánh
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-800">{branch.name}</span>
      </nav>

      <div className="relative mb-8 min-h-[400px] overflow-hidden rounded-xl bg-slate-200">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        <div className="relative flex flex-col justify-end p-8 md:p-12">
          <span className="mb-4 inline-block rounded-full bg-[#1A3C6E] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
            Showroom
          </span>
          <h1 className="mb-2 text-4xl font-extrabold leading-tight text-white md:text-5xl">{branch.name}</h1>
          <p className="max-w-2xl text-lg text-slate-200">{branch.description ?? 'Chi nhánh BanXeOTo Đà Nẵng.'}</p>
        </div>
      </div>

      <div className="mb-12 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <Info className="h-6 w-6 text-[#1A3C6E]" />
              Thông tin chi nhánh
            </h2>
            <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Địa chỉ</p>
                <p className="font-medium text-slate-800">{branch.address}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Điện thoại</p>
                <p className="font-medium text-slate-800">{branch.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</p>
                <p className="font-medium text-slate-800">{branch.email ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Giờ mở cửa</p>
                <p className="font-medium text-slate-800">
                  {branch.workingDays}: {branch.openTime} - {branch.closeTime}
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Car className="h-6 w-6 text-[#1A3C6E]" />
                Xe tại chi nhánh
              </h2>
              <Link
                to={`/vehicles?branch=${branch.id}`}
                className="flex items-center gap-1 text-sm font-bold text-[#1A3C6E] hover:underline"
              >
                Mở bộ lọc đầy đủ <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mb-4 text-sm text-slate-500">
              {vehiclesLoading
                ? 'Đang tải danh sách xe…'
                : totalElements === 0
                  ? 'Hiện chưa có xe nào đang rao tại chi nhánh này.'
                  : `Có ${totalElements} xe đang hiển thị (theo đúng chi nhánh).`}
            </p>
            {vehiclesLoading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-80 animate-pulse rounded-xl bg-slate-200" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {vehicles.map((v, i) => (
                    <VehicleCard key={v.id} vehicle={v} showNewBadge={i < 2} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <nav className="mt-8 flex justify-center gap-1">
                    <button
                      type="button"
                      disabled={currentPage === 0}
                      onClick={() => setPage(currentPage - 1)}
                      className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
                      aria-label="Trang trước"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="flex items-center px-4 text-sm text-slate-600">
                      Trang {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setPage(currentPage + 1)}
                      className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
                      aria-label="Trang sau"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
              <Users className="h-5 w-5 text-[#1A3C6E]" />
              Đội ngũ
            </h2>
            {teamLoading ? (
              <p className="text-sm text-slate-500">Đang tải đội ngũ…</p>
            ) : team.length === 0 ? (
              <p className="text-sm text-slate-500">
                Chưa có nhân sự hiển thị công khai tại chi nhánh này. Gọi hotline chi nhánh hoặc ghé trực tiếp để được hỗ
                trợ.
              </p>
            ) : (
              <div className="space-y-5">
                {team.map((s, i) => (
                  <div key={`${s.name}-${i}`} className="flex items-center gap-4">
                    <div
                      className="h-12 w-12 shrink-0 rounded-full border-2 border-[#1A3C6E]/10 bg-cover bg-center"
                      style={{ backgroundImage: `url(${staffAvatarUrl(s.avatarUrl)})` }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.role}</p>
                    </div>
                    {canCallBranch ? (
                      <a
                        href={`tel:${branchCallDigits}`}
                        className="text-[#1A3C6E] hover:opacity-80"
                        aria-label="Gọi chi nhánh"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </a>
                    ) : (
                      <span className="text-slate-300" aria-hidden>
                        <MessageCircle className="h-5 w-5" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              className="mt-6 w-full rounded-lg border border-slate-200 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Liên hệ hỗ trợ
            </button>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <MapPin className="h-5 w-5 text-[#1A3C6E]" />
                Vị trí
              </h2>
            </div>
            <div className="relative h-64 bg-slate-200">
              <iframe
                title="Bản đồ chi nhánh"
                src={`https://www.google.com/maps?q=${branch.lat},${branch.lng}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
              />
              <div className="absolute bottom-4 right-4">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#1A3C6E] shadow-md transition-colors hover:bg-slate-50"
                >
                  Mở Google Maps <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
