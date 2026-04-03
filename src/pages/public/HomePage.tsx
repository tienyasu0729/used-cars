import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Car, Handshake, Calendar, Shield, FileText, Building2, Wrench, Search, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { VehicleCard } from '@/features/vehicles/components/VehicleCard'
import { BranchCard } from '@/features/branches/components/BranchCard'
import { useVehicles } from '@/hooks/useVehicles'
import { useBranches } from '@/hooks/useBranches'
import { RecentlyViewedWidget } from '@/components/vehicles/RecentlyViewedWidget'
import { Button } from '@/components/ui'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { fetchPublicHomeBanners } from '@/services/homeBanners.service'

const DEFAULT_HERO_BG = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920'

const PRICE_OPTIONS = [
  { label: 'Khoảng giá', minPrice: '', maxPrice: '' },
  { label: 'Dưới 500tr', minPrice: '', maxPrice: '500000000' },
  { label: '500tr - 1 tỷ', minPrice: '500000000', maxPrice: '1000000000' },
  { label: 'Trên 1 tỷ', minPrice: '1000000000', maxPrice: '' },
]

export function HomePage() {
  useDocumentTitle('Chợ xe ô tô Đà Nẵng')
  const navigate = useNavigate()
  const [heroKeyword, setHeroKeyword] = useState('')
  const [heroPriceIdx, setHeroPriceIdx] = useState(0)

  const handleHeroSearch = () => {
    const params = new URLSearchParams()
    const q = heroKeyword.trim()
    if (q) params.set('q', q)
    const opt = PRICE_OPTIONS[heroPriceIdx]
    if (opt.minPrice) params.set('minPrice', opt.minPrice)
    if (opt.maxPrice) params.set('maxPrice', opt.maxPrice)
    const qs = params.toString()
    navigate(qs ? `/vehicles?${qs}` : '/vehicles')
  }

  const { vehicles: featuredVehicles, isLoading: featuredLoading } = useVehicles({
    page: 0,
    size: 9,
    sort: 'postingDateDesc',
  })
  const { data: branches, isLoading: branchesLoading } = useBranches()
  const branchesList = Array.isArray(branches) ? branches : []

  const { data: heroBanners = [] } = useQuery({
    queryKey: ['public-home-banners'],
    queryFn: fetchPublicHomeBanners,
    staleTime: 60_000,
  })

  const heroSlides = useMemo(() => {
    if (!heroBanners.length) return [DEFAULT_HERO_BG]
    return heroBanners.map((b) => b.imageUrl)
  }, [heroBanners])

  const [heroIndex, setHeroIndex] = useState(0)
  useEffect(() => {
    setHeroIndex(0)
  }, [heroSlides.join('\0')])

  useEffect(() => {
    if (heroSlides.length < 2) return undefined
    const t = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroSlides.length)
    }, 6000)
    return () => window.clearInterval(t)
  }, [heroSlides.length])

  const features = [
    { icon: Shield, title: 'Kiểm định 160 bước', desc: 'Mọi xe đều được kiểm tra kỹ thuật nghiêm ngặt bởi đội ngũ kỹ thuật viên giàu kinh nghiệm.' },
    { icon: FileText, title: 'Lịch sử minh bạch', desc: 'Cam kết không xe đâm đụng, không ngập nước, hồ sơ pháp lý rõ ràng từng chiếc xe.' },
    { icon: Building2, title: 'Hỗ trợ trả góp', desc: 'Liên kết với nhiều ngân hàng lớn, hỗ trợ vay lên đến 70% giá trị xe với lãi suất ưu đãi.' },
    { icon: Wrench, title: 'Bảo hành 12 tháng', desc: 'An tâm vận hành với gói bảo hành động cơ và hộp số dài hạn cho mọi dòng xe.' },
  ]

  const testimonials = [
    { name: 'Anh Nguyễn Văn A', role: 'Khách hàng', quote: 'Dịch vụ rất chuyên nghiệp, xe chất lượng đúng như mô tả.' },
    { name: 'Chị Trần Thị B', role: 'Khách hàng', quote: 'Đội ngũ tư vấn nhiệt tình, giao dịch nhanh chóng.' },
    { name: 'Anh Lê Văn C', role: 'Khách hàng', quote: 'Mua xe ở đây rất yên tâm, có bảo hành rõ ràng.' },
  ]

  return (
    <div>
      <section className="relative flex h-[500px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#1A3C6E]/90 to-[#1A3C6E]/50" />
        {heroSlides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
              i === heroIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden={i !== heroIndex}
          />
        ))}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Banner ${i + 1}`}
                aria-current={i === heroIndex}
                onClick={() => setHeroIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === heroIndex ? 'w-7 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
        <div className="relative z-20 mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            Tìm xe ô tô phù hợp nhất tại Đà Nẵng
          </h1>
          <p className="mb-10 mx-auto max-w-2xl text-lg text-white/90">
            Hệ thống mua bán xe uy tín hàng đầu khu vực miền Trung với hơn 10 năm kinh nghiệm.
          </p>
          <form
            className="mx-auto flex max-w-3xl flex-col gap-2 rounded-xl bg-white p-2 shadow-2xl md:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              handleHeroSearch()
            }}
          >
            <div className="flex flex-1 items-center border-b border-slate-200 px-4 py-3 md:border-b-0 md:border-r">
              <Search className="mr-2 h-5 w-5 shrink-0 text-slate-400" />
              <input
                type="text"
                value={heroKeyword}
                onChange={(e) => setHeroKeyword(e.target.value)}
                placeholder="Hãng xe, từ khóa..."
                className="w-full border-none bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
              />
            </div>
            <div className="flex flex-1 items-center border-b border-slate-200 px-4 py-3 md:border-b-0 md:border-r">
              <select
                value={heroPriceIdx}
                onChange={(e) => setHeroPriceIdx(Number(e.target.value))}
                className="w-full appearance-none border-none bg-transparent p-0 text-sm focus:outline-none focus:ring-0 outline-none"
              >
                {PRICE_OPTIONS.map((opt, i) => (
                  <option key={i} value={i}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[#1A3C6E] px-8 py-3 text-sm font-bold text-white transition-all hover:bg-[#1A3C6E]/90"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      <section className="relative z-30 mx-auto max-w-7xl px-4 -mt-12 lg:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-center gap-6 rounded-xl border border-slate-100 bg-white p-8 shadow-lg">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-[#1A3C6E]">
              <Car className="h-8 w-8" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#1A3C6E]">500+</p>
              <p className="font-medium text-slate-500">Xe đang bán</p>
            </div>
          </div>
          <div className="flex items-center gap-6 rounded-xl border border-slate-100 bg-white p-8 shadow-lg">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-[#1A3C6E]">
              <Handshake className="h-8 w-8" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#1A3C6E]">
                {branchesLoading ? '…' : branchesList.length}
              </p>
              <p className="font-medium text-slate-500">Chi nhánh</p>
            </div>
          </div>
          <div className="flex items-center gap-6 rounded-xl border border-slate-100 bg-white p-8 shadow-lg">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-[#1A3C6E]">
              <Calendar className="h-8 w-8" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#1A3C6E]">10 Năm</p>
              <p className="font-medium text-slate-500">Kinh nghiệm</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-gray-800">Xe Nổi Bật</h2>
            <p className="text-slate-500">
              Những mẫu xe hot nhất đang có mặt tại cửa hàng
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition-all hover:bg-[#1A3C6E] hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 transition-all hover:bg-[#1A3C6E] hover:text-white">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        {featuredLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredVehicles.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} showNewBadge={i < 3} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link to="/vehicles">
            <Button variant="outline">Xem tất cả xe →</Button>
          </Link>
        </div>
        <div className="mt-12">
          <RecentlyViewedWidget maxItems={6} />
        </div>
      </section>

      <section className="bg-slate-100 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800">Tại sao chọn chúng tôi?</h2>
            <p className="mx-auto max-w-2xl text-slate-500">
              Chúng tôi cam kết mang lại trải nghiệm mua sắm ô tô minh bạch, an toàn và chuyên nghiệp nhất cho khách hàng.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((item) => (
              <div key={item.title} className="group rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-transform hover:-translate-y-2">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1A3C6E]/10 text-[#1A3C6E] transition-all group-hover:bg-[#1A3C6E] group-hover:text-white">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-gray-800">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-6 text-3xl font-bold text-gray-800">Hệ thống chi nhánh</h2>
            <p className="mb-8 leading-relaxed text-slate-600">
              {branchesLoading
                ? 'Đang tải danh sách chi nhánh…'
                : branchesList.length > 0
                  ? `Chúng tôi hiện có ${branchesList.length} điểm giao dịch, giúp khách hàng dễ dàng tiếp cận và trải nghiệm thực tế những mẫu xe mong muốn.`
                  : 'Hiện chưa có chi nhánh được công bố. Vui lòng quay lại sau hoặc liên hệ hotline để được hỗ trợ.'}
            </p>
            {branchesLoading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-200" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {branchesList.map((b) => (
                  <BranchCard key={b.id} branch={b} />
                ))}
              </div>
            )}
            {!branchesLoading && branchesList.length > 0 && (
              <Link
                to="/branches"
                className="mt-6 inline-flex text-sm font-bold text-[#1A3C6E] hover:underline"
              >
                Xem tất cả chi nhánh →
              </Link>
            )}
          </div>
          <div className="relative h-[450px] overflow-hidden rounded-2xl shadow-2xl">
            <iframe
              title="Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.9242408000003!2d108.2022!3d16.0544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDAzJzE1LjgiTiAxMDjCsDEyJzA3LjkiRQ!5e0!3m2!1svi!2s!4v1234567890"
              width="100%"
              height="100%"
              className="h-full w-full object-cover"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-[#1A3C6E]/10" />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-16 text-center text-3xl font-bold text-gray-800">Khách hàng nói gì về chúng tôi</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="relative rounded-2xl bg-slate-50 p-8">
                <Quote className="absolute right-4 top-4 h-12 w-12 text-[#1A3C6E]/20" />
                <div className="mb-4 flex gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="mb-6 italic text-slate-600">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200" />
                  <div>
                    <p className="font-bold text-gray-800">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#1A3C6E] p-8 text-center text-white md:p-16">
          <div className="absolute -left-1/2 -top-1/2 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-1/3 -right-1/3 h-96 w-96 rounded-full bg-white/5" />
          <h2 className="relative z-10 mb-6 text-3xl font-extrabold md:text-4xl">Bạn đang muốn bán hoặc đổi xe?</h2>
          <p className="relative z-10 mx-auto mb-10 max-w-xl text-lg text-white/80">
            Liên hệ ngay với chúng tôi để được định giá xe miễn phí và hỗ trợ thu mua tận nơi với giá tốt nhất thị trường.
          </p>
          <div className="relative z-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/contact">
              <button className="rounded-xl bg-white px-10 py-4 text-lg font-bold text-[#1A3C6E] transition-all hover:bg-slate-100">
                Định giá xe ngay
              </button>
            </Link>
            <Link to="/contact">
              <button className="rounded-xl border-2 border-white/30 bg-transparent px-10 py-4 text-lg font-bold text-white transition-all hover:bg-white/10">
                Liên hệ tư vấn
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
