import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { Info, Tag, ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { useCatalog } from '@/hooks/useCatalog'
import { useBranches } from '@/hooks/useBranches'
import { useManagerVehicle } from '@/hooks/useManagerVehicles'
import { useToastStore } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { isCloudinaryConfigured, uploadImageToCloudinary } from '@/utils/cloudinaryUpload'
import type { CreateVehicleRequest } from '@/types/vehicle.types'

const FUEL_OPTIONS = ['Xăng', 'Dầu', 'Điện', 'Hybrid'] as const
const TRANSMISSION_OPTIONS = ['Số tự động', 'Số sàn'] as const
const BODY_STYLE_OPTIONS = [
  { value: 'Sedan', label: 'Sedan' },
  { value: 'SUV', label: 'SUV / Crossover' },
  { value: 'Hatchback', label: 'Hatchback' },
  { value: 'MPV', label: 'MPV' },
  { value: 'Bán tải', label: 'Bán tải' },
] as const

const schema = z.object({
  categoryId: z.coerce.number().refine((n) => n > 0, 'Chọn hãng xe từ danh mục'),
  subcategoryId: z.coerce.number().refine((n) => n > 0, 'Chọn dòng xe'),
  vehicleName: z.string().trim().min(1, 'Nhập tên hiển thị tin đăng').max(500, 'Tối đa 500 ký tự'),
  price: z.coerce.number().refine((n) => n > 0, 'Giá bán phải lớn hơn 0'),
  year: z.coerce
    .number()
    .min(1900, 'Năm không hợp lệ')
    .max(new Date().getFullYear() + 1, 'Năm không hợp lệ'),
  mileage: z.coerce.number().min(0, 'Số km không âm'),
  fuel: z.string().min(1, 'Chọn nhiên liệu'),
  transmission: z.string().min(1, 'Chọn hộp số'),
  bodyStyle: z.string().optional(),
  origin: z.string().optional(),
  description: z.string().optional(),
})

type AddVehicleFormValues = z.infer<typeof schema>

const selectClass =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E] disabled:cursor-not-allowed disabled:opacity-60'

const MAX_LOCAL_IMAGES = 15

type PickedImage = { id: string; file: File; preview: string }

export function ManagerAddVehiclePage() {
  const navigate = useNavigate()
  const toast = useToastStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pickedRef = useRef<PickedImage[]>([])
  const [pickedImages, setPickedImages] = useState<PickedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { createVehicle, isSubmitting, error } = useManagerVehicle()
  const { user } = useAuthStore()
  const {
    categories,
    subcategories,
    isLoadingCategories,
    isLoadingSubcategories,
    fetchSubcategories,
  } = useCatalog()
  const { data: branches = [], isLoading: branchesLoading } = useBranches()

  /** Chi nhánh gửi API: ưu tiên branch gán cho Manager/Staff; Admin không có branchId thì lấy chi nhánh đầu danh sách. */
  const effectiveBranchId = useMemo(() => {
    const fromProfile = user?.branchId
    if (fromProfile != null && fromProfile > 0) return fromProfile
    if (user?.role === 'Admin' && branches.length > 0) {
      const n = Number(branches[0].id)
      return Number.isFinite(n) && n > 0 ? n : 0
    }
    return 0
  }, [user?.branchId, user?.role, branches])

  const branchDisplayName = useMemo(() => {
    if (effectiveBranchId <= 0) return null
    const b = branches.find((x) => Number(x.id) === effectiveBranchId)
    return b?.name ?? `Chi nhánh #${effectiveBranchId}`
  }, [branches, effectiveBranchId])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddVehicleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: 0,
      subcategoryId: 0,
      vehicleName: '',
      price: 0,
      year: new Date().getFullYear(),
      mileage: 0,
      fuel: 'Xăng',
      transmission: 'Số tự động',
      bodyStyle: '',
      origin: '',
      description: '',
    },
  })

  const categoryId = watch('categoryId')

  useEffect(() => {
    if (categoryId > 0) {
      void fetchSubcategories(categoryId)
      setValue('subcategoryId', 0)
    }
  }, [categoryId, fetchSubcategories, setValue])

  useEffect(() => {
    pickedRef.current = pickedImages
  }, [pickedImages])

  useEffect(() => {
    return () => {
      pickedRef.current.forEach((p) => URL.revokeObjectURL(p.preview))
    }
  }, [])

  const addPickedFiles = useCallback(
    (fileList: FileList | File[]) => {
      const arr = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
      if (arr.length === 0) {
        toast.addToast('warning', 'Chỉ chấp nhận file ảnh (JPG, PNG, WebP, …)')
        return
      }
      setPickedImages((prev) => {
        const room = MAX_LOCAL_IMAGES - prev.length
        if (room <= 0) {
          toast.addToast('warning', `Tối đa ${MAX_LOCAL_IMAGES} ảnh`)
          return prev
        }
        const take = arr.slice(0, room)
        if (arr.length > room) {
          toast.addToast('warning', `Chỉ thêm được ${room} ảnh (giới hạn ${MAX_LOCAL_IMAGES})`)
        }
        const next: PickedImage[] = [...prev]
        for (const file of take) {
          next.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) })
        }
        return next
      })
    },
    [toast],
  )

  const removePicked = useCallback((id: string) => {
    setPickedImages((prev) => {
      const t = prev.find((x) => x.id === id)
      if (t) URL.revokeObjectURL(t.preview)
      return prev.filter((x) => x.id !== id)
    })
  }, [])

  const onSubmit = async (data: AddVehicleFormValues) => {
    if (effectiveBranchId <= 0) {
      toast.addToast('error', 'Không xác định được chi nhánh. Vui lòng đăng nhập lại hoặc liên hệ quản trị.')
      return
    }

    const images: CreateVehicleRequest['images'] = []
    setIsUploading(true)
    try {
      if (pickedImages.length > 0) {
        if (isCloudinaryConfigured()) {
          for (let i = 0; i < pickedImages.length; i++) {
            const url = await uploadImageToCloudinary(pickedImages[i].file)
            images.push({ url, sortOrder: i, primaryImage: i === 0 })
          }
        } else {
          toast.addToast(
            'info',
            'Chưa cấu hình Cloudinary trong .env — đăng tin không kèm ảnh. Bạn có thể bổ sung ảnh sau khi sửa xe.',
            5000,
          )
        }
      }

      const payload: CreateVehicleRequest = {
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        branchId: effectiveBranchId,
        title: data.vehicleName.trim(),
        price: Math.floor(data.price),
        year: data.year,
        mileage: data.mileage,
        fuel: data.fuel,
        transmission: data.transmission,
        description: data.description?.trim() || undefined,
        bodyStyle: data.bodyStyle?.trim() || undefined,
        origin: data.origin?.trim() || undefined,
        images,
      }

      const result = await createVehicle(payload)
      if (result) {
        pickedImages.forEach((p) => URL.revokeObjectURL(p.preview))
        setPickedImages([])
        navigate('/manager/vehicles')
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Lỗi khi tải ảnh'
      const msg = raw.length > 180 ? `${raw.slice(0, 180)}…` : raw
      toast.addToast('error', msg)
    } finally {
      setIsUploading(false)
    }
  }

  const cloudReady = isCloudinaryConfigured()
  const branchReady = effectiveBranchId > 0
  const busy = isSubmitting || isUploading

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <nav className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to="/manager/dashboard" className="hover:text-[#1A3C6E]">
          Quản lý
        </Link>
        <span>/</span>
        <Link to="/manager/vehicles" className="hover:text-[#1A3C6E]">
          Xe đang bán
        </Link>
        <span>/</span>
        <span className="font-medium text-[#1A3C6E]">Thêm xe mới</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Thêm xe mới</h1>
        <p className="mt-1 text-slate-600">
          Hãng và dòng xe lấy từ danh mục hệ thống; tên tin đăng do bạn nhập. Dữ liệu gửi đúng API{' '}
          <code className="rounded bg-slate-100 px-1 text-xs">POST /manager/vehicles</code>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#1A3C6E]/10">
                  <Info className="h-4 w-4 text-[#1A3C6E]" />
                </span>
                Danh mục &amp; tin đăng
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Hãng xe <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className={selectClass} disabled={isLoadingCategories}>
                        <option value={0}>
                          {isLoadingCategories ? 'Đang tải danh sách hãng...' : '— Chọn hãng —'}
                        </option>
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
                  <label className="text-sm font-semibold text-slate-700">
                    Dòng xe <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="subcategoryId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={selectClass}
                        disabled={!categoryId || isLoadingSubcategories}
                      >
                        <option value={0}>
                          {!categoryId
                            ? 'Chọn hãng trước'
                            : isLoadingSubcategories
                              ? 'Đang tải dòng xe...'
                              : '— Chọn dòng xe —'}
                        </option>
                        {subcategories.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.subcategoryId && (
                    <p className="text-xs text-red-500">{errors.subcategoryId.message}</p>
                  )}
                  {categoryId > 0 && !isLoadingSubcategories && subcategories.length === 0 && (
                    <p className="text-xs text-amber-700">Hãng này chưa có dòng xe trong CSDL — liên hệ quản trị.</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-semibold text-slate-700">Chi nhánh đăng tin</p>
                  {branchesLoading && !branchDisplayName ? (
                    <p className="text-sm text-slate-500">Đang xác định chi nhánh...</p>
                  ) : branchReady && branchDisplayName ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
                      <span className="font-medium text-[#1A3C6E]">{branchDisplayName}</span>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Không xác định được chi nhánh. Kiểm tra tài khoản có được gán chi nhánh hoặc thử tải lại trang.
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Tên xe (tiêu đề tin đăng) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('vehicleName')}
                    placeholder="VD: Camry 2.5Q — một chủ, full option"
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">
                    Tự do mô tả theo xe thực tế; lưu vào trường <strong>title</strong> trên máy chủ.
                  </p>
                  {errors.vehicleName && <p className="text-xs text-red-500">{errors.vehicleName.message}</p>}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-slate-900">Thông số xe</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Giá bán (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <Input type="number" {...register('price', { valueAsNumber: true })} min={1} className="font-semibold" />
                  {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Năm sản xuất <span className="text-red-500">*</span>
                  </label>
                  <Input type="number" {...register('year', { valueAsNumber: true })} min={1900} />
                  {errors.year && <p className="text-xs text-red-500">{errors.year.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Số km đã đi</label>
                  <Input type="number" {...register('mileage', { valueAsNumber: true })} min={0} />
                  {errors.mileage && <p className="text-xs text-red-500">{errors.mileage.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nhiên liệu</label>
                  <select {...register('fuel')} className={selectClass}>
                    {FUEL_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  {errors.fuel && <p className="text-xs text-red-500">{errors.fuel.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Hộp số</label>
                  <select {...register('transmission')} className={selectClass}>
                    {TRANSMISSION_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.transmission && <p className="text-xs text-red-500">{errors.transmission.message}</p>}
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
                  <label className="text-sm font-semibold text-slate-700">Xuất xứ</label>
                  <Input {...register('origin')} placeholder="VD: Nhập khẩu, Lắp ráp trong nước..." />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Mô tả</h3>
              <textarea
                {...register('description')}
                rows={6}
                placeholder="Tình trạng, bảo dưỡng, option nổi bật..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
                <ImageIcon className="h-5 w-5 text-[#1A3C6E]" />
                Hình ảnh xe
              </h3>
              <p className="mb-4 text-xs text-slate-500">
                Chọn ảnh từ máy (tối đa {MAX_LOCAL_IMAGES} ảnh). Khi có{' '}
                <code className="rounded bg-slate-100 px-1">VITE_CLOUDINARY_CLOUD_NAME</code> và{' '}
                <code className="rounded bg-slate-100 px-1">VITE_CLOUDINARY_UPLOAD_PRESET</code> trong{' '}
                <code className="rounded bg-slate-100 px-1">.env</code>, ảnh được đẩy lên Cloudinary rồi gửi URL vào API.
                Chưa cấu hình: vẫn đăng xe bình thường, không lỗi — thêm ảnh sau qua sửa tin.
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
                  {cloudReady ? 'Cloudinary: đã cấu hình — ảnh sẽ được tải lên khi đăng' : 'Cloudinary: chưa cấu hình — đăng xe không gửi ảnh'}
                </span>
              </div>
              {pickedImages.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {pickedImages.map((p, idx) => (
                    <div
                      key={p.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                    >
                      <img src={p.preview} alt="" className="h-full w-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute left-1 top-1 rounded bg-[#1A3C6E] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          Ảnh bìa
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removePicked(p.id)
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
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <Tag className="h-5 w-5 text-[#1A3C6E]" />
                Đăng tin
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Sau khi tạo, xe ở trạng thái <strong>Sẵn có (Available)</strong>.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full border border-slate-200 font-bold text-slate-600"
                  onClick={() => navigate('/manager/vehicles')}
                  disabled={busy}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="w-full font-bold shadow-lg shadow-[#1A3C6E]/20"
                  disabled={busy || !branchReady}
                >
                  {busy ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {isUploading && pickedImages.length > 0 && cloudReady
                        ? 'Đang tải ảnh...'
                        : 'Đang gửi...'}
                    </span>
                  ) : (
                    'Đăng xe'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
