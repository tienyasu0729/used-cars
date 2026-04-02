import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Input, Button } from '@/components/ui'
import { MapPin, Upload, ChevronRight, Clock, Loader2, Plus, ImageIcon, X } from 'lucide-react'
import { fetchMediaUploadEnabled, uploadManagerImage } from '@/services/managerMedia.service'
import { useAuthStore } from '@/store/authStore'
import { useBranches } from '@/hooks/useBranches'
import { useManagerBranchSettings } from '@/hooks/useManagerBranchSettings'
import { useManagerBookingSlots } from '@/hooks/useManagerBookingSlots'
import {
  normalizeTimeForInput,
  toLocalTimePayload,
  type BookingSlotSettingDto,
  type BranchDayScheduleDto,
  type BranchSettingsDto,
} from '@/services/managerSettings.service'
import { useToastStore } from '@/store/toastStore'
import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'

const MAX_SHOWROOM_PHOTOS = 15

type PickedShowroomImage = { id: string; file: File; preview: string }

function trimUrl(u: string): string {
  return u.trim()
}

/** 0 = CN … 6 = T7 — khớp backend */
const DAY_DEFS = [
  { key: 'sun', dow: 0, label: 'Chủ Nhật' },
  { key: 'mon', dow: 1, label: 'Thứ Hai' },
  { key: 'tue', dow: 2, label: 'Thứ Ba' },
  { key: 'wed', dow: 3, label: 'Thứ Tư' },
  { key: 'thu', dow: 4, label: 'Thứ Năm' },
  { key: 'fri', dow: 5, label: 'Thứ Sáu' },
  { key: 'sat', dow: 6, label: 'Thứ Bảy' },
] as const

type DayKey = (typeof DAY_DEFS)[number]['key']

function emptyHours(): Record<DayKey, { open: string; close: string; enabled: boolean }> {
  return DAY_DEFS.reduce(
    (acc, d) => ({
      ...acc,
      [d.key]: { open: '08:00', close: '18:00', enabled: d.dow >= 1 && d.dow <= 5 },
    }),
    {} as Record<DayKey, { open: string; close: string; enabled: boolean }>
  )
}

function hydrateHoursFromApi(
  openTime: string | null,
  closeTime: string | null,
  workingDays: number[]
): Record<DayKey, { open: string; close: string; enabled: boolean }> {
  const o = normalizeTimeForInput(openTime)
  const c = normalizeTimeForInput(closeTime)
  return DAY_DEFS.reduce(
    (acc, d) => ({
      ...acc,
      [d.key]: {
        open: o,
        close: c,
        enabled: workingDays.includes(d.dow),
      },
    }),
    {} as Record<DayKey, { open: string; close: string; enabled: boolean }>
  )
}

/** Phút từ nửa đêm — dùng so sánh cùng ngày / ca đêm. */
function timeToMinutes(hhmm: string): number {
  const n = normalizeTimeForInput(hhmm)
  const [h, m] = n.split(':').map((x) => parseInt(x, 10))
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0
  return h * 60 + m
}

function hydrateHoursFromDailySchedules(
  daily: BranchDayScheduleDto[]
): Record<DayKey, { open: string; close: string; enabled: boolean }> {
  return DAY_DEFS.reduce(
    (acc, d) => {
      const row = daily.find((x) => x.dayOfWeek === d.dow)
      const open = normalizeTimeForInput(row?.openTime ?? null)
      const close = normalizeTimeForInput(row?.closeTime ?? null)
      return {
        ...acc,
        [d.key]: {
          open,
          close,
          enabled: row ? !row.closed : false,
        },
      }
    },
    {} as Record<DayKey, { open: string; close: string; enabled: boolean }>
  )
}

function hydrateWorkingHoursFromSettings(data: BranchSettingsDto): Record<
  DayKey,
  { open: string; close: string; enabled: boolean }
> {
  const ds = data.dailySchedules
  if (ds && ds.length === 7) {
    return hydrateHoursFromDailySchedules(ds)
  }
  return hydrateHoursFromApi(data.openTime, data.closeTime, data.workingDays)
}

type SlotDraft = {
  clientKey: string
  id?: number
  slotTime: string
  maxBookings: number
  isActive: boolean
}

function draftsFromApi(rows: BookingSlotSettingDto[]): SlotDraft[] {
  return rows
    .slice()
    .sort((a, b) => a.slotTime.localeCompare(b.slotTime))
    .map((r, i) => ({
      clientKey: r.id != null ? `id-${r.id}` : `api-${i}-${r.slotTime}`,
      id: r.id,
      slotTime: normalizeTimeForInput(r.slotTime),
      maxBookings: Math.max(0, r.maxBookings),
      isActive: r.isActive,
    }))
}

function slotTimeKeyForDedup(time: string): string {
  return toLocalTimePayload(time)
}

export function ManagerSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const addToast = useToastStore((s) => s.addToast)
  const { data: branches = [], isLoading: branchesLoading } = useBranches()

  const [adminBranchId, setAdminBranchId] = useState<number | null>(null)

  const resolvedBranchId = useMemo(() => {
    if (user?.role === 'Admin') {
      if (adminBranchId != null && adminBranchId > 0) return adminBranchId
      if (typeof user.branchId === 'number' && user.branchId > 0) return user.branchId
      const first = branches[0]
      const n = first ? Number(first.id) : NaN
      return Number.isFinite(n) && n > 0 ? n : null
    }
    if (typeof user?.branchId === 'number' && user.branchId > 0) return user.branchId
    return null
  }, [user?.role, user?.branchId, adminBranchId, branches])

  const branchMeta = useMemo(() => {
    if (resolvedBranchId == null) return null
    return branches.find((b) => Number(b.id) === resolvedBranchId) ?? null
  }, [branches, resolvedBranchId])

  const { data, isLoading, isError, error, refetch, saveSettings, isSaving } =
    useManagerBranchSettings(resolvedBranchId)

  const [bookingSlotsActiveOnly, setBookingSlotsActiveOnly] = useState(false)
  const {
    data: slotsData,
    isLoading: slotsLoading,
    isError: slotsIsError,
    error: slotsQueryError,
    refetch: refetchSlots,
    saveSlots,
    isSavingSlots,
  } = useManagerBookingSlots(resolvedBranchId, bookingSlotsActiveOnly)

  const [slotRows, setSlotRows] = useState<SlotDraft[]>([])
  const [slotsDirty, setSlotsDirty] = useState(false)

  const [form, setForm] = useState({
    branchName: '',
    address: '',
    phone: '',
    coords: '',
  })
  const [hours, setHours] = useState(() => emptyHours())
  const [activeTab, setActiveTab] = useState(0)
  const branchInfoRef = useRef<HTMLDivElement>(null)
  const workingHoursRef = useRef<HTMLDivElement>(null)
  const bookingSlotsRef = useRef<HTMLDivElement>(null)
  const branchPhotosRef = useRef<HTMLDivElement>(null)
  const showroomFileInputRef = useRef<HTMLInputElement>(null)
  const [hasHydrated, setHasHydrated] = useState(false)
  const [showroomRows, setShowroomRows] = useState<{ id: string; url: string }[]>(() => [
    { id: crypto.randomUUID(), url: '' },
  ])
  const [pickedShowroom, setPickedShowroom] = useState<PickedShowroomImage[]>([])
  const [isUploadingShowroom, setIsUploadingShowroom] = useState(false)
  const [cloudShowroomReady, setCloudShowroomReady] = useState(false)
  /** Một số URL (API file riêng, 403, hotlink) không tải được trong &lt;img&gt;; theo id dòng để reset khi sửa URL */
  const [showroomUrlLoadFailed, setShowroomUrlLoadFailed] = useState<Record<string, true>>({})
  const showroomRowsRef = useRef(showroomRows)
  showroomRowsRef.current = showroomRows

  const applyServerData = useCallback(() => {
    if (!data) return
    setForm({
      branchName: data.name,
      address: data.address,
      phone: data.phone ?? '',
      coords:
        branchMeta != null && (branchMeta.lat || branchMeta.lng)
          ? `${branchMeta.lat}, ${branchMeta.lng}`
          : '— (chưa có tọa độ)',
    })
    setHours(hydrateWorkingHoursFromSettings(data))
    const imgs = data.showroomImageUrls?.filter(Boolean) ?? []
    setShowroomRows(
      imgs.length > 0 ? imgs.map((url) => ({ id: crypto.randomUUID(), url })) : [{ id: crypto.randomUUID(), url: '' }],
    )
    setHasHydrated(true)
  }, [data, branchMeta])

  useEffect(() => {
    setHasHydrated(false)
  }, [resolvedBranchId])

  useEffect(() => {
    setSlotsDirty(false)
  }, [resolvedBranchId, bookingSlotsActiveOnly])

  useEffect(() => {
    if (data) applyServerData()
  }, [data, applyServerData])

  const pickedShowroomRef = useRef(pickedShowroom)
  pickedShowroomRef.current = pickedShowroom
  useEffect(() => {
    return () => {
      pickedShowroomRef.current.forEach((p) => URL.revokeObjectURL(p.preview))
    }
  }, [])

  useEffect(() => {
    void fetchMediaUploadEnabled().then(setCloudShowroomReady)
  }, [])

  useEffect(() => {
    if (!slotsData || slotsDirty) return
    setSlotRows(draftsFromApi(slotsData))
  }, [slotsData, slotsDirty])

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, index: number) => {
    setActiveTab(index)
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const showroomPreviewTiles = useMemo(() => {
    const urlTiles = showroomRows
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => trimUrl(r.url).length > 0)
      .map(({ r, i }) => ({ kind: 'url' as const, key: `${r.id}-u${i}`, row: r, rowIndex: i }))
    const pickTiles = pickedShowroom.map((p) => ({
      kind: 'picked' as const,
      key: p.id,
      picked: p,
    }))
    return [...urlTiles, ...pickTiles]
  }, [showroomRows, pickedShowroom])

  const addShowroomPickedFiles = useCallback(
    (fileList: FileList | File[]) => {
      const arr = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
      if (arr.length === 0) {
        addToast('warning', 'Chỉ chấp nhận file ảnh.')
        return
      }
      setPickedShowroom((prev) => {
        const urlCount = showroomRowsRef.current.filter((r) => trimUrl(r.url).length > 0).length
        const room = MAX_SHOWROOM_PHOTOS - urlCount - prev.length
        if (room <= 0) {
          addToast('warning', `Tối đa ${MAX_SHOWROOM_PHOTOS} ảnh (URL + từ máy).`)
          return prev
        }
        const take = arr.slice(0, room)
        if (arr.length > take.length) {
          addToast('warning', `Chỉ thêm được ${take.length} ảnh (giới hạn ${MAX_SHOWROOM_PHOTOS}).`)
        }
        const next = [...prev]
        for (const file of take) {
          next.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) })
        }
        return next
      })
    },
    [addToast],
  )

  const removePickedShowroom = useCallback((pid: string) => {
    setPickedShowroom((prev) => {
      const t = prev.find((x) => x.id === pid)
      if (t) URL.revokeObjectURL(t.preview)
      return prev.filter((x) => x.id !== pid)
    })
  }, [])

  const handleSave = async () => {
    if (resolvedBranchId == null) {
      addToast('error', 'Không xác định được chi nhánh. Admin hãy chọn chi nhánh.')
      return
    }
    const name = form.branchName.trim()
    const address = form.address.trim()
    if (!name || !address) {
      addToast('error', 'Tên và địa chỉ chi nhánh không được để trống.')
      return
    }
    const phoneTrim = form.phone.trim()
    if (phoneTrim.length > 20) {
      addToast('error', 'Số điện thoại tối đa 20 ký tự.')
      return
    }
    for (const d of DAY_DEFS) {
      const h = hours[d.key]
      if (h?.enabled && timeToMinutes(h.open) === timeToMinutes(h.close)) {
        addToast('error', 'Giờ mở và giờ đóng không được trùng nhau (ca đêm: kết thúc phải là giờ sáng hôm sau, ví dụ 22:00 → 06:00).')
        return
      }
    }
    const dailySchedules = DAY_DEFS.map((d) => {
      const h = hours[d.key]!
      return {
        dayOfWeek: d.dow,
        closed: !h.enabled,
        openTime: toLocalTimePayload(h.open),
        closeTime: toLocalTimePayload(h.close),
      }
    })
    setIsUploadingShowroom(true)
    try {
      const urlsFromRows = showroomRows.map((r) => trimUrl(r.url)).filter(Boolean)
      const uploadedUrls: string[] = []
      if (pickedShowroom.length > 0) {
        if (cloudShowroomReady) {
          for (const p of pickedShowroom) {
            uploadedUrls.push(await uploadManagerImage(p.file))
          }
        } else {
          addToast(
            'info',
            'Ảnh chọn từ máy cần dịch vụ lưu ảnh đã bật trên hệ thống — hoặc dán đường dẫn ảnh (URL) bên dưới.',
            6500,
          )
        }
      }
      const showroomImageUrls = [...urlsFromRows, ...uploadedUrls].slice(0, MAX_SHOWROOM_PHOTOS)
      await saveSettings({
        name,
        address,
        phone: phoneTrim || null,
        dailySchedules,
        showroomImageUrls,
      })
      pickedShowroom.forEach((p) => URL.revokeObjectURL(p.preview))
      setPickedShowroom([])
      addToast('success', 'Đã lưu cài đặt chi nhánh.')
      void refetch()
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
          ? String((e as { message: string }).message)
          : 'Không lưu được. Kiểm tra dữ liệu hoặc quyền truy cập.'
      addToast('error', msg)
      console.error('[ManagerSettingsPage]', e)
    } finally {
      setIsUploadingShowroom(false)
    }
  }

  const handleCancel = () => {
    pickedShowroom.forEach((p) => URL.revokeObjectURL(p.preview))
    setPickedShowroom([])
    applyServerData()
    addToast('info', 'Đã khôi phục dữ liệu từ máy chủ.')
  }

  const handleAddSlotRow = () => {
    setSlotsDirty(true)
    setSlotRows((prev) => [
      ...prev,
      {
        clientKey: `new-${crypto.randomUUID()}`,
        slotTime: '09:00',
        maxBookings: 2,
        isActive: true,
      },
    ])
  }

  const handleResetSlotsFromServer = async () => {
    setSlotsDirty(false)
    try {
      const result = await refetchSlots()
      if (result.error) {
        addToast(
          'error',
          result.error instanceof Error ? result.error.message : 'Không tải lại được khung giờ từ máy chủ.',
        )
        return
      }
      const rows = Array.isArray(result.data) ? result.data : (slotsData ?? [])
      setSlotRows(draftsFromApi(rows))
      addToast('info', 'Đã hoàn tác khung giờ theo dữ liệu máy chủ.')
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
          ? (e as { message: string }).message
          : 'Không tải lại được khung giờ từ máy chủ.'
      addToast('error', msg)
    }
  }

  const handleSaveSlots = async () => {
    if (resolvedBranchId == null) {
      addToast('error', 'Không xác định được chi nhánh.')
      return
    }
    if (slotRows.length === 0) {
      addToast('error', 'Cần ít nhất một khung giờ để lưu.')
      return
    }
    const seen = new Set<string>()
    for (const r of slotRows) {
      const k = slotTimeKeyForDedup(r.slotTime)
      if (seen.has(k)) {
        addToast('error', 'Trùng giờ trong danh sách. Gộp hoặc sửa trước khi lưu.')
        return
      }
      seen.add(k)
    }
    for (const r of slotRows) {
      if (!Number.isFinite(r.maxBookings) || r.maxBookings < 1) {
        addToast('error', 'Số lượt tối đa mỗi khung phải ≥ 1.')
        return
      }
    }
    try {
      await saveSlots({
        slots: slotRows.map((r) => ({
          slotTime: r.slotTime,
          maxBookings: r.maxBookings,
          isActive: r.isActive,
        })),
      })
      setSlotsDirty(false)
      addToast('success', 'Đã lưu khung giờ đặt lịch.')
      void refetchSlots()
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: string }).message === 'string'
          ? String((e as { message: string }).message)
          : 'Không lưu được khung giờ.'
      addToast('error', msg)
      console.error('[ManagerSettingsPage] slots', e)
    }
  }

  const accessDenied = user?.role !== 'Admin' && user?.role !== 'BranchManager'
  const showAdminBranchPicker = user?.role === 'Admin' && branches.length > 0

  if (accessDenied) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <p className="text-slate-600">Bạn không có quyền truy cập cài đặt chi nhánh.</p>
      </div>
    )
  }

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
          Cập nhật thông tin chi nhánh, giờ làm việc, khung giờ đặt lịch lái thử và ảnh showroom. Dùng nút{' '}
          <span className="font-semibold text-slate-800">Lưu thay đổi</span> ở cuối trang để ghi toàn bộ cài đặt.
        </p>
      </div>

      {showAdminBranchPicker && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
          <label className="mb-2 block text-sm font-semibold text-slate-800">Chi nhánh (Admin)</label>
          <select
            className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={resolvedBranchId ?? ''}
            onChange={(e) => setAdminBranchId(Number(e.target.value))}
            disabled={branchesLoading}
          >
            {branches.map((b) => (
              <option key={b.id} value={Number(b.id)}>
                {b.name} (#{b.id})
              </option>
            ))}
          </select>
        </div>
      )}

      {resolvedBranchId == null && !branchesLoading && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Không có chi nhánh để tải. Vui lòng kiểm tra quyền tài khoản hoặc liên hệ quản trị hệ thống.
        </div>
      )}

      {isError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Lỗi tải cài đặt: {error instanceof Error ? error.message : 'Unknown'}
          <Button variant="ghost" className="ml-2 h-8" onClick={() => void refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      <div className="mb-8 border-b border-slate-200">
        <div className="flex gap-8 overflow-x-auto">
          {[
            { label: 'Thông Tin Chi Nhánh', ref: branchInfoRef },
            { label: 'Giờ Làm Việc', ref: workingHoursRef },
            { label: 'Khung Giờ Đặt Lịch', ref: bookingSlotsRef },
            { label: 'Hình Ảnh Chi Nhánh', ref: branchPhotosRef },
          ].map((tab, i) => (
            <button
              key={tab.label}
              type="button"
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

      {isLoading && !hasHydrated && (
        <div className="flex items-center gap-2 py-12 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải cài đặt…
        </div>
      )}

      <section ref={branchInfoRef} className="space-y-8 scroll-mt-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Thông Tin Cơ Bản</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tên Chi Nhánh</label>
                <Input
                  value={form.branchName}
                  onChange={(e) => setForm((p) => ({ ...p, branchName: e.target.value }))}
                  disabled={isLoading && !data}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Số Điện Thoại</label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  disabled={isLoading && !data}
                  maxLength={20}
                />
                <p className="mt-1 text-xs text-slate-500">Tối đa 20 ký tự.</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Địa Chỉ</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  rows={3}
                  disabled={isLoading && !data}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-[#1A3C6E] focus:border-transparent outline-none disabled:opacity-60"
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
              <div className="absolute bottom-3 left-3 max-w-[90%] rounded-lg bg-white/95 p-3 text-xs font-medium shadow-sm backdrop-blur">
                {form.coords}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Bản đồ minh họa theo dữ liệu chi nhánh. Chỉnh tọa độ trực tiếp trên bản đồ sẽ được bổ sung sau.
            </p>
            <button
              type="button"
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-100 py-2 font-semibold text-slate-500"
              disabled
            >
              <MapPin className="h-4 w-4" />
              Cập nhật tọa độ (chưa khả dụng)
            </button>
          </div>
        </div>
      </section>
      <hr className="my-12 border-slate-200" />
      <section ref={workingHoursRef} className="space-y-6 scroll-mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-slate-900">Giờ Làm Việc</h2>
          <span className="max-w-xl rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            Mỗi thứ có thể khác nhau. Ca đêm: giờ đóng &lt; giờ mở (theo đồng hồ) nghĩa là kết thúc sau nửa đêm hôm
            sau (ví dụ 22:00 → 06:00). Giờ mở và đóng không được trùng nhau.
          </span>
        </div>
        <div className="grid gap-3">
          {DAY_DEFS.map((d) => {
            const h = hours[d.key]
            const enabled = Boolean(h?.enabled)
            const invalidPair =
              enabled && h != null && timeToMinutes(h.open) === timeToMinutes(h.close)
            const overnight =
              enabled && h != null && timeToMinutes(h.close) !== timeToMinutes(h.open) && timeToMinutes(h.close) < timeToMinutes(h.open)
            const ringInvalid = 'ring-2 ring-red-500 border-red-400'
            const baseInput =
              'w-full rounded border px-3 py-2 text-sm disabled:bg-slate-50 border-slate-300 focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]'
            return (
            <div
              key={d.key}
              className={`grid grid-cols-12 items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 ${!enabled ? 'opacity-70' : ''}`}
            >
              <div className="col-span-12 sm:col-span-3 font-semibold text-slate-700">{d.label}</div>
              <div className="col-span-12 sm:col-span-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="time"
                  value={h?.open ?? '08:00'}
                  disabled={!enabled}
                  onChange={(e) =>
                    setHours((p) => ({ ...p, [d.key]: { ...(p[d.key] ?? {}), open: e.target.value } }))
                  }
                  className={`${baseInput} ${invalidPair ? ringInvalid : ''}`}
                  aria-invalid={invalidPair}
                />
                </div>
                <span className="text-[11px] text-slate-500 sm:pl-6">Mở cửa</span>
              </div>
              <div className="col-span-12 sm:col-span-1 text-center text-slate-400 sm:pt-0 pt-1">đến</div>
              <div className="col-span-12 sm:col-span-3 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="time"
                  value={h?.close ?? '18:00'}
                  disabled={!enabled}
                  onChange={(e) =>
                    setHours((p) => ({ ...p, [d.key]: { ...(p[d.key] ?? {}), close: e.target.value } }))
                  }
                  className={`${baseInput} ${invalidPair ? ringInvalid : ''}`}
                  aria-invalid={invalidPair}
                />
                </div>
                <span className="text-[11px] text-slate-500 sm:pl-6">Đóng cửa</span>
              </div>
              {invalidPair && (
                <p className="col-span-12 text-xs font-medium text-red-600 sm:col-start-4 sm:col-end-11">
                  Giờ mở và đóng không được giống hệt nhau.
                </p>
              )}
              {overnight && !invalidPair && (
                <p className="col-span-12 text-xs text-amber-800 sm:col-start-4 sm:col-end-11">
                  Đang cấu hình ca đêm: khách đặt lịch trong khoảng từ giờ mở tới trước giờ đóng (qua nửa đêm).
                </p>
              )}
              <div className="col-span-12 sm:col-span-2 flex justify-end sm:pt-0 pt-2">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={hours[d.key]?.enabled ?? false}
                    onChange={(e) =>
                      setHours((p) => ({ ...p, [d.key]: { ...(p[d.key] ?? {}), enabled: e.target.checked } }))
                    }
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#1A3C6E] peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
            )
          })}
        </div>
      </section>
      <hr className="my-12 border-slate-200" />
      <section ref={bookingSlotsRef} className="space-y-6 scroll-mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Khung Giờ Đặt Lịch (Lái Thử)</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Khách chọn một trong các khung giờ dưới đây khi đặt lịch lái thử. Nhấn &quot;Lưu khung giờ đặt lịch&quot; để
              áp dụng. Để tạm ngừng nhận lịch tại một khung, hãy tắt &quot;Đang bật&quot; thay vì xóa dòng — dữ liệu cũ
              trên hệ thống vẫn được giữ.
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={bookingSlotsActiveOnly}
              onChange={(e) => setBookingSlotsActiveOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]"
            />
            Chỉ hiển thị khung giờ đang bật
          </label>
        </div>

        {slotsIsError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            Lỗi tải khung giờ: {slotsQueryError instanceof Error ? slotsQueryError.message : 'Unknown'}
            <Button type="button" variant="ghost" className="ml-2 h-8" onClick={() => void refetchSlots()}>
              Thử lại
            </Button>
          </div>
        )}

        {slotsLoading && slotRows.length === 0 && !slotsDirty && (
          <div className="flex items-center gap-2 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải khung giờ…
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Giờ bắt đầu slot</th>
                <th className="px-4 py-3">Tối đa lượt / khung</th>
                <th className="px-4 py-3">Đang bật</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {slotRows.length === 0 && !slotsLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Chưa có khung giờ. Thêm dòng mới hoặc liên hệ quản trị nếu cần hỗ trợ dữ liệu ban đầu.
                  </td>
                </tr>
              ) : (
                slotRows.map((row) => (
                  <tr key={row.clientKey} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        value={row.slotTime}
                        onChange={(e) => {
                          setSlotsDirty(true)
                          setSlotRows((prev) =>
                            prev.map((x) => (x.clientKey === row.clientKey ? { ...x, slotTime: e.target.value } : x))
                          )
                        }}
                        className="rounded border border-slate-300 px-2 py-1.5"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min={1}
                        className="max-w-[120px]"
                        value={row.maxBookings}
                        onChange={(e) => {
                          setSlotsDirty(true)
                          const v = parseInt(e.target.value, 10)
                          setSlotRows((prev) =>
                            prev.map((x) =>
                              x.clientKey === row.clientKey ? { ...x, maxBookings: Number.isFinite(v) ? v : 1 } : x
                            )
                          )
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={row.isActive}
                        onChange={(e) => {
                          setSlotsDirty(true)
                          setSlotRows((prev) =>
                            prev.map((x) =>
                              x.clientKey === row.clientKey ? { ...x, isActive: e.target.checked } : x
                            )
                          )
                        }}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setSlotsDirty(true)
                          setSlotRows((prev) => prev.filter((x) => x.clientKey !== row.clientKey))
                        }}
                      >
                        Bỏ dòng
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={handleAddSlotRow} className="gap-2 border-[#1A3C6E] text-[#1A3C6E]">
            <Plus className="h-4 w-4" />
            Thêm khung giờ
          </Button>
          <Button type="button" variant="ghost" onClick={handleResetSlotsFromServer} disabled={slotsLoading || isSavingSlots}>
            Hoàn tác (tải lại từ server)
          </Button>
          <Button
            type="button"
            onClick={() => void handleSaveSlots()}
            disabled={resolvedBranchId == null || isSavingSlots || slotsLoading}
            className="bg-[#1A3C6E] shadow-md shadow-[#1A3C6E]/25"
          >
            {isSavingSlots ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu khung giờ…
              </>
            ) : (
              'Lưu khung giờ đặt lịch'
            )}
          </Button>
        </div>
      </section>
      <hr className="my-12 border-slate-200" />
      <section ref={branchPhotosRef} className="space-y-6 scroll-mt-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hình Ảnh Chi Nhánh</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Tối đa {MAX_SHOWROOM_PHOTOS} ảnh. Chọn ảnh từ máy hoặc dán đường dẫn (URL). Ảnh từ máy được tải lên dịch vụ
            lưu ảnh khi hệ thống đã bật cấu hình tương ứng — nếu chưa bật, bạn vẫn có thể chỉ dùng URL. Thứ tự: URL
            nhập trước, sau đó là ảnh vừa chọn từ máy; <strong>ảnh đầu tiên là ảnh đại diện</strong>. Nhấn &quot;Lưu thay
            đổi&quot; cuối trang để ghi lại. Link kiểu{' '}
            <code className="rounded bg-slate-100 px-1 text-xs">genspark.ai/api/files/…</code> thường chỉ trả ảnh khi
            có phiên đăng nhập — thẻ <code className="rounded bg-slate-100 px-1 text-xs">&lt;img&gt;</code> không gửi cookie đó nên ô xem
            trước thường lỗi (tab mới có thể xem được nếu bạn đã đăng nhập dịch vụ đó). Để hiển thị trong app, hãy dùng URL ảnh công khai (CDN, Cloudinary,
            liên kết trực tiếp file .jpg/.png) hoặc tải ảnh từ máy khi đã bật lưu ảnh.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
            <ImageIcon className="h-5 w-5 text-[#1A3C6E]" />
            Thư viện ảnh
          </h3>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                showroomFileInputRef.current?.click()
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addShowroomPickedFiles(e.dataTransfer.files)
            }}
            onClick={() => showroomFileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition-colors hover:border-[#1A3C6E]/40 hover:bg-slate-100"
          >
            <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-[#1A3C6E]">
              <Upload className="h-7 w-7" />
            </div>
            <p className="text-center font-semibold text-slate-800">Kéo thả ảnh vào đây hoặc bấm để chọn</p>
            <p className="mt-1 text-center text-sm text-slate-500">JPG, PNG, WebP…</p>
            <input
              ref={showroomFileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const fl = e.target.files
                if (fl?.length) addShowroomPickedFiles(fl)
                e.target.value = ''
              }}
            />
          </div>
          <div className="mt-3">
            <span
              className={
                cloudShowroomReady
                  ? 'inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800'
                  : 'inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900'
              }
            >
              {cloudShowroomReady
                ? 'Đã bật tải ảnh từ máy — sẽ đẩy lên khi lưu'
                : 'Chưa bật tải ảnh từ máy — vẫn lưu được khi dán URL'}
            </span>
          </div>

          {showroomPreviewTiles.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {showroomPreviewTiles.map((tile, idx) => (
                <div
                  key={tile.key}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                >
                  {tile.kind === 'url' ? (
                    showroomUrlLoadFailed[tile.row.id] ? (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-slate-200/90 p-2 text-center">
                        <span className="text-[10px] font-medium leading-tight text-slate-700">
                          Không nhúng được ảnh (host trả lỗi hoặc cần đăng nhập). URL vẫn được lưu giống ảnh xe.
                        </span>
                        <a
                          href={trimUrl(tile.row.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-[#1A3C6E] underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Mở trong tab mới
                        </a>
                      </div>
                    ) : (
                      <img
                        src={externalImageDisplayUrl(trimUrl(tile.row.url))}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={() =>
                          setShowroomUrlLoadFailed((p) => ({
                            ...p,
                            [tile.row.id]: true,
                          }))
                        }
                      />
                    )
                  ) : (
                    <img src={tile.picked.preview} alt="" className="h-full w-full object-cover" />
                  )}
                  {idx === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-[#1A3C6E] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Ảnh chính
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (tile.kind === 'url') {
                        setShowroomRows((prev) => {
                          const next = prev.filter((r) => r.id !== tile.row.id)
                          return next.length ? next : [{ id: crypto.randomUUID(), url: '' }]
                        })
                      } else {
                        removePickedShowroom(tile.picked.id)
                      }
                    }}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Xóa ảnh"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <details className="mt-6 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
            <summary className="cursor-pointer select-none text-sm font-semibold text-slate-800">
              Thêm hoặc sửa ảnh bằng URL
            </summary>
            <p className="mt-2 text-xs text-slate-500">
              Mỗi ô một đường dẫn đầy đủ (https://…). Thứ tự hiển thị: URL trước, ảnh chọn từ máy sau. Link Google Drive dạng
              chia sẻ (/file/d/…/view) được tự đổi sang dạng xem ảnh khi xem trước; file cần chia sẻ &quot;Bất kỳ ai có liên kết&quot;.
              Sau khi bấm Lưu, danh sách được ghi vào cơ sở dữ liệu (JSON trong bảng chi nhánh), cùng cách lưu URL ảnh xe.
            </p>
            <div className="mt-3 space-y-2">
              {showroomRows.map((row, index) => (
                <div key={row.id} className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://..."
                    value={row.url}
                    onChange={(e) => {
                      setShowroomUrlLoadFailed((p) => {
                        if (!p[row.id]) return p
                        const next = { ...p }
                        delete next[row.id]
                        return next
                      })
                      setShowroomRows((prev) =>
                        prev.map((r) => (r.id === row.id ? { ...r, url: e.target.value } : r)),
                      )
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0 text-red-600"
                    onClick={() =>
                      setShowroomRows((prev) => {
                        const next = prev.filter((r) => r.id !== row.id)
                        return next.length ? next : [{ id: crypto.randomUUID(), url: '' }]
                      })
                    }
                  >
                    Xóa
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => setShowroomRows((prev) => [...prev, { id: crypto.randomUUID(), url: '' }])}
                disabled={showroomRows.length >= MAX_SHOWROOM_PHOTOS}
              >
                <Plus className="mr-1 h-4 w-4" />
                Thêm dòng URL
              </Button>
            </div>
          </details>
        </div>
      </section>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-6 py-4 lg:left-[220px]">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="hidden text-xs text-slate-500 md:block">
            {data?.manager ? `Quản lý: ${data.manager}` : ' '}
          </p>
          <div className="flex w-full gap-4 md:w-auto">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 md:flex-none"
              onClick={handleCancel}
              disabled={!data || isSaving}
            >
              Hủy Thay Đổi
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={resolvedBranchId == null || isSaving || isUploadingShowroom || (isLoading && !data)}
              className="flex-1 bg-[#1A3C6E] shadow-lg shadow-[#1A3C6E]/30 md:flex-none"
            >
              {isSaving || isUploadingShowroom ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingShowroom ? 'Đang tải ảnh…' : 'Đang lưu…'}
                </>
              ) : (
                'Lưu Thay Đổi'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
