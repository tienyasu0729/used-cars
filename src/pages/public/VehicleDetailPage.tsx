import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, GitCompare, Facebook, Link2 } from 'lucide-react'
import { useVehicle } from '@/hooks/useVehicles'
import { useBranch } from '@/hooks/useBranches'
import { formatPrice, formatMileage } from '@/utils/format'
import { VehicleStatusBadge } from '@/components/ui'
import { VehicleCard } from '@/features/vehicles/components/VehicleCard'
import { BookTestDriveModal } from '@/features/vehicles/components/BookTestDriveModal'
import { DepositWizardModal } from '@/features/vehicles/components/DepositWizardModal'
import { useVehicles } from '@/hooks/useVehicles'
import { useCompareStore } from '@/store/compareStore'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: vehicle, isLoading } = useVehicle(id)
  useDocumentTitle(vehicle ? `Chi tiết xe - ${vehicle.brand} ${vehicle.model}` : 'Chi tiết xe')
  const { data: branch } = useBranch(vehicle?.branchId)
  const { data } = useVehicles()
  const { addVehicle, removeVehicle, vehicles } = useCompareStore()
  const similarVehicles = data?.data?.filter((v) => v.brand === vehicle?.brand && v.id !== vehicle?.id).slice(0, 4) ?? []
  const [activeTab, setActiveTab] = useState('specs')
  const [saved, setSaved] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [depositOpen, setDepositOpen] = useState(false)

  const isComparing = vehicle ? vehicles.some((v) => v.id === vehicle.id) : false

  const handleShare = (type: 'facebook' | 'zalo' | 'copy') => {
    const url = window.location.href
    if (type === 'copy') {
      navigator.clipboard.writeText(url)
      return
    }
    if (type === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
      return
    }
    if (type === 'zalo') {
      window.open(`https://zalo.me/share?url=${encodeURIComponent(url)}`, '_blank')
    }
  }

  if (isLoading || !vehicle) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
      </div>
    )
  }

  const fuelLabel = vehicle.fuelType === 'Gasoline' ? 'Xăng' : vehicle.fuelType === 'Diesel' ? 'Dầu' : vehicle.fuelType === 'Electric' ? 'Điện' : 'Hybrid'
  const transLabel = vehicle.transmission === 'Automatic' ? 'Tự động' : 'Sàn'

  const tabs = [
    { id: 'specs', label: 'Thông Số Kỹ Thuật' },
    { id: 'desc', label: 'Mô Tả' },
    { id: 'location', label: 'Vị Trí' },
    { id: 'similar', label: 'Xe Tương Tự' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <div className="overflow-hidden rounded-xl">
            <img
              src={vehicle.images[0] || 'https://placehold.co/800x500'}
              alt={vehicle.brand + ' ' + vehicle.model}
              className="aspect-video w-full object-cover"
            />
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
            {vehicle.images.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                alt=""
                className="h-16 w-20 shrink-0 rounded object-cover"
              />
            ))}
          </div>

          <div className="mt-8 border-b border-gray-200">
            <div className="flex gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 py-3 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-[#1A3C6E] text-[#1A3C6E]'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            {activeTab === 'specs' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex justify-between border-b py-2">
                  <span className="text-gray-500">Năm SX</span>
                  <span>{vehicle.year}</span>
                </div>
                <div className="flex justify-between border-b py-2">
                  <span className="text-gray-500">Số km</span>
                  <span>{formatMileage(vehicle.mileage)}</span>
                </div>
                <div className="flex justify-between border-b py-2">
                  <span className="text-gray-500">Nhiên liệu</span>
                  <span>{fuelLabel}</span>
                </div>
                <div className="flex justify-between border-b py-2">
                  <span className="text-gray-500">Hộp số</span>
                  <span>{transLabel}</span>
                </div>
                <div className="flex justify-between border-b py-2">
                  <span className="text-gray-500">Màu ngoại thất</span>
                  <span>{vehicle.exteriorColor || '-'}</span>
                </div>
                <div className="flex justify-between border-b py-2">
                  <span className="text-gray-500">Màu nội thất</span>
                  <span>{vehicle.interiorColor || '-'}</span>
                </div>
                <div className="flex justify-between border-b py-2">
                  <span className="text-gray-500">Biển số</span>
                  <span>{vehicle.plateNumber || '-'}</span>
                </div>
              </div>
            )}
            {activeTab === 'desc' && (
              <p className="text-gray-600">{vehicle.description || 'Chưa có mô tả.'}</p>
            )}
            {activeTab === 'location' && branch && (
              <div className="h-72 overflow-hidden rounded-xl bg-gray-200">
                <iframe
                  title="Branch location"
                  src={`https://www.google.com/maps?q=${branch.lat},${branch.lng}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                />
              </div>
            )}
            {activeTab === 'similar' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {similarVehicles.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} compact />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-96">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {vehicle.brand} {vehicle.model} {vehicle.trim || ''} {vehicle.year}
              </h1>
              <VehicleStatusBadge status={vehicle.status} />
            </div>
            <p className="mt-4 text-3xl font-bold text-[#1A3C6E]">{formatPrice(vehicle.price)}</p>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <span className="text-gray-500">Năm SX</span>
                <p className="font-medium">{vehicle.year}</p>
              </div>
              <div>
                <span className="text-gray-500">Số km</span>
                <p className="font-medium">{formatMileage(vehicle.mileage)}</p>
              </div>
              <div>
                <span className="text-gray-500">Nhiên liệu</span>
                <p className="font-medium">{fuelLabel}</p>
              </div>
              <div>
                <span className="text-gray-500">Hộp số</span>
                <p className="font-medium">{transLabel}</p>
              </div>
              <div>
                <span className="text-gray-500">Màu ngoại</span>
                <p className="font-medium">{vehicle.exteriorColor || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Màu nội thất</span>
                <p className="font-medium">{vehicle.interiorColor || '-'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Biển số</span>
                <p className="font-medium">{vehicle.plateNumber || '-'}</p>
              </div>
            </div>

            {branch && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-200" />
                  <div>
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-sm text-slate-500">{branch.address}</p>
                    <p className="text-sm">{branch.phone}</p>
                  </div>
                </div>
                <Link to={`/branches/${branch.id}`} className="mt-2 block text-sm text-[#1A3C6E] hover:underline">
                  Xem trên bản đồ
                </Link>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <button
                onClick={() => setBookingOpen(true)}
                className="w-full rounded-lg bg-[#1A3C6E] py-3 font-bold text-white hover:bg-[#152d52]"
              >
                Đặt Lịch Lái Thử
              </button>
              <button
                onClick={() => setDepositOpen(true)}
                className="w-full rounded-lg bg-[#E8612A] py-3 font-bold text-white hover:bg-orange-600"
              >
                Đặt Cọc Ngay
              </button>
              <button className="w-full rounded-lg border-2 border-[#1A3C6E] py-3 font-bold text-[#1A3C6E] hover:bg-slate-50">
                Liên Hệ Tư Vấn
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSaved(!saved)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                Lưu xe
              </button>
              <button
                onClick={() => (isComparing ? removeVehicle(vehicle.id) : addVehicle(vehicle))}
                className="flex items-center gap-2 rounded-lg border-2 border-[#1A3C6E] px-3 py-2 text-sm font-bold text-[#1A3C6E] hover:bg-slate-50"
              >
                <GitCompare className="h-4 w-4" />
                So sánh
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">Chia sẻ:</span>
              <button
                onClick={() => handleShare('facebook')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white hover:bg-[#166FE5]"
              >
                <Facebook className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleShare('zalo')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0068FF] text-white hover:bg-[#0052CC]"
              >
                <span className="text-xs font-bold">Z</span>
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                <Link2 className="h-4 w-4" />
                Sao chép link
              </button>
            </div>
          </div>
        </div>
      </div>
      {vehicle && branch && (
        <>
          <BookTestDriveModal
            isOpen={bookingOpen}
            onClose={() => setBookingOpen(false)}
            vehicleId={vehicle.id}
            branchId={branch.id}
            vehicleName={`${vehicle.brand} ${vehicle.model}`}
          />
          <DepositWizardModal
            isOpen={depositOpen}
            onClose={() => setDepositOpen(false)}
            vehicleId={vehicle.id}
            vehicleName={`${vehicle.brand} ${vehicle.model}`}
            vehiclePrice={vehicle.price}
          />
        </>
      )}
    </div>
  )
}
