import { Link } from 'react-router-dom'
import { useCompareStore } from '@/store/compareStore'
import { formatPrice, formatMileage } from '@/utils/format'
import { VehicleStatusBadge } from '@/components/ui'
import { Button } from '@/components/ui'
import { useBranches } from '@/hooks/useBranches'
import { Filter, X, Plus, ArrowRight } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function ComparePage() {
  useDocumentTitle('So sánh xe')
  const { vehicles, removeVehicle } = useCompareStore()
  const { data: branches } = useBranches()

  const branchList = Array.isArray(branches) ? branches : []

  const specs = [
    { key: 'brand', label: 'Hãng xe', get: (v: (typeof vehicles)[0]) => v.brand },
    { key: 'year', label: 'Năm sản xuất', get: (v: (typeof vehicles)[0]) => String(v.year) },
    { key: 'mileage', label: 'Số Kilômét', get: (v: (typeof vehicles)[0]) => formatMileage(v.mileage) },
    { key: 'fuel', label: 'Nhiên liệu', get: (v: (typeof vehicles)[0]) => (v.fuelType === 'Gasoline' ? 'Xăng' : v.fuelType === 'Diesel' ? 'Dầu' : v.fuelType === 'Electric' ? 'Điện' : 'Hybrid') },
    { key: 'transmission', label: 'Hộp số', get: (v: (typeof vehicles)[0]) => (v.transmission === 'Automatic' ? 'Số tự động' : 'Số sàn') },
    { key: 'status', label: 'Trạng thái', get: (v: (typeof vehicles)[0]) => v.status },
    { key: 'color', label: 'Màu', get: (v: (typeof vehicles)[0]) => v.exteriorColor || '-' },
  ]

  const showAddSlot = vehicles.length < 3
  const colCount = vehicles.length + (showAddSlot ? 1 : 0)

  if (vehicles.length < 2) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">So sánh xe trực quan</h1>
        <p className="mt-4 text-slate-500">Chọn ít nhất 2 xe để so sánh</p>
        <Link to="/vehicles" className="mt-6 inline-block">
          <Button variant="primary" size="lg">
            Chọn Xe
          </Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            <Link to="/" className="hover:text-[#1A3C6E]">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-[#1A3C6E]">So sánh xe</span>
          </nav>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900">
            So sánh xe trực quan
          </h1>
          <p className="max-w-xl text-base text-slate-600">
            Phân tích chi tiết thông số kỹ thuật, trang bị và giá lăn bánh của các dòng xe đang hot nhất tại thị trường Đà Nẵng.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '18%' }} />
              {vehicles.map((_, i) => (
                <col key={i} style={{ width: `${82 / colCount}%` }} />
              ))}
              {showAddSlot && (
                <col style={{ width: `${82 / colCount}%` }} />
              )}
            </colgroup>
            <thead>
              <tr className="bg-slate-50">
                <th className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50 p-6 text-left">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Đặc tính kỹ thuật
                    </span>
                    <div className="flex items-center gap-2 text-sm text-[#1A3C6E]">
                      <Filter className="h-4 w-4" />
                      Hiện khác biệt
                    </div>
                  </div>
                </th>
                {vehicles.map((v) => (
                  <th key={v.id} className="border-r border-slate-200 p-4 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-full overflow-hidden rounded-lg bg-slate-200" style={{ aspectRatio: '16/10' }}>
                        <img
                          src={v.images[0] || 'https://placehold.co/600x400'}
                          alt={v.brand + ' ' + v.model}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <button
                          onClick={() => removeVehicle(v.id)}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-base font-bold leading-tight text-slate-900">
                          {v.brand} {v.model} {v.trim || ''}
                        </h3>
                        <p className="text-lg font-extrabold text-[#1A3C6E]">{formatPrice(v.price)}</p>
                      </div>
                      <Link to={`/vehicles/${v.id}`} className="w-full">
                        <button className="w-full rounded-lg border border-[#1A3C6E]/20 bg-[#1A3C6E]/10 py-2 text-sm font-bold text-[#1A3C6E] transition-all hover:bg-[#1A3C6E] hover:text-white">
                          Đặt Lịch Lái Thử
                        </button>
                      </Link>
                    </div>
                  </th>
                ))}
                {showAddSlot && (
                  <th className="border border-dashed border-slate-300 p-4">
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
                const values = vehicles.map((v) => spec.get(v))
                const hasDiff = new Set(values).size > 1
                const diffBg = 'bg-[#FEF9C3]'
                const baseRowBg = i % 2 === 1 ? 'bg-[#1A3C6E]/5' : 'bg-white'
                const rowBg = hasDiff ? diffBg : baseRowBg
                return (
                  <tr key={spec.key} className={rowBg}>
                    <td className={`sticky left-0 z-10 border-r border-slate-200 p-4 pl-6 text-sm font-medium text-slate-500 ${rowBg}`}>
                      {spec.label}
                    </td>
                    {vehicles.map((v) => (
                      <td
                        key={v.id}
                        className={`border-r border-slate-200 p-4 text-center font-semibold text-slate-700 ${hasDiff ? 'bg-[#FEF9C3]' : ''}`}
                      >
                        {spec.key === 'status' ? (
                          <VehicleStatusBadge status={v.status} />
                        ) : (
                          spec.get(v)
                        )}
                      </td>
                    ))}
                    {showAddSlot && (
                      <td className="border border-dashed border-slate-300 bg-slate-50/30 p-4" />
                    )}
                  </tr>
                )
              })}
              <tr className="bg-[#1A3C6E]/5">
                <td className="sticky left-0 z-10 border-r border-slate-200 bg-slate-50/80 p-4 pl-6 text-sm font-medium text-slate-500">
                  Chi nhánh
                </td>
                {vehicles.map((v) => {
                  const branch = branchList.find((b) => b.id === v.branchId)
                  return (
                    <td key={v.id} className="border-r border-slate-200 p-4 text-center font-semibold text-slate-700">
                      {branch?.name ?? '-'}
                    </td>
                  )
                })}
                {showAddSlot && (
                  <td className="border border-dashed border-slate-300 bg-slate-50/30 p-4" />
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#1A3C6E] p-6 text-white">
          <div className="space-y-2">
            <h4 className="text-xl font-bold">Cần tư vấn thêm?</h4>
            <p className="text-sm text-white/80">
              Chuyên viên của chúng tôi sẽ giúp bạn chọn chiếc xe phù hợp nhất với nhu cầu.
            </p>
          </div>
          <a href="tel:19006868" className="inline-block rounded-lg bg-white px-6 py-2 text-sm font-bold text-[#1A3C6E] hover:bg-slate-100 transition-colors">
            Gọi ngay 1900 6868
          </a>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-slate-900">Tính toán trả góp</h4>
            <p className="text-sm text-slate-500">
              Chỉ từ 6.500.000đ/tháng với lãi suất ưu đãi đặc biệt tại Đà Nẵng.
            </p>
          </div>
          <button className="flex items-center gap-1 text-sm font-bold text-[#1A3C6E]">
            Xem bảng tính
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-slate-900">Ưu đãi hôm nay</h4>
            <p className="text-sm text-slate-500">
              Giảm 50% phí trước bạ + Tặng gói phụ kiện 15 triệu đồng cho các dòng xe trên.
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
