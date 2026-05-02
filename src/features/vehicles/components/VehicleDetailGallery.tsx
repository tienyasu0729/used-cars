/**
 * VehicleDetailGallery — Gallery ảnh + tabs thông số xe
 *
 * Hỗ trợ API Vehicle type (vehicle.fuel, vehicle.images: VehicleImage[])
 */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, X } from 'lucide-react'
import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'
import { getVehicleGallerySpecRows } from '@/features/vehicles/vehicleGallerySpecs'
import { MaintenanceHistoryPublic } from './MaintenanceHistoryPublic'
import type { Vehicle, VehicleImage } from '@/types/vehicle.types'

interface VehicleDetailGalleryProps {
  vehicle: Vehicle
  activeTab: string
  onTabChange: (tab: string) => void
  similarContent: React.ReactNode
  managerView?: boolean
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
  managerView = false,
}: VehicleDetailGalleryProps) {
  const imgs = getImageUrls(vehicle.images)
  const [selectedImg, setSelectedImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const extraCount = imgs.length > 5 ? imgs.length - 5 : 0
  const canNavigate = imgs.length > 1
  const hasManyImages = imgs.length >= 10
  const thumbsColumns = imgs.length >= 14 ? 3 : imgs.length >= 8 ? 2 : 1
  const thumbStripRef = useRef<HTMLDivElement | null>(null)

  const goPrev = () => {
    if (!canNavigate) return
    setSelectedImg((prev) => (prev - 1 + imgs.length) % imgs.length)
  }
  const goNext = () => {
    if (!canNavigate) return
    setSelectedImg((prev) => (prev + 1) % imgs.length)
  }
  const scrollThumbs = (dir: 'left' | 'right') => {
    const el = thumbStripRef.current
    if (!el) return
    const dx = dir === 'left' ? -320 : 320
    el.scrollBy({ left: dx, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!lightboxOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxOpen, imgs.length])

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
      <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-slate-200">
        <img
          src={imgs[selectedImg] || imgs[0]}
          alt={vehicle.title}
          className="h-full w-full object-cover"
        />
        {canNavigate && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white opacity-60 transition hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white opacity-60 transition hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="group relative">
        <div ref={thumbStripRef} className="flex gap-4 overflow-x-auto pb-2 pr-10 [&::-webkit-scrollbar]:hidden">
          {imgs.slice(0, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImg(i)}
              className={`h-24 w-32 shrink-0 overflow-hidden rounded-lg transition-opacity hover:opacity-80 ${selectedImg === i ? 'ring-2 ring-[#1A3C6E] ring-offset-2' : ''}`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
          {extraCount > 0 && (
            <button
              onClick={() => {
                setSelectedImg(5)
                setLightboxOpen(true)
              }}
              className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg"
            >
              <img src={imgs[4]} alt="" className="h-full w-full object-cover opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-bold text-white">+{extraCount}</div>
            </button>
          )}
        </div>
        {imgs.length > 5 && (
          <>
            <button
              type="button"
              onClick={() => scrollThumbs('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 rounded bg-black/25 p-1.5 text-white opacity-35 transition hover:opacity-90"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollThumbs('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded bg-black/25 p-1.5 text-white opacity-35 transition hover:opacity-90"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      {lightboxOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4" onClick={() => setLightboxOpen(false)}>
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>
          {canNavigate && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div className="flex max-h-[92vh] w-full max-w-[1280px] items-start gap-3" onClick={(e) => e.stopPropagation()}>
            <div className={`rounded bg-white/95 p-2 ${hasManyImages ? 'w-[78%]' : 'w-[86%]'}`}>
              <img
                src={imgs[selectedImg] || imgs[0]}
                alt={vehicle.title}
                className="mx-auto max-h-[86vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className={`hidden max-h-[86vh] overflow-y-auto rounded bg-white/90 p-2 md:block ${hasManyImages ? 'w-[22%]' : 'w-[14%]'}`}>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${thumbsColumns}, minmax(0, 1fr))` }}
              >
                {imgs.map((img, idx) => (
                  <button
                    key={`lb-thumb-${idx}`}
                    type="button"
                    onClick={() => setSelectedImg(idx)}
                    className={`overflow-hidden rounded border ${selectedImg === idx ? 'border-[#E8612A]' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="h-14 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
            <MaintenanceHistoryPublic vehicleId={vehicle.id} managedView={managerView} />
          )}
          {activeTab === 'similar' && similarContent}
        </div>
      </div>
    </div>
  )
}
