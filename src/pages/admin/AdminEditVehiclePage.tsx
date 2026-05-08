import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller, useFieldArray, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Plus, Trash2, ImageIcon, Upload, X } from 'lucide-react'
import { Input, Button, ConfirmDialog } from '@/components/ui'
import { useCatalog } from '@/hooks/useCatalog'
import { useVehicleRegistryLabels } from '@/hooks/useVehicleRegistryLabels'
import { useBranches } from '@/hooks/useBranches'
import { useManagerManagedVehicle, useManagerVehicle } from '@/hooks/useManagerVehicles'
import { useToastStore } from '@/store/toastStore'
import { fetchMediaUploadEnabled, uploadManagerImage } from '@/services/managerMedia.service'
import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'
import { formatPriceNumber } from '@/utils/format'
import { MaintenanceHistoryPanel } from '@/features/manager/components'
import type { VehicleStatus } from '@/types/vehicle.types'
import type { UpdateVehicleRequest } from '@/types/vehicle.types'

const MAX_LOCAL_IMAGES = 15

type PickedImage = { id: string; file: File; preview: string }

type ImagePreviewTile =
  | { kind: 'url'; rowIndex: number; key: string }
  | { kind: 'picked'; picked: PickedImage; key: string }

function trimUrl(u: string): string {
  return u.trim()
}

function canPreviewUrl(u: string): boolean {
  const t = trimUrl(u)
  return t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')
}

const BODY_STYLE_OPTIONS = [
  { value: 'Sedan', label: 'Sedan' },
  { value: 'SUV', label: 'SUV / Crossover' },
  { value: 'Hatchback', label: 'Hatchback' },
  { value: 'MPV', label: 'MPV' },
  { value: 'Bán tải', label: 'Bán tải' },
] as const

const STATUS_OPTIONS: { value: VehicleStatus; label: string }[] = [
  { value: 'Available', label: 'Đang bán' },
  { value: 'Reserved', label: 'Đã đặt cọc' },
  { value: 'Sold', label: 'Đã bán' },
  { value: 'Hidden', label: 'Ẩn (không hiển thị)' },
  { value: 'InTransfer', label: 'Đang điều chuyển' },
]

const schema = z.object({
  categoryId: z.coerce.number().refine((n) => n > 0, 'Chọn hãng'),
  subcategoryId: z.coerce.number().refine((n) => n > 0, 'Chọn dòng xe'),
  branchId: z.coerce.number().refine((n) => n > 0, 'Thiếu chi nhánh'),
  title: z.string().trim().min(1, 'Nhập tiêu đề').max(500),
  price: z.coerce.number().min(0, 'Giá không âm'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().min(0),
  fuel: z.string().min(1),
  transmission: z.string().min(1),
  bodyStyle: z.string().optional(),
  origin: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['Available', 'Reserved', 'Sold', 'Hidden', 'InTransfer']),
  postingDate: z.string().optional(),
  imageRows: z.array(z.object({ url: z.string() })),
})

type FormValues = z.infer<typeof schema>

const selectClass =
  "w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat px-4 py-3 pr-10 text-sm shadow-sm transition focus:border-[#1A3C6E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/15 disabled:opacity-60"

export function AdminEditVehiclePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToastStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pickedRef = useRef<PickedImage[]>([])
  const lastHydratedVehicleId = useRef<number | null>(null)
  const [pickedImages, setPickedImages] = useState<PickedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [cloudReady, setCloudReady] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSubmitData, setPendingSubmitData] = useState<FormValues | null>(null)
  const numericId = id ? parseInt(id, 10) : NaN
  const { data: vehicle, isLoading, accessDenied } = useManagerManagedVehicle(id)
  const { updateVehicle, isSubmitting, error } = useManagerVehicle()

  useEffect(() => {
    if (!accessDenied) return
    toast.addToast('error', 'Bạn không có quyền chỉnh sửa xe này.')
    navigate('/admin/vehicles', { replace: true })
  }, [accessDenied, navigate, toast])

  const {
    categories,
    subcategories,
    isLoadingCategories,
    isLoadingSubcategories,
    fetchSubcategories,
  } = useCatalog()
  const { fuelOptions, transmissionOptions } = useVehicleRegistryLabels()
  const { data: branches = [] } = useBranches()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      categoryId: 0,
      subcategoryId: 0,
      branchId: 0,
      title: '',
      price: 0,
      year: new Date().getFullYear(),
      mileage: 0,
      fuel: 'Xăng',
      transmission: 'Số tự động',
      bodyStyle: '',
      origin: '',
      description: '',
      status: 'Available',
      postingDate: '',
      imageRows: [{ url: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'imageRows' })
  const categoryId = watch('categoryId')
  const branchId = watch('branchId')
  const watchedFuel = watch('fuel')
  const watchedTransmission = watch('transmission')
  const watchedImageRows = watch('imageRows')

  const fuelSelectOptions = useMemo(() => {
    const base: string[] = [...fuelOptions]
    const v = (watchedFuel ?? '').trim()
    if (v && !base.includes(v)) return [v, ...base]
    return base
  }, [fuelOptions, watchedFuel])

  const transmissionSelectOptions = useMemo(() => {
    const base: string[] = [...transmissionOptions]
    const v = (watchedTransmission ?? '').trim()
    if (v && !base.includes(v)) return [v, ...base]
    return base
  }, [transmissionOptions, watchedTransmission])

  const imagePreviewTiles = useMemo((): ImagePreviewTile[] => {
    const urlTiles: ImagePreviewTile[] = fields
      .map((f, i) => ({ f, i }))
      .filter(({ i }) => trimUrl(watchedImageRows?.[i]?.url ?? '').length > 0)
      .map(({ f, i }) => ({ kind: 'url' as const, rowIndex: i, key: `url-${f.id}` }))
    const pickTiles: ImagePreviewTile[] = pickedImages.map((p) => ({
      kind: 'picked' as const,
      picked: p,
      key: `pick-${p.id}`,
    }))
    return [...urlTiles, ...pickTiles]
  }, [fields, watchedImageRows, pickedImages])

  useEffect(() => {
    pickedRef.current = pickedImages
  }, [pickedImages])

  useEffect(() => {
    return () => {
      pickedRef.current.forEach((p) => URL.revokeObjectURL(p.preview))
    }
  }, [])

  useEffect(() => {
    void fetchMediaUploadEnabled().then(setCloudReady)
  }, [])

  const addPickedFiles = useCallback((fileList: FileList | File[]) => {
    const arr = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (arr.length === 0) {
      toast.addToast('warning', 'Chỉ chấp nhận file ảnh (JPG, PNG, WebP, …)')
      return
    }
    setPickedImages((prev) => {
      const room = MAX_LOCAL_IMAGES - prev.length
      if (room <= 0) {
        toast.addToast('warning', `Tối đa ${MAX_LOCAL_IMAGES} ảnh tải từ máy mỗi lần lưu`)
        return prev
      }
      const take = arr.slice(0, room)
      if (arr.length > room) {
        toast.addToast('warning', `Chỉ thêm được ${room} ảnh (giới hạn ${MAX_LOCAL_IMAGES})`)
      }
      const next = [...prev]
      for (const file of take) {
        next.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) })
      }
      return next
    })
  }, [toast])

  const removePicked = useCallback((pid: string) => {
    setPickedImages((prev) => {
      const t = prev.find((x) => x.id === pid)
      if (t) URL.revokeObjectURL(t.preview)
      return prev.filter((x) => x.id !== pid)
    })
  }, [])

  useEffect(() => {
    if (!vehicle) return
    if (lastHydratedVehicleId.current === vehicle.id) return
    lastHydratedVehicleId.current = vehicle.id
    reset({
      categoryId: vehicle.category_id ?? 0,
      subcategoryId: vehicle.subcategory_id ?? 0,
      branchId: vehicle.branch_id ?? 0,
      title: vehicle.title ?? '',
      price: vehicle.price ?? 0,
      year: vehicle.year ?? new Date().getFullYear(),
      mileage: vehicle.mileage ?? 0,
      fuel: vehicle.fuel ?? 'Xăng',
      transmission: vehicle.transmission ?? 'Số tự động',
      bodyStyle: vehicle.body_style ?? '',
      origin: vehicle.origin ?? '',
      description: vehicle.description ?? '',
      status: (vehicle.status as VehicleStatus) ?? 'Available',
      postingDate: vehicle.posting_date ?? '',
      imageRows: vehicle.images?.length
        ? vehicle.images.map((image) => ({ url: typeof image === 'string' ? image : image.url ?? '' }))
        : [{ url: '' }],
    })
    if (vehicle.category_id) {
      void fetchSubcategories(vehicle.category_id)
    }
  }, [vehicle, reset, fetchSubcategories])

  useEffect(() => {
    if (categoryId > 0) {
      void fetchSubcategories(categoryId)
    }
  }, [categoryId, fetchSubcategories])

  const branchName = branches.find((b) => Number(b.id) === branchId)?.name
  const canSubmit = branchId > 0
  const busy = isSubmitting || isUploading

  const onSubmit = async (data: FormValues) => {
    if (!Number.isFinite(numericId)) return

    const urlsFromForm = data.imageRows.map((r) => trimUrl(r.url)).filter(Boolean)
    const uploadedUrls: string[] = []
    setIsUploading(true)
    try {
      if (pickedImages.length > 0) {
        if (cloudReady) {
          for (const p of pickedImages) {
            uploadedUrls.push(await uploadManagerImage(p.file))
          }
        } else {
          toast.addToast('info', 'Chưa bật tải ảnh từ máy — bỏ qua ảnh mới chọn từ máy lần này.')
        }
      }

      const allUrls = [...urlsFromForm, ...uploadedUrls].filter(Boolean)
      const payload: UpdateVehicleRequest = {
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        branchId: data.branchId,
        title: data.title.trim(),
        price: data.price,
        year: data.year,
        mileage: data.mileage,
        fuel: data.fuel,
        transmission: data.transmission,
        bodyStyle: data.bodyStyle?.trim() || undefined,
        origin: data.origin?.trim() || undefined,
        description: data.description?.trim() || undefined,
        status: data.status,
        postingDate: data.postingDate?.trim() || undefined,
        images: allUrls.map((url, index) => ({ url, sortOrder: index, primaryImage: index === 0 })),
      }

      const result = await updateVehicle(numericId, payload)
      if (result) {
        navigate('/admin/vehicles')
      }
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading || accessDenied) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A3C6E] border-t-transparent" />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-12 text-center">
        <p className="text-slate-600">Không tìm thấy xe hoặc xe đã bị xóa.</p>
        <Link to="/admin/vehicles" className="inline-flex font-medium text-[#1A3C6E] hover:underline">
          ← Về danh sách xe
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <nav className="fixed left-3 top-3 z-40 md:left-[17rem]">
        <Link
          to="/admin/vehicles"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-sm font-medium text-[#1A3C6E] shadow-sm backdrop-blur hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách xe
        </Link>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa tin đăng</h1>
        <p className="mt-1 text-slate-600">
          Mã tin: <span className="font-mono font-medium">{vehicle.listing_id}</span>
          {branchName && (
            <>
              {' '}
              · Chi nhánh: <span className="font-medium text-slate-800">{branchName}</span>
            </>
          )}
        </p>
      </div>

      {vehicle.deleted ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Xe này đang <strong>ẩn khỏi trang chủ / tin đăng công khai</strong> nhưng vẫn hiển thị trong quản lý admin.
        </div>
      ) : null}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <form
        onSubmit={handleSubmit((data) => {
          if (!canSubmit) return
          setPendingSubmitData(data)
          setConfirmOpen(true)
        })}
        className="space-y-6"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Danh mục</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Hãng xe *</label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <select {...field} className={selectClass} disabled={isLoadingCategories}>
                    <option value={0}>{isLoadingCategories ? 'Đang tải...' : '— Chọn hãng —'}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Dòng xe *</label>
              <Controller
                name="subcategoryId"
                control={control}
                render={({ field }) => (
                  <select {...field} className={selectClass} disabled={!categoryId || isLoadingSubcategories}>
                    <option value={0}>
                      {!categoryId ? 'Chọn hãng trước' : isLoadingSubcategories ? 'Đang tải...' : '— Chọn dòng —'}
                    </option>
                    {subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.subcategoryId && <p className="text-xs text-red-500">{errors.subcategoryId.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Chi nhánh *</label>
              <Controller
                name="branchId"
                control={control}
                render={({ field }) => (
                  <select {...field} className={selectClass}>
                    <option value={0}>— Chọn chi nhánh —</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {branchName ? <p className="text-xs text-slate-500">Đang chọn: {branchName}</p> : null}
              {errors.branchId && <p className="text-xs text-red-500">{errors.branchId.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Tiêu đề tin *</label>
              <Input {...register('title')} className="w-full" />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Thông số &amp; giá</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Giá (VNĐ) *</label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={Number.isFinite(field.value) && field.value > 0 ? formatPriceNumber(field.value) : ''}
                    onChange={(e) => {
                      const numeric = Number(e.target.value.replace(/\D/g, ''))
                      field.onChange(Number.isFinite(numeric) ? numeric : 0)
                    }}
                    className="font-semibold"
                  />
                )}
              />
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Năm SX *</label>
              <Input type="number" {...register('year', { valueAsNumber: true })} min={1900} />
              {errors.year && <p className="text-xs text-red-500">{errors.year.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Số km</label>
              <Input type="number" {...register('mileage', { valueAsNumber: true })} min={0} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Trạng thái *</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select {...field} className={selectClass}>
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nhiên liệu</label>
              <select {...register('fuel')} className={selectClass}>
                {fuelSelectOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Hộp số</label>
              <select {...register('transmission')} className={selectClass}>
                {transmissionSelectOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Kiểu dáng</label>
              <select {...register('bodyStyle')} className={selectClass}>
                <option value="">— Không chọn —</option>
                {BODY_STYLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Ngày đăng (tuỳ chọn)</label>
              <Input type="date" {...register('postingDate')} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Xuất xứ</label>
              <Input {...register('origin')} placeholder="VD: Nhập khẩu" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Nội dung / mô tả xe</h2>
          <textarea
            {...register('description')}
            rows={10}
            placeholder="Mô tả chi tiết tình trạng xe, trang bị, lịch sử bảo dưỡng…"
            className="min-h-[200px] w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
            <ImageIcon className="h-5 w-5 text-[#1A3C6E]" />
            Hình ảnh xe
          </h3>
          <p className="mb-4 text-xs text-slate-500">
            Chọn ảnh từ máy (tối đa {MAX_LOCAL_IMAGES} ảnh). Thứ tự hiển thị: URL hiện có trước, ảnh chọn từ máy sau — <strong>ô đầu tiên là ảnh bìa</strong>.
          </p>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addPickedFiles(e.dataTransfer.files)
            }}
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition-colors hover:border-[#1A3C6E]/40 hover:bg-slate-100"
          >
            <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-[#1A3C6E]">
              <Upload className="h-7 w-7" />
            </div>
            <p className="text-center font-semibold text-slate-800">Kéo thả ảnh vào đây hoặc bấm để chọn</p>
            <p className="mt-1 text-center text-sm text-slate-500">JPG, PNG, WebP…</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const fl = e.target.files
                if (fl?.length) addPickedFiles(fl)
                e.target.value = ''
              }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={
                cloudReady
                  ? 'rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800'
                  : 'rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-900'
              }
            >
              {cloudReady ? 'Đã bật tải ảnh từ máy — sẽ đẩy lên khi lưu' : 'Chưa bật tải ảnh từ máy — vẫn lưu được khi dán URL'}
            </span>
          </div>

          {imagePreviewTiles.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {imagePreviewTiles.map((tile, idx) => (
                <div
                  key={tile.key}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                >
                  {tile.kind === 'url' ? (
                    <img
                      src={externalImageDisplayUrl(trimUrl(watchedImageRows?.[tile.rowIndex]?.url ?? ''))}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img src={tile.picked.preview} alt="" className="h-full w-full object-cover" />
                  )}
                  {idx === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-[#1A3C6E] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Ảnh bìa
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (tile.kind === 'url') remove(tile.rowIndex)
                      else removePicked(tile.picked.id)
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
            <summary className="cursor-pointer select-none text-sm font-semibold text-slate-800">Thêm hoặc sửa ảnh bằng URL</summary>
            <div className="mt-3 space-y-2">
              {fields.map((f, index) => {
                const rowUrl = watchedImageRows?.[index]?.url ?? ''
                const prev = canPreviewUrl(rowUrl)
                return (
                  <div key={f.id} className="flex items-center gap-2">
                    <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-200">
                      {prev ? (
                        <img
                          src={externalImageDisplayUrl(trimUrl(rowUrl))}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-slate-400">—</div>
                      )}
                    </div>
                    <Input
                      {...register(`imageRows.${index}.url`)}
                      placeholder="https://..."
                      className="min-w-0 flex-1 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                      disabled={fields.length <= 1}
                      aria-label="Xóa dòng URL"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
              <button
                type="button"
                onClick={() => append({ url: '' })}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A3C6E] hover:underline"
              >
                <Plus className="h-4 w-4" />
                Thêm dòng URL
              </button>
            </div>
          </details>
        </div>

        {Number.isFinite(numericId) && <MaintenanceHistoryPanel vehicleId={numericId} />}

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/vehicles')} disabled={busy}>
            Hủy
          </Button>
          <Button
            type="submit"
            className={`bg-[#1A3C6E] ${(busy || !canSubmit) ? 'opacity-50' : ''}`}
            disabled={busy || !canSubmit || !isDirty}
          >
            {busy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isUploading && pickedImages.length > 0 && cloudReady ? 'Đang tải ảnh...' : 'Đang lưu...'}
              </span>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </div>
      </form>
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Xác nhận lưu thay đổi"
        message="Bạn có chắc muốn cập nhật dữ liệu không?"
        confirmLabel="Cập nhật"
        cancelLabel="Hủy"
        onClose={() => {
          setConfirmOpen(false)
          setPendingSubmitData(null)
        }}
        onConfirm={() => {
          if (!pendingSubmitData) return
          setConfirmOpen(false)
          void onSubmit(pendingSubmitData)
          setPendingSubmitData(null)
        }}
      />
    </div>
  )
}
