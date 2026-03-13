import { useState } from 'react'
import { Link } from 'react-router-dom'
import { VehicleCard } from '@/features/vehicles/components/VehicleCard'
import { FilterPanel } from '@/features/vehicles/components/FilterPanel'
import { useVehicles } from '@/hooks/useVehicles'
import { SkeletonCard, EmptyState, Button } from '@/components/ui'
import { Car, LayoutGrid, List, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function VehicleListingPage() {
  useDocumentTitle('Danh sách xe')
  const { data, isLoading } = useVehicles()
  const [sort, setSort] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterOpen, setFilterOpen] = useState(false)
  const vehicles = data?.data ?? []

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {filterOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setFilterOpen(false)}
          aria-hidden
        />
      )}
      <div
        className="fixed left-0 top-0 z-50 h-full w-72 transform overflow-y-auto bg-white shadow-xl transition-transform duration-300 lg:hidden"
        style={{ transform: filterOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <div className="p-4 pt-16">
          <FilterPanel inline />
        </div>
      </div>

      <div className="mb-8">
        <nav className="mb-4 flex gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-[#1A3C6E]">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-900">Danh sách xe</span>
        </nav>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Xe ô tô tại Đà Nẵng</h1>
            <p className="mt-1 text-slate-500">{vehicles.length} xe tìm thấy phù hợp với tiêu chí của bạn</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="lg:hidden" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Bộ lọc
            </Button>
            <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center rounded p-2 ${
                  viewMode === 'grid' ? 'bg-[#1A3C6E] text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center rounded p-2 ${
                  viewMode === 'list' ? 'bg-[#1A3C6E] text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="year-desc">Năm sản xuất: Mới - Cũ</option>
              </select>
              <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterPanel />
        <section className="flex-1">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <EmptyState
              icon={Car}
              title="Không tìm thấy xe phù hợp"
              description="Thử thay đổi bộ lọc hoặc xem tất cả xe"
              actionLabel="Xem tất cả xe"
              onAction={() => {}}
            />
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              }`}
            >
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} compact={viewMode === 'list'} showNewBadge />
              ))}
            </div>
          )}

          <nav className="mt-12 flex justify-center">
            <div className="flex items-center gap-1">
              <button
                disabled
                className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A3C6E] font-bold text-white">
                1
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
                2
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
                3
              </button>
              <span className="px-2 text-slate-400">...</span>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
                10
              </button>
              <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </section>
      </div>
    </main>
  )
}
