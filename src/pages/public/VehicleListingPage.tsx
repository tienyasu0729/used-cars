/**
 * VehicleListingPage — Trang danh sách xe public
 *
 * Dùng useVehicles hook (API-backed) với filter + pagination thật
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { VehicleCard } from '@/features/vehicles/components/VehicleCard'
import { FilterPanel } from '@/features/vehicles/components/FilterPanel'
import { useVehicles } from '@/hooks/useVehicles'
import { useVehicleListingFacets } from '@/hooks/useVehicleListingFacets'
import { SkeletonCard, EmptyState, Button } from '@/components/ui'
import { Car, LayoutGrid, List, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { VehicleSearchParams } from '@/types/vehicle.types'

export function VehicleListingPage() {
  useDocumentTitle('Danh sách xe')
  const { vehicles, totalPages, currentPage, totalElements, isLoading, error, setFilters, setPage } = useVehicles()
  const listingFacets = useVehicleListingFacets()
  const [sort, setSort] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterOpen, setFilterOpen] = useState(false)

  // Callback từ FilterPanel khi user bấm "Tìm kiếm"
  const handleFilterChange = (params: VehicleSearchParams) => {
    setFilters(params)
    setFilterOpen(false) // Đóng sidebar filter trên mobile
  }

  // Sắp xếp client-side (backend chưa hỗ trợ sort)
  // TODO: chuyển sang server-side sort khi backend support
  const sortedVehicles = [...vehicles].sort((a, b) => {
    switch (sort) {
      case 'price-asc': return a.price - b.price
      case 'price-desc': return b.price - a.price
      case 'year-desc': return b.year - a.year
      default: return 0 // newest = thứ tự API trả về
    }
  })

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Mobile filter overlay */}
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
          <FilterPanel inline facets={listingFacets} onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <nav className="mb-4 flex gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-[#1A3C6E]">Trang chủ</Link>
          <span>/</span>
          <span className="font-medium text-slate-900">Danh sách xe</span>
        </nav>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Xe ô tô tại Đà Nẵng</h1>
            <p className="mt-1 text-slate-500">{totalElements} xe tìm thấy phù hợp với tiêu chí của bạn</p>
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

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterPanel facets={listingFacets} onFilterChange={handleFilterChange} />
        <section className="flex-1">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : sortedVehicles.length === 0 ? (
            <EmptyState
              icon={Car}
              title="Không tìm thấy xe phù hợp"
              description="Thử thay đổi bộ lọc hoặc xem tất cả xe"
              actionLabel="Xem tất cả xe"
              onAction={() => setFilters({ page: 0, size: 20 })}
            />
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              }`}
            >
              {sortedVehicles.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} compact={viewMode === 'list'} showNewBadge={i < 3} />
              ))}
            </div>
          )}

          {/* Pagination thật */}
          {totalPages > 1 && (
            <nav className="mt-12 flex justify-center">
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setPage(currentPage - 1)}
                  className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  // Hiện tối đa 7 nút trang
                  let pageNum: number
                  if (totalPages <= 7) {
                    pageNum = i
                  } else if (currentPage < 4) {
                    pageNum = i
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 7 + i
                  } else {
                    pageNum = currentPage - 3 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold ${
                        pageNum === currentPage
                          ? 'bg-[#1A3C6E] text-white'
                          : 'border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  )
                })}

                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setPage(currentPage + 1)}
                  className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </nav>
          )}

          {/* Page info */}
          {totalPages > 0 && (
            <p className="mt-4 text-center text-sm text-slate-500">
              Trang {currentPage + 1} / {totalPages} — Tổng {totalElements} xe
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
