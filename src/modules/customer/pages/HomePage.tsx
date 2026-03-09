import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import heroBg from '@/img/z7599596914984_98d41116cae9612422b759f9bb7d76ea.jpg'
import { Button, Card, CarImage } from '@/components'
import { customerApi } from '@/api/customerApi'
import { useQuery } from '@tanstack/react-query'
import type { Car } from '@/types'
import { formatVnd } from '@/utils/formatters'

function CarCard({ car }: { car: Car }) {
  return (
    <Card className="overflow-hidden group">
      <Link to={`/cars/${car.id}`}>
        <div className="relative overflow-hidden">
          <CarImage car={car} />
          <span className="absolute top-2 right-2 bg-[#FF6600] text-white text-xs px-2 py-0.5 rounded font-medium">
            SCUDN Certified
          </span>
          <span className="absolute top-2 right-2 bg-[#FF6600] text-white text-xs px-2 py-0.5 rounded font-medium">
            SCUDN Certified
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg">{car.name} {car.model}</h3>
          <p className="text-sm text-gray-500">{car.brand ?? car.name.split(' ')[0]}</p>
          <p className="text-lg font-bold text-[#FF6600] mt-2">{formatVnd(car.price)}</p>
          <p className="text-sm text-gray-600 mt-1">{car.location ?? 'N/A'}</p>
          <Button variant="dark" size="sm" className="mt-4">
            Xem chi tiết
          </Button>
        </div>
      </Link>
    </Card>
  )
}

const RECOMMENDED_SECTION_ID = 'recommended-cars'

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [bannerIndex, setBannerIndex] = useState(0)
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [dropdownBelow, setDropdownBelow] = useState(false)
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const hoverTimeoutRef = useRef<number | undefined>(undefined)

  const { data: cars = [] } = useQuery({
    queryKey: ['cars'],
    queryFn: () => customerApi.getCars(),
  })

  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: () => customerApi.getBanners(),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['car-categories'],
    queryFn: () => customerApi.getCarCategories(),
  })

  const recommendedCars = cars.slice(0, 9)

  useLayoutEffect(() => {
    if (!showCategoryMenu || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const spaceAbove = rect.top
    const dropdownHeight = 320
    setDropdownBelow(spaceAbove < dropdownHeight)
  }, [showCategoryMenu])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowCategoryMenu(false)
      }
    }
    if (showCategoryMenu) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showCategoryMenu])

  const scrollToRecommended = () => {
    setShowCategoryMenu(false)
    document.getElementById(RECOMMENDED_SECTION_ID)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      <section
        className="relative z-10 min-h-[70vh] flex flex-col items-center justify-center text-white bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroBg})` }}
      >
        <h1 className="text-4xl font-bold mb-2">Ô TÔ CŨ ĐÀ NẴNG</h1>
        <p className="text-lg opacity-90 mb-6">Uy Tín – Chất Lượng – Giá Tốt</p>
        <div className="flex gap-4 mb-8">
          <Button variant="primary" size="lg">Call to action</Button>
          <Button variant="gray" size="lg">Another button</Button>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-3xl px-4">
          <div className="flex gap-0 bg-white rounded-lg shadow-lg overflow-visible relative" ref={menuRef}>
            <div className="relative">
              <button
                ref={buttonRef}
                type="button"
                onClick={() => setShowCategoryMenu((v) => !v)}
                className="p-2.5 text-gray-600 hover:text-gray-900 shrink-0"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              {showCategoryMenu && (
                <div
                  className={`absolute left-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 ${
                    dropdownBelow ? 'top-full mt-1' : 'bottom-full mb-1'
                  }`}
                >
                  {categories.map((brand) => (
                    <div
                      key={brand.id}
                      className="relative"
                      onMouseEnter={() => {
                        if (hoverTimeoutRef.current !== undefined) {
                          window.clearTimeout(hoverTimeoutRef.current)
                          hoverTimeoutRef.current = undefined
                        }
                        setHoveredBrand(brand.id)
                      }}
                      onMouseLeave={() => {
                        hoverTimeoutRef.current = window.setTimeout(() => setHoveredBrand(null), 150)
                      }}
                    >
                      <button
                        type="button"
                        onClick={scrollToRecommended}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {brand.name}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      {hoveredBrand === brand.id && brand.types.length > 0 && (
                        <div className="absolute left-full top-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1">
                          {brand.types.map((type) => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={scrollToRecommended}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {type.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center flex-1 pl-4 pr-3 py-2.5">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Find Car ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-0 ml-2 text-gray-900 outline-none text-sm"
              />
            </div>
            <Link to="/cars">
              <Button variant="primary" size="md" className="m-1.5 shrink-0">
                Find
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {banners.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-8">
          <div className="relative rounded-xl overflow-hidden bg-gray-200 aspect-[3/1]">
            {banners.map((b, i) => (
              <div
                key={b.id}
                className={`absolute inset-0 transition-opacity duration-300 ${
                  i === bannerIndex ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background: 'linear-gradient(135deg, #FF6600 0%, #e55c00 100%)',
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <p className="text-white text-2xl font-bold">{b.title}</p>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setBannerIndex((i) => (i - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setBannerIndex((i) => (i + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBannerIndex(i)}
                  className={`w-2 h-2 rounded-full ${i === bannerIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id={RECOMMENDED_SECTION_ID} className="max-w-6xl mx-auto px-6 py-12 scroll-mt-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Xe đề xuất</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Link to="/cars">
            <Button variant="outline" className="border-[#FF6600] text-[#FF6600] hover:bg-[#FF6600]/5">
              Xem tất cả xe
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
