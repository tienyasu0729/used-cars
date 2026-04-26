/**
 * ComparePage — So sánh xe (max 3)
 *
 * Dùng useCompareVehicles hook + API /vehicles/compare
 */
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCompareVehicles } from '@/hooks/useCompareVehicles'
import { formatPrice, formatMileage } from '@/utils/format'
import { VehicleStatusBadge } from '@/components/ui'
import { Button } from '@/components/ui'
import { X, Plus, ArrowRight, ChevronRight } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import type { Vehicle } from '@/types/vehicle.types'

interface SpecDef {
  key: string
  label: string
  get: (v: Vehicle) => string | React.ReactNode
}

export function ComparePage() {
  useDocumentTitle('So sánh xe')
  const {
    compareList,
    removeFromCompare,
    clearCompare,
    fetchComparison,
    comparedData,
    isLoading,
  } = useCompareVehicles()

  const compareIdsKey = compareList.join(',')

  useEffect(() => {
    if (compareIdsKey.split(',').filter(Boolean).length < 2) return
    void fetchComparison()
  }, [compareIdsKey, fetchComparison])

  const vehicles = comparedData

  const specs: SpecDef[] = [
    { key: 'listing', label: 'Mã xe', get: (v) => v.listing_id || '—' },
    { key: 'year', label: 'Năm sản xuất', get: (v) => String(v.year) },
    { key: 'mileage', label: 'Số Kilômét', get: (v) => formatMileage(v.mileage) },
    { key: 'fuel', label: 'Nhiên liệu', get: (v) => v.fuel || '—' },
    { key: 'transmission', label: 'Hộp số', get: (v) => v.transmission || '—' },
    { key: 'status', label: 'Trạng thái', get: (v) => v.status },
  ]

  // Chưa đủ xe hoặc loading
  if (compareList.length < 2) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          <Link to="/" className="hover:text-[#1A3C6E]">Trang chủ</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-[#1A3C6E]">So sánh xe</span>
        </nav>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">So sánh xe trực quan</h1>
        <p className="mt-4 text-slate-500">
          {compareList.length === 0
            ? 'Vào trang chi tiết xe và nhấn nút So sánh để thêm xe vào đây'
            : 'Chọn thêm 1 xe nữa để bắt đầu so sánh'
          }
        </p>
        <Link to="/vehicles" className="mt-6 inline-block">
          <Button variant="primary" size="lg">Chọn Xe</Button>
        </Link>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
      </main>
    )
  }

  const showAddSlot = vehicles.length < 3
  const colCount = vehicles.length + (showAddSlot ? 1 : 0)

  // Lấy URL ảnh chính
  const getThumb = (v: Vehicle) => {
    const primary = v.images?.find((img) => img.primaryImage)
    return primary?.url ?? v.images?.[0]?.url ?? 'https://placehold.co/600x400'
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <Link to="/" className="hover:text-[#1A3C6E]">Trang chủ</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-[#1A3C6E]">So sánh xe</span>
          </nav>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900">
            So sánh xe trực quan
          </h1>
          <p className="max-w-xl text-base text-slate-600">
            Phân tích chi tiết thông số kỹ thuật của {vehicles.length} xe đang chọn.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/vehicles">
            <Button variant="primary" size="lg" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Thêm xe khác
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={clearCompare}>
            Xóa tất cả
          </Button>
        </div>
      </div>

      {/* Bảng so sánh */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '18%' }} />
              {vehicles.map((_, i) => (
                <col key={i} style={{ width: `${82 / colCount}%` }} />
              ))}
              {showAddSlot && <col style={{ width: `${82 / colCount}%` }} />}
            </colgroup>
            <thead>
              <tr className="bg-slate-50">
                <th className="sticky left-0 z-10 min-w-[240px] border-r border-slate-200 bg-slate-50 p-6 text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Đặc tính kỹ thuật
                  </span>
                </th>
                {vehicles.map((v, colIdx) => (
                  <th key={`cmp-${colIdx}-${v.id}`} className="min-w-[300px] border-r border-slate-200 p-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-full overflow-hidden rounded-lg bg-slate-200" style={{ aspectRatio: '16/10' }}>
                        <img
                          src={getThumb(v)}
                          alt={v.title}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <button
                          onClick={() => removeFromCompare(v.id)}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold leading-tight text-slate-900">
                          {v.title}
                        </h3>
                        <p className="text-xl font-extrabold text-[#1A3C6E]">{formatPrice(v.price)}</p>
                      </div>
                      <Link to={`/vehicles/${v.id}`} className="w-full">
                        <button className="w-full rounded-lg border border-[#1A3C6E]/20 bg-[#1A3C6E]/10 py-2 text-sm font-bold text-[#1A3C6E] transition-all hover:bg-[#1A3C6E] hover:text-white">
                          Xem Chi Tiết
                        </button>
                      </Link>
                    </div>
                  </th>
                ))}
                {showAddSlot && (
                  <th className="min-w-[300px] border border-dashed border-slate-300 p-4">
                    <Link
                      to="/vehicles"
                      className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 hover:border-[#1A3C6E] hover:bg-slate-50"
                    >
                      <Plus className="h-10 w-10 text-slate-400" />
                      <span className="text-sm font-bold text-slate-500">Thêm xe</span>
                    </Link>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {specs.map((spec, i) => {
                const values = vehicles.map((v) => String(spec.get(v)))
                const hasDiff = new Set(values).size > 1
                const baseRowBg = i % 2 === 1 ? 'bg-[#1A3C6E]/5' : 'bg-white'
                const rowBg = hasDiff ? 'bg-[#FEF9C3]' : baseRowBg
                return (
                  <tr key={spec.key} className={rowBg}>
                    <td className={`sticky left-0 z-10 border-r border-slate-200 p-4 pl-6 text-sm font-medium text-slate-500 ${rowBg}`}>
                      {spec.label}
                    </td>
                    {vehicles.map((v, colIdx) => (
                      <td
                        key={`cmp-${spec.key}-${colIdx}-${v.id}`}
                        className={`border-r border-slate-200 p-4 text-center font-semibold text-slate-700 ${hasDiff ? 'bg-[#FEF9C3]' : ''}`}
                      >
                        {spec.key === 'status' ? (
                          <VehicleStatusBadge status={v.status} />
                        ) : (
                          spec.get(v)
                        )}
                      </td>
                    ))}
                    {showAddSlot && <td className="border border-dashed border-slate-300 bg-slate-50/30 p-4" />}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA cards */}
      <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#1A3C6E] p-6 text-white">
          <div className="space-y-2">
            <h4 className="text-xl font-bold">Cần tư vấn thêm?</h4>
            <p className="text-sm text-white/80">
              Chuyên viên của chúng tôi sẽ giúp bạn chọn chiếc xe phù hợp nhất.
            </p>
          </div>
          <a href="tel:19006868" className="inline-block rounded-lg bg-white px-6 py-2 text-sm font-bold text-[#1A3C6E] transition-colors hover:bg-slate-100">
            Gọi ngay 1900 6868
          </a>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-slate-900">Tính toán trả góp</h4>
            <p className="text-sm text-slate-500">
              Chỉ từ 6.500.000đ/tháng với lãi suất ưu đãi đặc biệt.
            </p>
          </div>
          <button className="flex items-center gap-1 text-sm font-bold text-[#1A3C6E]">
            Xem bảng tính <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-slate-900">Ưu đãi hôm nay</h4>
            <p className="text-sm text-slate-500">
              Giảm 50% phí trước bạ + Tặng gói phụ kiện 15 triệu đồng.
            </p>
          </div>
          <span className="inline-block rounded bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-tight text-red-600">
            Còn 2 ngày
          </span>
        </div>
      </div>
    </main>
  )
}
