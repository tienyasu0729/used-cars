import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Vehicle } from '@/types'
import type { Branch } from '@/types'

interface VehicleDetailGalleryProps {
  vehicle: Vehicle
  branch: Branch | null
  activeTab: string
  onTabChange: (tab: string) => void
  similarContent: React.ReactNode
}

const fuelLabel = (t: string) => (t === 'Gasoline' ? 'Xăng' : t === 'Diesel' ? 'Dầu' : t === 'Electric' ? 'Điện' : 'Hybrid')
const transLabel = (t: string) => (t === 'Automatic' ? 'Tự động' : 'Sàn')

export function VehicleDetailGallery({
  vehicle,
  branch,
  activeTab,
  onTabChange,
  similarContent,
}: VehicleDetailGalleryProps) {
  const [selectedImg, setSelectedImg] = useState(0)
  const imgs = vehicle.images?.length ? vehicle.images : ['https://placehold.co/800x500']
  const extraCount = imgs.length > 5 ? imgs.length - 5 : 0

  const tabs = [
    { id: 'specs', label: 'Thông Số Kỹ Thuật' },
    { id: 'desc', label: 'Mô Tả' },
    { id: 'location', label: 'Vị Trí' },
    { id: 'similar', label: 'Xe Tương Tự' },
  ]

  const specs = [
    { label: 'Kiểu dáng', value: 'Sedan' },
    { label: 'Nhiên liệu', value: fuelLabel(vehicle.fuelType) },
    { label: 'Hộp số', value: transLabel(vehicle.transmission) },
    { label: 'Dẫn động', value: 'FWD - Dẫn động cầu trước' },
    { label: 'Số chỗ ngồi', value: '5 chỗ' },
    { label: 'Màu xe', value: vehicle.exteriorColor || '-' },
  ]

  return (
    <div className="flex flex-col gap-4 lg:col-span-8">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Link to="/" className="hover:text-[#1A3C6E]">Trang chủ</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/vehicles" className="hover:text-[#1A3C6E]">Xe cũ</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-[#1A3C6E]">{vehicle.brand} {vehicle.model} {vehicle.trim || ''} {vehicle.year}</span>
      </nav>

      <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-200">
        <img
          src={imgs[selectedImg] || imgs[0]}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
        {imgs.slice(0, 5).map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedImg(i)}
            className={`h-24 w-32 shrink-0 overflow-hidden rounded-lg transition-opacity hover:opacity-80 ${
              selectedImg === i ? 'ring-2 ring-[#1A3C6E] ring-offset-2' : ''
            }`}
          >
            <img src={img} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
        {extraCount > 0 && (
          <button
            onClick={() => setSelectedImg(5)}
            className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg"
          >
            <img src={imgs[4]} alt="" className="h-full w-full object-cover opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-bold text-white">+{extraCount}</div>
          </button>
        )}
      </div>

      <div className="mt-8">
        <div className="border-b border-slate-200">
          <nav className="flex gap-8">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`border-b-2 pb-4 text-sm font-medium transition-colors ${
                  activeTab === t.id ? 'border-[#1A3C6E] text-[#1A3C6E]' : 'border-transparent text-slate-500 hover:text-[#1A3C6E]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="py-8">
          {activeTab === 'specs' && (
            <div className="grid gap-x-12 gap-y-4 md:grid-cols-2">
              {specs.map((s) => (
                <div key={s.label} className="flex justify-between border-b border-[#1A3C6E]/5 py-2">
                  <span className="text-slate-500">{s.label}</span>
                  <span className="font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'desc' && <p className="text-slate-600">{vehicle.description || 'Chưa có mô tả.'}</p>}
          {activeTab === 'location' && branch && (
            <div className="h-72 overflow-hidden rounded-xl bg-slate-200">
              <iframe
                title="Vị trí"
                src={`https://www.google.com/maps?q=${branch.lat},${branch.lng}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
              />
            </div>
          )}
          {activeTab === 'similar' && similarContent}
        </div>
      </div>
    </div>
  )
}
