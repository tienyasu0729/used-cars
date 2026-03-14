import { useParams, Link } from 'react-router-dom'
import { Info, Car, Users, MapPin, ArrowRight, MessageCircle, ExternalLink } from 'lucide-react'
import { useBranch } from '@/hooks/useBranches'
import { useVehicles } from '@/hooks/useVehicles'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { mockBranchStaff } from '@/mock/mockBranches'
import { formatPrice, formatMileage } from '@/utils/format'

export function BranchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: branch, isLoading } = useBranch(id)
  useDocumentTitle(branch ? `Chi nhánh - ${branch.name}` : 'Chi tiết chi nhánh')
  const { data } = useVehicles()
  const branchVehicles = data?.data?.filter((v) => v.branchId === id) ?? []
  const staff = id ? mockBranchStaff[id] ?? [] : []

  if (isLoading || !branch) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    )
  }

  const heroBg = branch.images?.[0] ?? `https://placehold.co/1200x400/1a3c6e/white?text=${encodeURIComponent(branch.name)}`
  const mapUrl = `https://www.google.com/maps?q=${branch.lat},${branch.lng}`

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-10">
      <div className="relative mb-8 min-h-[400px] overflow-hidden rounded-xl bg-slate-200">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        <div className="relative flex flex-col justify-end p-8 md:p-12">
          <span className="mb-4 inline-block rounded-full bg-[#1A3C6E] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
            Flagship Store
          </span>
          <h1 className="mb-2 text-4xl font-extrabold leading-tight text-white md:text-5xl">{branch.name}</h1>
          <p className="max-w-2xl text-lg text-slate-200">{branch.description ?? 'Chi nhánh uy tín của BanXeOTo.'}</p>
        </div>
      </div>

      <div className="mb-12 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <Info className="h-6 w-6 text-[#1A3C6E]" />
              Thông Tin Chi Nhánh
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
                <p className="font-medium text-slate-800">{branch.email ?? '-'}</p>
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
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Car className="h-6 w-6 text-[#1A3C6E]" />
                Xe Có Sẵn
              </h2>
              <Link
                to={`/vehicles?branch=${id}`}
                className="flex items-center gap-1 text-sm font-bold text-[#1A3C6E] hover:underline"
              >
                Xem tất cả {branchVehicles.length} xe <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {branchVehicles.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <Link to={`/vehicles/${v.id}`} className="block">
                    <div className="h-48 overflow-hidden bg-slate-200">
                      <img
                        src={v.images?.[0] || 'https://placehold.co/600x400'}
                        alt={`${v.brand} ${v.model}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="font-bold text-lg">{v.brand} {v.model} {v.year}</h3>
                        <p className="font-bold text-[#1A3C6E]">{formatPrice(v.price)}</p>
                      </div>
                      <div className="flex gap-4 text-sm text-slate-500">
                        <span>{formatMileage(v.mileage)}</span>
                        <span>{v.transmission === 'Automatic' ? 'Tự động' : 'Số sàn'}</span>
                      </div>
                      <span className="mt-3 inline-block text-sm font-bold text-[#1A3C6E] group-hover:underline">
                        Xem chi tiết
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
              <Users className="h-5 w-5 text-[#1A3C6E]" />
              Đội Ngũ Của Chúng Tôi
            </h2>
            <div className="space-y-5">
              {staff.map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 shrink-0 rounded-full border-2 border-[#1A3C6E]/10 bg-cover bg-center"
                    style={{ backgroundImage: `url(${s.avatar})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.role}</p>
                  </div>
                  <button className="text-[#1A3C6E] hover:opacity-80">
                    <MessageCircle className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full rounded-lg border border-slate-200 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50">
              Liên Hệ Hỗ Trợ
            </button>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <MapPin className="h-5 w-5 text-[#1A3C6E]" />
                Vị Trí
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
