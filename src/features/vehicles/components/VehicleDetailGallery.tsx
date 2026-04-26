/**
 * VehicleDetailGallery — Gallery ảnh + tabs thông số xe
 *
 * Hỗ trợ API Vehicle type (vehicle.fuel, vehicle.images: VehicleImage[])
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'
import { getVehicleGallerySpecRows } from '@/features/vehicles/vehicleGallerySpecs'
import { MaintenanceHistoryPublic } from './MaintenanceHistoryPublic'
import type { Vehicle, VehicleImage } from '@/types/vehicle.types'

interface VehicleDetailGalleryProps {
  vehicle: Vehicle
  activeTab: string
  onTabChange: (tab: string) => void
  similarContent: React.ReactNode
}

// Lấy URL ảnh từ VehicleImage objects
function getImageUrls(images?: VehicleImage[]): string[] {
  if (!images || images.length === 0) return ['https://placehold.co/800x500?text=No+Image']
  // Sắp xếp theo sortOrder, ảnh chính lên đầu
  const sorted = [...images].sort((a, b) => {
    if (a.primaryImage && !b.primaryImage) return -1
    if (!a.primaryImage && b.primaryImage) return 1
    return a.sortOrder - b.sortOrder
  })
  return sorted.map((img) => externalImageDisplayUrl(img.url))
}

export function VehicleDetailGallery({
  vehicle,
  activeTab,
  onTabChange,
  similarContent,
}: VehicleDetailGalleryProps) {
  const imgs = getImageUrls(vehicle.images)
  const [selectedImg, setSelectedImg] = useState(0)
  const extraCount = imgs.length > 5 ? imgs.length - 5 : 0

  const tabs = [
    { id: 'specs', label: 'Thông Số Kỹ Thuật' },
    { id: 'desc', label: 'Mô Tả' },
    { id: 'maintenance', label: 'Lịch Sử Bảo Dưỡng' },
    { id: 'similar', label: 'Xe Tương Tự' },
  ]

  const specs = getVehicleGallerySpecRows(vehicle)

  return (
    <div className="flex flex-col gap-4 lg:col-span-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Link to="/" className="hover:text-[#1A3C6E]">Trang chủ</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/vehicles" className="hover:text-[#1A3C6E]">Xe cũ</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-[#1A3C6E]">{vehicle.title}</span>
      </nav>

      {/* Main image */}
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-200">
        <img
          src={imgs[selectedImg] || imgs[0]}
          alt={vehicle.title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnail strip */}
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

      {/* Tabs */}
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
          {activeTab === 'desc' &&
            (vehicle.description?.trim() ? (
              <div className="max-w-none whitespace-pre-wrap text-base leading-relaxed text-slate-700">
                {vehicle.description}
              </div>
            ) : (
              <p className="text-slate-500">Chưa có mô tả chi tiết.</p>
            ))}
          {activeTab === 'maintenance' && (
            <MaintenanceHistoryPublic vehicleId={vehicle.id} />
          )}
          {activeTab === 'similar' && similarContent}
        </div>
      </div>
    </div>
  )
}
