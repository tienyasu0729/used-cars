import { Car, DollarSign, Calendar, Gauge, Fuel, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui'

const BRANDS = ['Toyota', 'Hyundai', 'Kia', 'Mazda', 'Ford', 'Honda', 'VinFast']
const PRICE_RANGES = [
  { id: 'p1', label: 'Dưới 500 triệu' },
  { id: 'p2', label: '500 - 800 triệu' },
  { id: 'p3', label: '800 triệu - 1.2 tỷ' },
  { id: 'p4', label: 'Trên 1.2 tỷ' },
]
const MILEAGE_OPTIONS = [
  'Bất kỳ',
  'Dưới 10,000 km',
  '10,000 - 30,000 km',
  '30,000 - 50,000 km',
  'Trên 50,000 km',
]

interface FilterPanelProps {
  inline?: boolean
}

export function FilterPanel({ inline }: FilterPanelProps) {
  return (
    <aside className={`w-full shrink-0 ${inline ? '' : 'lg:w-72'}`}>
      <div className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${inline ? '' : 'sticky top-24'}`}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold">Bộ lọc tìm kiếm</h3>
          <button className="text-xs font-semibold text-[#1A3C6E] hover:underline">Xóa tất cả</button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Car className="h-5 w-5 text-[#1A3C6E]" />
              Hãng xe
            </label>
            <select className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-4 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20">
              <option>Tất cả hãng xe</option>
              {BRANDS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <DollarSign className="h-5 w-5 text-[#1A3C6E]" />
              Khoảng giá
            </label>
            <div className="space-y-2">
              {PRICE_RANGES.map(({ id, label }) => (
                <label key={id} className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" className="rounded text-[#1A3C6E] focus:ring-[#1A3C6E]" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-5 w-5 text-[#1A3C6E]" />
              Năm sản xuất
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Từ"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              />
              <input
                type="number"
                placeholder="Đến"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Gauge className="h-5 w-5 text-[#1A3C6E]" />
              Số Km đã đi
            </label>
            <select className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-4 text-sm focus:border-[#1A3C6E] focus:ring-[#1A3C6E]/20">
              {MILEAGE_OPTIONS.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Fuel className="h-5 w-5 text-[#1A3C6E]" />
              Nhiên liệu
            </label>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-full border border-[#1A3C6E] bg-[#1A3C6E] px-3 py-1.5 text-xs font-medium text-white">
                Xăng
              </button>
              <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium hover:border-[#1A3C6E]">
                Dầu
              </button>
              <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium hover:border-[#1A3C6E]">
                Điện/Hybrid
              </button>
            </div>
          </div>
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="h-5 w-5 text-[#1A3C6E]" />
              Hộp số
            </label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="radio" name="gear" className="text-[#1A3C6E] focus:ring-[#1A3C6E]" />
                <span className="text-sm">Số tự động (AT)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="radio" name="gear" className="text-[#1A3C6E] focus:ring-[#1A3C6E]" />
                <span className="text-sm">Số sàn (MT)</span>
              </label>
            </div>
          </div>
        </div>
        <Button variant="primary" className="mt-8 w-full py-3 font-bold">
          Áp dụng bộ lọc
        </Button>
      </div>
    </aside>
  )
}
