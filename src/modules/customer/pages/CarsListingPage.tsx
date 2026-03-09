import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Grid3X3, List, Search } from 'lucide-react'
import { Card, PaginationBar, CarImage } from '@/components'
import { customerApi } from '@/api/customerApi'
import { useQuery } from '@tanstack/react-query'
import { formatVnd } from '@/utils/formatters'
import { usePagination } from '@/hooks/usePagination'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
] as const

export function CarsListingPage() {
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [year, setYear] = useState('')
  const [transmission, setTransmission] = useState('')
  const [odoMax, setOdoMax] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]['value']>('newest')

  const { data: cars = [] } = useQuery({
    queryKey: ['cars', brand, priceMin, priceMax],
    queryFn: () =>
      customerApi.getCars({
        brand: brand || undefined,
        minPrice: priceMin ? Number(priceMin) : undefined,
        maxPrice: priceMax ? Number(priceMax) : undefined,
      }),
  })

  const filtered = useMemo(
    () =>
      cars
        .filter((c) => !model || c.name.toLowerCase().includes(model.toLowerCase()))
        .filter((c) => !year || c.year === Number(year))
        .filter((c) => !transmission || c.transmission === transmission)
        .filter((c) => !odoMax || c.odo <= Number(odoMax)),
    [cars, model, year, transmission, odoMax]
  )

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price
        if (sort === 'price-desc') return b.price - a.price
        return 0
      }),
    [filtered, sort]
  )

  const { page, setPage, paginated, totalPages, pageNumbers, rangeText } = usePagination({
    items: sorted,
    pageSize: 12,
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Danh sách xe</h1>

      <div className="flex gap-6">
        <aside className="w-64 shrink-0">
          <Card className="p-4 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Bộ lọc</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Hãng xe</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="VinFast">VinFast</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Kia">Kia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Dòng xe</label>
                <input
                  type="text"
                  placeholder="Model..."
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Khoảng giá (triệu)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Năm sản xuất</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Hộp số</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="automatic">Tự động</option>
                  <option value="manual">Số sàn</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Số km tối đa</label>
                <input
                  type="number"
                  placeholder="VD: 50000"
                  value={odoMax}
                  onChange={(e) => setOdoMax(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </Card>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#FF6600] text-white' : 'bg-gray-100'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#FF6600] text-white' : 'bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as (typeof SORT_OPTIONS)[number]['value'])}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div
            className={
              viewMode === 'grid'
                ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {paginated.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Không tìm thấy xe phù hợp</p>
                <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc để xem thêm kết quả</p>
              </div>
            ) : (
              paginated.map((car) => (
              <Link key={car.id} to={`/cars/${car.id}`}>
                <Card
                  className={`overflow-hidden hover:shadow-lg transition-shadow ${
                    viewMode === 'list' ? 'flex flex-row' : ''
                  }`}
                >
                  <div
                    className={viewMode === 'list' ? 'w-48 shrink-0' : ''}
                  >
                    <CarImage car={car} aspectRatio={viewMode === 'list' ? 'video' : '4/3'} />
                  </div>
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <span className="inline-block bg-[#FF6600] text-white text-xs px-2 py-0.5 rounded mb-2">
                      SCUDN Certified
                    </span>
                    <h3 className="font-semibold text-gray-900">{car.name} {car.model}</h3>
                    <p className="text-lg font-bold text-[#FF6600] mt-1">{formatVnd(car.price)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {car.odo.toLocaleString()} km • {car.year} • {car.transmission === 'automatic' ? 'Tự động' : 'Số sàn'}
                    </p>
                  </div>
                </Card>
              </Link>
            ))
            )}
          </div>
          {totalPages > 1 && (
            <PaginationBar
              rangeText={rangeText}
              page={page}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              onPageChange={setPage}
              align="right"
            />
          )}
        </div>
      </div>
    </div>
  )
}
