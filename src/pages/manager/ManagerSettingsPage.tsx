import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Input, Button } from '@/components/ui'
import { MapPin, Upload, Trash2, Eye, ImagePlus, ChevronRight, Clock } from 'lucide-react'

const DAYS = [
  { key: 'mon', label: 'Thứ Hai', enabled: true },
  { key: 'tue', label: 'Thứ Ba', enabled: true },
  { key: 'wed', label: 'Thứ Tư', enabled: true },
  { key: 'thu', label: 'Thứ Năm', enabled: true },
  { key: 'fri', label: 'Thứ Sáu', enabled: true },
  { key: 'sat', label: 'Thứ Bảy', enabled: false },
]

const MOCK_PHOTOS = [
  { id: '1', url: 'https://placehold.co/400x400/94a3b8/white?text=Showroom', primary: true },
  { id: '2', url: 'https://placehold.co/400x400/94a3b8/white?text=Lounge' },
  { id: '3', url: 'https://placehold.co/400x400/94a3b8/white?text=Service' },
]

export function ManagerSettingsPage() {
  const [form, setForm] = useState({
    branchName: 'BanXeOTo Da Nang',
    address: '123 Vo Nguyen Giap St, Son Tra District, Da Nang, Vietnam',
    phone: '+84 236 123 4567',
    coords: '16.0544° N, 108.2022° E',
  })
  const [hours, setHours] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d.key]: { open: '08:00', close: '18:00', enabled: d.enabled } }), {} as Record<string, { open: string; close: string; enabled: boolean }>)
  )
  const [activeTab, setActiveTab] = useState(0)
  const branchInfoRef = useRef<HTMLDivElement>(null)
  const workingHoursRef = useRef<HTMLDivElement>(null)
  const branchPhotosRef = useRef<HTMLDivElement>(null)

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, index: number) => {
    setActiveTab(index)
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSave = () => console.log('Save', form, hours)

  return (
    <div className="mx-auto max-w-5xl space-y-0 pb-32">
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/manager/dashboard" className="font-medium hover:text-[#1A3C6E]">
          Quản lý
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <span className="font-semibold text-slate-900">Cài Đặt</span>
      </nav>
      <div className="mb-8">
        <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900">
          Cài Đặt Chi Nhánh
        </h1>
        <p className="text-slate-600">
          Quản lý thông tin, giờ làm việc và hình ảnh showroom Đà Nẵng.
        </p>
      </div>
      <div className="mb-8 border-b border-slate-200">
        <div className="flex gap-8 overflow-x-auto">
          {[
            { label: 'Thông Tin Chi Nhánh', ref: branchInfoRef },
            { label: 'Giờ Làm Việc', ref: workingHoursRef },
            { label: 'Hình Ảnh Chi Nhánh', ref: branchPhotosRef },
          ].map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => scrollTo(tab.ref, i)}
              className={`whitespace-nowrap border-b-[3px] pb-3 text-sm font-bold transition-colors ${
                activeTab === i ? 'border-[#1A3C6E] text-[#1A3C6E]' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <section ref={branchInfoRef} className="space-y-8 scroll-mt-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Thông Tin Cơ Bản</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tên Chi Nhánh</label>
                <Input value={form.branchName} onChange={(e) => setForm((p) => ({ ...p, branchName: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Số Điện Thoại</label>
                <Input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Địa Chỉ</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-[#1A3C6E] focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Vị Trí GPS</h2>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-80 grayscale contrast-75"
                style={{ backgroundImage: "url('https://placehold.co/800x450/94a3b8/white?text=Bản+Đồ+Đà+Nẵng')" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-14 w-14 text-[#1A3C6E]" />
              </div>
              <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 p-3 text-xs font-medium shadow-sm backdrop-blur">
                {form.coords}
              </div>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-200">
              <MapPin className="h-4 w-4" />
              Cập Nhật Tọa Độ
            </button>
          </div>
        </div>
      </section>
      <hr className="my-12 border-slate-200" />
      <section ref={workingHoursRef} className="space-y-6 scroll-mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Giờ Làm Việc</h2>
          <span className="rounded bg-green-100 px-2 py-1 text-xs font-bold text-green-700">Đang mở cửa</span>
        </div>
        <div className="grid gap-3">
          {DAYS.map((d) => (
            <div
              key={d.key}
              className={`grid grid-cols-12 items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 ${!hours[d.key]?.enabled ? 'opacity-70' : ''}`}
            >
              <div className="col-span-3 font-semibold text-slate-700">{d.label}</div>
              <div className="col-span-3 flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="time"
                  value={hours[d.key]?.open ?? '08:00'}
                  disabled={!hours[d.key]?.enabled}
                  onChange={(e) => setHours((p) => ({ ...p, [d.key]: { ...(p[d.key] ?? {}), open: e.target.value } }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
                />
              </div>
              <div className="col-span-1 text-center text-slate-400">đến</div>
              <div className="col-span-3 flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="time"
                  value={hours[d.key]?.close ?? '18:00'}
                  disabled={!hours[d.key]?.enabled}
                  onChange={(e) => setHours((p) => ({ ...p, [d.key]: { ...(p[d.key] ?? {}), close: e.target.value } }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={hours[d.key]?.enabled ?? false}
                    onChange={(e) => setHours((p) => ({ ...p, [d.key]: { ...(p[d.key] ?? {}), enabled: e.target.checked } }))}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#1A3C6E] peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>
      <hr className="my-12 border-slate-200" />
      <section ref={branchPhotosRef} className="space-y-6 scroll-mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Hình Ảnh Chi Nhánh</h2>
          <button className="flex items-center gap-2 rounded-lg bg-[#1A3C6E]/10 px-4 py-2 text-sm font-bold text-[#1A3C6E] transition-colors hover:bg-[#1A3C6E]/20">
            <Upload className="h-4 w-4" />
            Tải Lên
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {MOCK_PHOTOS.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200">
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="rounded-full bg-white p-2 text-red-500 transition-colors hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button className="rounded-full bg-white p-2 text-slate-900 transition-colors hover:bg-slate-100">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              {photo.primary && (
                <div className="absolute bottom-2 left-2 rounded bg-[#1A3C6E] px-2 py-0.5 text-[10px] font-bold text-white">
                  Chính
                </div>
              )}
            </div>
          ))}
          <div className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-[#1A3C6E] hover:text-[#1A3C6E]">
            <ImagePlus className="mb-1 h-8 w-8" />
            <span className="text-xs font-bold">Thêm Ảnh</span>
          </div>
        </div>
      </section>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="hidden text-xs text-slate-500 md:block">Cập nhật lần cuối: 24/10/2023 lúc 14:32</p>
          <div className="flex w-full gap-4 md:w-auto">
            <Button variant="ghost" className="flex-1 md:flex-none">
              Hủy Thay Đổi
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-[#1A3C6E] shadow-lg shadow-[#1A3C6E]/30 md:flex-none">
              Lưu Thay Đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
