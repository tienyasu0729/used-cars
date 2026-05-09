import { Calendar, Banknote, Phone, Building2, MapPin, Gauge, Cog, Fuel, Shield } from 'lucide-react'
import type { Vehicle } from '@/types'
import type { Branch } from '@/types'
import { formatPrice, formatMileageShort } from '@/utils/format'

interface VehicleDetailSidebarProps {
  vehicle: Vehicle
  branch: Branch | null
  onBookTestDrive: () => void
  onDeposit: () => void
}

const transShort = (t: string) => (t === 'Automatic' ? 'AT' : 'MT')

export function VehicleDetailSidebar({ vehicle, branch, onBookTestDrive, onDeposit }: VehicleDetailSidebarProps) {
  const specCards = [
    { icon: Calendar, label: 'Năm SX', value: String(vehicle.year) },
    { icon: Gauge, label: 'Odo', value: formatMileageShort(vehicle.mileage) },
    { icon: Cog, label: 'Hộp số', value: transShort(vehicle.transmission) },
    { icon: Fuel, label: 'Động cơ', value: '2.5L' },
    { icon: MapPin, label: 'Khu vực', value: branch?.district ?? 'Đà Nẵng' },
    { icon: Shield, label: 'Bảo hành', value: '1 Năm' },
  ]

  return (
    <div className="lg:col-span-4">
      <div className="sticky top-24 space-y-6">
        <div className="rounded-xl border border-[#1A3C6E]/10 bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-2xl font-black text-slate-900">
            {vehicle.brand} {vehicle.model} {vehicle.trim || ''} {vehicle.year}
          </h1>
          <p className="mb-6 text-3xl font-black text-[#1A3C6E]">{formatPrice(vehicle.price)}</p>

          <div className="mb-8 grid grid-cols-3 gap-4">
            {specCards.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 rounded-lg bg-[#1A3C6E]/5 p-3">
                <s.icon className="h-5 w-5 text-[#1A3C6E]" />
                <span className="text-[10px] font-bold uppercase text-slate-500">{s.label}</span>
                <span className="text-xs font-bold">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={onBookTestDrive}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A3C6E] py-4 text-sm font-bold text-white transition-colors hover:bg-[#1A3C6E]/90"
            >
              <Calendar className="h-5 w-5" />
              Đặt Lịch Lái Thử
            </button>
            <button
              onClick={onDeposit}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E8612A] py-4 text-sm font-bold text-white transition-colors hover:bg-[#E8612A]/90"
            >
              <Banknote className="h-5 w-5" />
              Đặt Cọc Ngay
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#1A3C6E]/20 bg-white py-4 text-sm font-bold text-[#1A3C6E] transition-colors hover:bg-[#1A3C6E]/5">
              <Phone className="h-4 w-4" />
              Liên Hệ Tư Vấn
            </button>
          </div>
        </div>

        {branch && (
          <div className="rounded-xl border border-slate-200 bg-slate-100 p-6">
            <h3 className="mb-4 font-bold text-slate-900">Thông tin Showroom</h3>
            <div className="mb-4 flex items-start gap-3">
              <Building2 className="mt-1 h-5 w-5 shrink-0 text-[#1A3C6E]" />
              <div>
                <p className="text-sm font-bold">{branch.name}</p>
                <p className="mt-1 text-xs text-slate-500">{branch.address}</p>
              </div>
            </div>
            <div className="mb-6 flex items-center gap-3">
              <Phone className="h-5 w-5 text-[#1A3C6E]" />
              <p className="text-sm font-bold">{branch.phone}</p>
            </div>
            <div className="h-32 w-full overflow-hidden rounded-lg bg-slate-300">
              <iframe
                title="Bản đồ"
                src={`https://www.google.com/maps?q=${branch.lat},${branch.lng}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
