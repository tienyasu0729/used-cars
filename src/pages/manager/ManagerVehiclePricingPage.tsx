import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as XLSX from 'xlsx'
import { Link } from 'react-router-dom'
import {
  Camera,
  CheckCircle2,
  CircleX,
  Clock3,
  FileSpreadsheet,
  FolderOpen,
  ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Upload,
  WalletCards,
  X,
} from 'lucide-react'
import { Input, Button, Spinner } from '@/components/ui'
import { VehiclePricingPanel } from '@/features/manager/components/VehiclePricingPanel'
import {
  buildPricingImageAssets,
  createEmptyPricingImageRow,
  PRICING_DECLARED_GROUP_OPTIONS,
  type VehiclePricingImageRow,
} from '@/features/manager/utils/vehiclePricing'
import { useCatalog } from '@/hooks/useCatalog'
import { useVehicleRegistryLabels } from '@/hooks/useVehicleRegistryLabels'
import { useBranches } from '@/hooks/useBranches'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { fetchMediaUploadEnabled, uploadManagerImage } from '@/services/managerMedia.service'
import { usedCarPurchaseRequestService } from '@/services/usedCarPurchaseRequest.service'
import { vehicleService } from '@/services/vehicle.service'
import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'
import { formatPriceNumber } from '@/utils/format'
import type {
  ImportValidationIssue,
  ImportedVehiclePricingPayload,
  ManagerPricingEstimateResponse,
  UsedCarPurchaseRequestStatus,
} from '@/types/pricing.types'

const BODY_STYLE_OPTIONS = ['Sedan', 'SUV', 'Hatchback', 'MPV', 'Ban tai'] as const
const MAX_LOCAL_IMAGES = 15
const PRICING_GROUP_LABELS: Record<VehiclePricingImageRow['declaredGroup'], string> = {
  front: 'Đầu xe',
  rear: 'Đuôi xe',
  left_side: 'Hông trái',
  right_side: 'Hông phải',
  interior_front: 'Nội thất trước',
  interior_rear: 'Nội thất sau',
  dashboard: 'Táp-lô',
  odometer: 'Đồng hồ ODO',
  engine_bay: 'Khoang máy',
  tire: 'Lốp xe',
  damage_detail: 'Chi tiết lỗi',
  document: 'Giấy tờ',
  other: 'Khác',
}

type PickedImage = { id: string; file: File; preview: string }
type ImportBundleSummary = {
  excelImageRowCount: number
  selectedFolderFileCount: number
  matchedFileCount: number
  uploadedImageCount: number
  extraFolderFileCount: number
  missingFileCount: number
  invalidRowCount: number
}

function trimUrl(u: string): string {
  return u.trim()
}

function canPreviewUrl(u: string): boolean {
  const t = trimUrl(u)
  return t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')
}

function parsePositiveNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number(String(value ?? '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeLookupText(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function normalizeFieldKey(value: string): string {
  return value.replace(/[\s_-]+/g, '').toLowerCase()
}

function normalizeStatus(status: UsedCarPurchaseRequestStatus): string {
  switch (status) {
    case 'PendingApproval':
      return 'Chờ admin duyệt'
    case 'Approved':
      return 'Đã duyệt'
    case 'Rejected':
      return 'Bị từ chối'
    case 'Paid':
      return 'Đã thanh toán'
    case 'ConvertedToInventory':
      return 'Đã tạo xe kho'
    default:
      return status
  }
}

function formatPrice(value?: number | null): string {
  if (value == null) return '--'
  return `${formatPriceNumber(value)} đ`
}

function formatDateTime(value?: string | null): string {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getStatusBadgeClass(status: UsedCarPurchaseRequestStatus): string {
  switch (status) {
    case 'PendingApproval':
      return 'bg-amber-100 text-amber-900'
    case 'Approved':
      return 'bg-emerald-100 text-emerald-900'
    case 'Rejected':
      return 'bg-rose-100 text-rose-900'
    case 'Paid':
    case 'ConvertedToInventory':
      return 'bg-sky-100 text-sky-900'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const selectClass =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E] disabled:cursor-not-allowed disabled:opacity-60'

export function ManagerVehiclePricingPage() {
  const toast = useToastStore()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const excelInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const pickedRef = useRef<PickedImage[]>([])
  const [pickedImages, setPickedImages] = useState<PickedImage[]>([])
  const [cloudReady, setCloudReady] = useState(false)
  const [categoryId, setCategoryId] = useState(0)
  const [subcategoryId, setSubcategoryId] = useState(0)
  const [title, setTitle] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [mileage, setMileage] = useState(0)
  const [fuel, setFuel] = useState('Xang')
  const [transmission, setTransmission] = useState('So tu dong')
  const [bodyStyle, setBodyStyle] = useState('')
  const [origin, setOrigin] = useState('')
  const [description, setDescription] = useState('')
  const [imageRows, setImageRows] = useState<VehiclePricingImageRow[]>([createEmptyPricingImageRow()])
  const [selectedExcelFile, setSelectedExcelFile] = useState<File | null>(null)
  const [selectedFolderFiles, setSelectedFolderFiles] = useState<File[]>([])
  const [importIssues, setImportIssues] = useState<ImportValidationIssue[]>([])
  const [importSummary, setImportSummary] = useState<ImportBundleSummary | null>(null)
  const [isImportingBundle, setIsImportingBundle] = useState(false)
  const [latestValuation, setLatestValuation] = useState<ManagerPricingEstimateResponse | null>(null)
  const [requestedPurchasePrice, setRequestedPurchasePrice] = useState(0)
  const [managerNote, setManagerNote] = useState('')
  const [requestStatusFilter, setRequestStatusFilter] = useState<'all' | UsedCarPurchaseRequestStatus>('all')

  const { user } = useAuthStore()
  const {
    categories,
    subcategories,
    isLoadingCategories,
    isLoadingSubcategories,
    fetchSubcategories,
  } = useCatalog()
  const { fuelOptions, transmissionOptions } = useVehicleRegistryLabels()
  const { data: branches = [] } = useBranches()

  const requestsQuery = useQuery({
    queryKey: ['manager-used-car-purchase-requests'],
    queryFn: () => usedCarPurchaseRequestService.listManager({ page: 0, size: 20 }),
    staleTime: 30_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  })

  const createRequestMutation = useMutation({
    mutationFn: (payload: Parameters<typeof usedCarPurchaseRequestService.createManager>[0]) =>
      usedCarPurchaseRequestService.createManager(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['manager-used-car-purchase-requests'] })
      toast.addToast('success', 'Đã gửi hồ sơ xe cũ sang admin duyệt thanh toán.')
    },
    onError: (error) => {
      toast.addToast('error', error instanceof Error ? error.message : 'Không gửi được hồ sơ duyệt.')
    },
  })

  const markPaidMutation = useMutation({
    mutationFn: (id: number) => usedCarPurchaseRequestService.markPaid(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['manager-used-car-purchase-requests'] })
      toast.addToast('success', 'Đã xác nhận thanh toán và chuyển xe vào kho nội bộ.')
    },
    onError: (error) => {
      toast.addToast('error', error instanceof Error ? error.message : 'Không cập nhật được trạng thái thanh toán.')
    },
  })

  const requestItems = requestsQuery.data?.items ?? []

  const requestStatusCounts = useMemo(() => ({
    all: requestItems.length,
    PendingApproval: requestItems.filter((item) => item.status === 'PendingApproval').length,
    Approved: requestItems.filter((item) => item.status === 'Approved').length,
    Rejected: requestItems.filter((item) => item.status === 'Rejected').length,
    Paid: requestItems.filter((item) => item.status === 'Paid').length,
    ConvertedToInventory: requestItems.filter((item) => item.status === 'ConvertedToInventory').length,
  }), [requestItems])

  const filteredRequests = useMemo(() => (
    requestStatusFilter === 'all'
      ? requestItems
      : requestItems.filter((item) => item.status === requestStatusFilter)
  ), [requestItems, requestStatusFilter])

  const effectiveBranchId = useMemo(() => {
    const fromProfile = user?.branchId
    if (fromProfile != null && fromProfile > 0) return fromProfile
    if (user?.role === 'Admin' && branches.length > 0) {
      const n = Number(branches[0].id)
      return Number.isFinite(n) && n > 0 ? n : 0
    }
    return 0
  }, [branches, user?.branchId, user?.role])

  useEffect(() => {
    if (categoryId > 0) {
      void fetchSubcategories(categoryId)
      setSubcategoryId(0)
    }
  }, [categoryId, fetchSubcategories])

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
      toast.addToast('warning', 'Chỉ chấp nhận file ảnh.')
      return
    }
    setPickedImages((prev) => {
      const room = MAX_LOCAL_IMAGES - prev.length
      if (room <= 0) {
        toast.addToast('warning', `Tối đa ${MAX_LOCAL_IMAGES} ảnh từ máy.`)
        return prev
      }
      const take = arr.slice(0, room)
      const next = [...prev]
      for (const file of take) {
        next.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) })
      }
      return next
    })
  }, [toast])

  const removePicked = useCallback((id: string) => {
    setPickedImages((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((item) => item.id !== id)
    })
  }, [])

  const updateImageRow = useCallback((index: number, patch: Partial<VehiclePricingImageRow>) => {
    setImageRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }, [])

  const addImageRow = useCallback(() => {
    setImageRows((prev) => [...prev, createEmptyPricingImageRow()])
  }, [])

  const removeImageRow = useCallback((index: number) => {
    setImageRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)))
  }, [])

  const preparePricingAssets = useCallback(async () => {
    if (pickedImages.length === 0) {
      return buildPricingImageAssets(imageRows)
    }
    if (!cloudReady) {
      throw new Error('Cần bật upload Cloudinary trước khi định giá bằng ảnh chọn từ máy.')
    }

    const uploadedRows: VehiclePricingImageRow[] = []
    for (const picked of pickedImages) {
      const uploadedUrl = await uploadManagerImage(picked.file)
      uploadedRows.push({
        ...createEmptyPricingImageRow(),
        url: uploadedUrl,
      })
    }

    setImageRows((prev) => [...prev, ...uploadedRows])
    pickedImages.forEach((item) => URL.revokeObjectURL(item.preview))
    setPickedImages([])

    return buildPricingImageAssets([...imageRows, ...uploadedRows])
  }, [cloudReady, imageRows, pickedImages])

  const handleValuationReady = useCallback((result: ManagerPricingEstimateResponse) => {
    setLatestValuation(result)
    const suggested = result.purchasePrice?.suggestedPrice
    if (suggested != null && Number.isFinite(suggested) && suggested > 0) {
      setRequestedPurchasePrice(Math.round(suggested))
    }
  }, [])

  const handleLoadImportedBundle = useCallback(async () => {
    if (!selectedExcelFile) {
      toast.addToast('warning', 'Cần chọn file Excel trước.')
      return
    }
    if (selectedFolderFiles.length === 0) {
      toast.addToast('warning', 'Cần chọn thư mục ảnh trước.')
      return
    }
    if (!cloudReady) {
      toast.addToast('error', 'Cloudinary chưa sẵn sàng nên chưa thể nạp ảnh từ thư mục.')
      return
    }

    setIsImportingBundle(true)
    setImportIssues([])
    setImportSummary(null)
    try {
      const workbook = XLSX.read(await selectedExcelFile.arrayBuffer(), { type: 'array' })
      const vehicleSheet = workbook.Sheets.Vehicle
      const imagesSheet = workbook.Sheets.Images
      if (!vehicleSheet || !imagesSheet) {
        throw new Error('Template Excel phải có đủ 2 sheet Vehicle và Images.')
      }

      const vehicleRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(vehicleSheet, {
        header: 1,
        defval: '',
      })
      const vehicleMap = new Map<string, string>()
      for (const row of vehicleRows) {
        const field = String(row?.[0] ?? '').trim()
        if (!field || normalizeFieldKey(field) === 'field') continue
        vehicleMap.set(normalizeFieldKey(field), String(row?.[1] ?? '').trim())
      }

      const parsedVehicle = {
        categoryId: parsePositiveNumber(vehicleMap.get('categoryid')),
        subcategoryId: parsePositiveNumber(vehicleMap.get('subcategoryid')),
        categoryName: vehicleMap.get('categoryname') ?? vehicleMap.get('category') ?? '',
        subcategoryName: vehicleMap.get('subcategoryname') ?? vehicleMap.get('subcategory') ?? '',
        title: vehicleMap.get('title') ?? '',
        year: parsePositiveNumber(vehicleMap.get('year')),
        mileage: parsePositiveNumber(vehicleMap.get('mileage')),
        fuel: vehicleMap.get('fuel') ?? 'Xang',
        transmission: vehicleMap.get('transmission') ?? 'So tu dong',
        bodyStyle: vehicleMap.get('bodystyle') ?? '',
        origin: vehicleMap.get('origin') ?? '',
        description: vehicleMap.get('description') ?? '',
      }

      const issues: ImportValidationIssue[] = []
      if (!parsedVehicle.title.trim()) issues.push({ level: 'error', message: 'Sheet Vehicle thiếu title.' })
      if (parsedVehicle.year <= 0) issues.push({ level: 'error', message: 'Sheet Vehicle thiếu year hợp lệ.' })

      let resolvedCategoryId = parsedVehicle.categoryId
      if (resolvedCategoryId <= 0) {
        const categoryName = normalizeLookupText(parsedVehicle.categoryName)
        if (!categoryName) {
          issues.push({ level: 'error', message: 'Sheet Vehicle thiếu categoryName hoặc categoryId.' })
        } else {
          const matchedCategory = categories.find((item) => normalizeLookupText(item.name) === categoryName)
          if (!matchedCategory) {
            issues.push({ level: 'error', message: `Không resolve được categoryName "${parsedVehicle.categoryName}" từ dữ liệu danh mục hiện tại.` })
          } else {
            resolvedCategoryId = Number(matchedCategory.id)
          }
        }
      }

      let resolvedSubcategoryId = parsedVehicle.subcategoryId
      if (issues.every((item) => item.level !== 'error') && resolvedCategoryId > 0) {
        const subcategoriesForCategory = await vehicleService.getSubcategories(resolvedCategoryId)
        if (resolvedSubcategoryId <= 0) {
          const subcategoryName = normalizeLookupText(parsedVehicle.subcategoryName)
          if (!subcategoryName) {
            issues.push({ level: 'error', message: 'Sheet Vehicle thiếu subcategoryName hoặc subcategoryId.' })
          } else {
            const matchedSubcategory = subcategoriesForCategory.find((item) => normalizeLookupText(item.name) === subcategoryName)
            if (!matchedSubcategory) {
              issues.push({ level: 'error', message: `Không resolve được subcategoryName "${parsedVehicle.subcategoryName}" trong hãng đã chọn.` })
            } else {
              resolvedSubcategoryId = Number(matchedSubcategory.id)
            }
          }
        }
      }

      const rawImages = XLSX.utils.sheet_to_json<Record<string, unknown>>(imagesSheet, { defval: '' })
      if (rawImages.length === 0) {
        issues.push({ level: 'error', message: 'Sheet Images chưa có dòng ảnh nào.' })
      }

      const fileMap = new Map<string, File>()
      for (const file of selectedFolderFiles) {
        fileMap.set(file.name, file)
        if (file.webkitRelativePath) {
          fileMap.set(file.webkitRelativePath, file)
        }
      }

      const matchedFileNames = new Set<string>()
      let missingFileCount = 0
      let invalidRowCount = 0
      const nextRows: VehiclePricingImageRow[] = []
      for (const row of rawImages) {
        const fileName = String(row.fileName ?? row.filename ?? '').trim()
        const declaredGroup = String(row.declaredGroup ?? 'other').trim() as VehiclePricingImageRow['declaredGroup']
        if (!fileName) {
          issues.push({ level: 'error', message: 'Có dòng trong sheet Images thiếu fileName.' })
          invalidRowCount += 1
          continue
        }
        const file = fileMap.get(fileName)
        if (!file) {
          issues.push({ level: 'error', message: `Không tìm thấy file ảnh khớp với "${fileName}".` })
          missingFileCount += 1
          continue
        }
        matchedFileNames.add(file.name)
        if (!PRICING_DECLARED_GROUP_OPTIONS.includes(declaredGroup)) {
          issues.push({ level: 'error', message: `declaredGroup "${declaredGroup}" không hợp lệ cho ảnh ${fileName}.` })
          invalidRowCount += 1
          continue
        }
        const uploadedUrl = await uploadManagerImage(file)
        nextRows.push({
          url: uploadedUrl,
          declaredGroup,
          caption: String(row.caption ?? '').trim(),
          captionBy: String(row.captionBy ?? 'manager').trim() || 'manager',
          captionType: String(row.captionType ?? 'user_note').trim() || 'user_note',
        })
      }

      const extraFolderFileCount = selectedFolderFiles.filter((file) => !matchedFileNames.has(file.name)).length
      if (extraFolderFileCount > 0) {
        issues.push({
          level: 'warning',
          message: `Thư mục ảnh có ${extraFolderFileCount} file chưa được tham chiếu trong sheet Images nên không được nạp vào form.`,
        })
      }

      setImportSummary({
        excelImageRowCount: rawImages.length,
        selectedFolderFileCount: selectedFolderFiles.length,
        matchedFileCount: matchedFileNames.size,
        uploadedImageCount: nextRows.length,
        extraFolderFileCount,
        missingFileCount,
        invalidRowCount,
      })

      if (issues.some((item) => item.level === 'error')) {
        setImportIssues(issues)
        toast.addToast('error', 'Bundle import có lỗi. Xem chi tiết ở khối import.')
        return
      }

      setCategoryId(resolvedCategoryId)
      await fetchSubcategories(resolvedCategoryId)
      setSubcategoryId(resolvedSubcategoryId)
      setTitle(parsedVehicle.title)
      setYear(parsedVehicle.year)
      setMileage(parsedVehicle.mileage)
      setFuel(parsedVehicle.fuel)
      setTransmission(parsedVehicle.transmission)
      setBodyStyle(parsedVehicle.bodyStyle)
      setOrigin(parsedVehicle.origin)
      setDescription(parsedVehicle.description)
      setImageRows(nextRows.length > 0 ? nextRows : [createEmptyPricingImageRow()])
      setLatestValuation(null)
      setRequestedPurchasePrice(0)
      setImportIssues(issues.length > 0 ? issues : [{ level: 'warning', message: 'Đã nạp dữ liệu thành công. Bạn vẫn có thể chỉnh sửa lại trước khi định giá.' }])
      toast.addToast('success', 'Đã nạp dữ liệu xe và ảnh từ Excel + thư mục ảnh.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không nạp được dữ liệu import.'
      setImportIssues([{ level: 'error', message }])
      setImportSummary(null)
      toast.addToast('error', message)
    } finally {
      setIsImportingBundle(false)
    }
  }, [cloudReady, fetchSubcategories, selectedExcelFile, selectedFolderFiles, toast])

  const handleSendApproval = useCallback(async () => {
    if (!latestValuation) {
      toast.addToast('warning', 'Cần có kết quả định giá AI trước khi gửi duyệt.')
      return
    }
    if (requestedPurchasePrice <= 0) {
      toast.addToast('warning', 'Cần nhập mức giá mua đề nghị hợp lệ.')
      return
    }

    try {
      const preparedAssets = await preparePricingAssets()
      await createRequestMutation.mutateAsync({
        branchId: effectiveBranchId,
        vehicleInput: {
          categoryId,
          subcategoryId,
          title,
          year,
          mileage,
          fuel,
          transmission,
          bodyStyle: bodyStyle || null,
          origin: origin || null,
          description: description || null,
        },
        imageAssets: preparedAssets,
        valuationSnapshot: latestValuation,
        requestedPurchasePrice,
        managerNote: managerNote.trim() || null,
      })
    } catch (error) {
      if (error instanceof Error) {
        toast.addToast('error', error.message)
      }
    }
  }, [
    bodyStyle,
    categoryId,
    createRequestMutation,
    description,
    effectiveBranchId,
    fuel,
    latestValuation,
    managerNote,
    mileage,
    origin,
    preparePricingAssets,
    requestedPurchasePrice,
    subcategoryId,
    title,
    transmission,
    toast,
    year,
  ])

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to="/manager/dashboard" className="hover:text-[#1A3C6E]">
          Quản lý
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-900">Định giá xe</span>
      </nav>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Định giá và gửi hồ sơ mua xe cũ</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Nhân viên thẩm định có thể nạp nhanh dữ liệu từ Excel và thư mục ảnh, định giá xe, sau đó gửi hồ sơ sang admin để duyệt khoản tiền mua.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Chi nhánh áp dụng: <span className="font-semibold text-slate-900">#{effectiveBranchId || '--'}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Nạp từ Excel + thư mục ảnh</h3>
                <p className="mt-1 text-sm text-slate-600">
                  V1 dùng 1 file Excel có 2 sheet `Vehicle` + `Images`, và 1 thư mục ảnh cho đúng fileName trong sheet Images.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => void handleLoadImportedBundle()} disabled={isImportingBundle}>
                {isImportingBundle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Nạp dữ liệu
              </Button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileSpreadsheet className="h-4 w-4 text-[#1A3C6E]" />
                  File Excel
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{selectedExcelFile?.name ?? 'Chưa chọn file Excel.'}</p>
                <Button type="button" variant="outline" className="mt-3" onClick={() => excelInputRef.current?.click()}>
                  Chọn Excel
                </Button>
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(event) => {
                    setSelectedExcelFile(event.target.files?.[0] ?? null)
                    event.currentTarget.value = ''
                  }}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FolderOpen className="h-4 w-4 text-[#1A3C6E]" />
                  Thư mục ảnh
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {selectedFolderFiles.length > 0 ? `${selectedFolderFiles.length} ảnh đã chọn` : 'Chưa chọn thư mục ảnh.'}
                </p>
                <Button type="button" variant="outline" className="mt-3" onClick={() => folderInputRef.current?.click()}>
                  Chọn thư mục ảnh
                </Button>
                <input
                  ref={folderInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  {...({ webkitdirectory: 'true', directory: '' } as Record<string, string>)}
                  onChange={(event) => {
                    setSelectedFolderFiles(Array.from(event.target.files ?? []))
                    event.currentTarget.value = ''
                  }}
                />
              </div>
            </div>

            {importSummary && (
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Excel</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{importSummary.excelImageRowCount}</p>
                  <p className="mt-1 text-xs text-slate-600">Dòng ảnh trong sheet `Images`</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Thư mục ảnh</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{importSummary.selectedFolderFileCount}</p>
                  <p className="mt-1 text-xs text-slate-600">File ảnh đã chọn từ folder</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Nạp vào form</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{importSummary.uploadedImageCount}</p>
                  <p className="mt-1 text-xs text-slate-600">Ảnh Cloudinary được hiển thị trong form</p>
                </div>
              </div>
            )}

            {importSummary && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                <div className="grid gap-2 md:grid-cols-2">
                  <p>Khớp file theo `fileName`: <span className="font-semibold text-slate-900">{importSummary.matchedFileCount}</span></p>
                  <p>Ảnh thừa trong folder: <span className="font-semibold text-slate-900">{importSummary.extraFolderFileCount}</span></p>
                  <p>Ảnh thiếu so với Excel: <span className="font-semibold text-slate-900">{importSummary.missingFileCount}</span></p>
                  <p>Dòng ảnh không hợp lệ: <span className="font-semibold text-slate-900">{importSummary.invalidRowCount}</span></p>
                </div>
              </div>
            )}

            {!!importIssues.length && (
              <div className="mt-4 space-y-2">
                {importIssues.map((item, index) => (
                  <div
                    key={`${item.message}-${index}`}
                    className={`rounded-xl px-4 py-3 text-sm ${
                      item.level === 'error' ? 'border border-red-200 bg-red-50 text-red-800' : 'border border-amber-200 bg-amber-50 text-amber-900'
                    }`}
                  >
                    {item.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Thông tin xe</h3>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Hãng xe</label>
                <select
                  className={selectClass}
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  disabled={isLoadingCategories}
                >
                  <option value={0}>{isLoadingCategories ? 'Đang tải hãng...' : '— Chọn hãng —'}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Dòng xe</label>
                <select
                  className={selectClass}
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(Number(e.target.value))}
                  disabled={categoryId <= 0 || isLoadingSubcategories}
                >
                  <option value={0}>{isLoadingSubcategories ? 'Đang tải dòng xe...' : '— Chọn dòng xe —'}</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Tiêu đề xe</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Toyota Vios G 1.5 CVT 2021" className="w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Năm</label>
                <Input type="number" value={year} onChange={(e) => setYear(Number(e.target.value) || 0)} className="w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Số km</label>
                <Input type="number" value={mileage} onChange={(e) => setMileage(Number(e.target.value) || 0)} className="w-full" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nhiên liệu</label>
                <select className={selectClass} value={fuel} onChange={(e) => setFuel(e.target.value)}>
                  {fuelOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Hộp số</label>
                <select className={selectClass} value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                  {transmissionOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kiểu dáng</label>
                <select className={selectClass} value={bodyStyle} onChange={(e) => setBodyStyle(e.target.value)}>
                  <option value="">— Chọn kiểu dáng —</option>
                  {BODY_STYLE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Xuất xứ</label>
                <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Trong nước / Nhập khẩu" className="w-full" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Mô tả thêm</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Thông tin bổ sung về tình trạng xe..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Camera className="h-5 w-5 text-[#1A3C6E]" />
                  Hình ảnh và gợi ý mô tả
                </h3>
                <p className="mt-1 text-sm text-slate-600">Ảnh tại đây sẽ được dùng cho định giá. Gợi ý mô tả chỉ giúp bổ sung ngữ cảnh cho người thẩm định.</p>
              </div>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Tải ảnh từ máy
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addPickedFiles(e.target.files)
                e.currentTarget.value = ''
              }}
            />

            {!!pickedImages.length && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Ảnh chọn từ máy sẽ được upload trước khi gọi định giá hoặc gửi duyệt</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pickedImages.map((item) => (
                    <div key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <div className="aspect-[16/10] bg-slate-100">
                        <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between gap-2 p-3 text-xs text-slate-600">
                        <span className="line-clamp-1">{item.file.name}</span>
                        <button type="button" onClick={() => removePicked(item.id)} className="rounded-lg p-1 text-red-600 hover:bg-red-50">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {imageRows.map((row, index) => {
                const prev = canPreviewUrl(row.url)
                return (
                  <div key={`image-row-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-200">
                        {prev ? (
                          <img src={externalImageDisplayUrl(trimUrl(row.url))} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <Input
                        value={row.url}
                        onChange={(e) => updateImageRow(index, { url: e.target.value })}
                        placeholder="https://res.cloudinary.com/..."
                        className="min-w-0 flex-1 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageRow(index)}
                        className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                        disabled={imageRows.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nhóm ảnh</label>
                        <select className={selectClass} value={row.declaredGroup} onChange={(e) => updateImageRow(index, { declaredGroup: e.target.value as VehiclePricingImageRow['declaredGroup'] })}>
                          {PRICING_DECLARED_GROUP_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {PRICING_GROUP_LABELS[option]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nguồn ghi chú</label>
                        <Input value="Người kiểm duyệt" readOnly className="w-full text-sm" />
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mô tả ảnh</label>
                      <textarea
                        value={row.caption}
                        onChange={(e) => updateImageRow(index, { caption: e.target.value })}
                        rows={2}
                        placeholder="Ví dụ: ảnh đầu xe, ảnh ODO, vết xước nhẹ cản sau..."
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
                      />
                    </div>
                  </div>
                )
              })}

              <button type="button" onClick={addImageRow} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A3C6E] hover:underline">
                <Plus className="h-4 w-4" />
                Thêm dòng ảnh
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <VehiclePricingPanel
            branchId={effectiveBranchId}
            vehicleInput={{
              categoryId,
              subcategoryId,
              title,
              year,
              mileage,
              fuel,
              transmission,
              bodyStyle: bodyStyle || null,
              origin: origin || null,
              description: description || null,
            }}
            imageAssets={buildPricingImageAssets(imageRows)}
            onPrepareImageAssets={preparePricingAssets}
            onEstimated={handleValuationReady}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <WalletCards className="h-5 w-5 text-[#1A3C6E]" />
              <h3 className="text-lg font-bold text-slate-900">Gửi hồ sơ mua xe cũ cho admin</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Khi gửi duyệt, hệ thống sẽ lưu toàn bộ thông tin xe, hình ảnh, ghi chú và kết quả định giá để admin xem lại đầy đủ.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Giá mua đề nghị gửi admin</label>
                <Input
                  type="number"
                  value={requestedPurchasePrice}
                  onChange={(e) => setRequestedPurchasePrice(Number(e.target.value) || 0)}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Giá đề xuất hiện tại: {formatPrice(latestValuation?.purchasePrice?.suggestedPrice ?? null)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Ghi chú người kiểm duyệt</label>
                <textarea
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                  rows={4}
                  placeholder="Ví dụ: xe đẹp, thiếu ảnh khoang máy, cần duyệt mức mua trong hôm nay..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                className="bg-[#1A3C6E]"
                onClick={() => void handleSendApproval()}
                disabled={!latestValuation || createRequestMutation.isPending}
              >
                {createRequestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Gửi yêu cầu duyệt thanh toán
              </Button>
              {!latestValuation && <span className="text-sm text-amber-700">Cần có kết quả AI định giá trước khi gửi duyệt.</span>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Theo dõi hồ sơ mua xe cũ</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Quay lại trang này để xem hồ sơ nào đang chờ duyệt, đã được duyệt, bị từ chối hoặc đã chuyển thành xe kho.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => void requestsQuery.refetch()} disabled={requestsQuery.isFetching}>
                <RefreshCw className={`h-4 w-4 ${requestsQuery.isFetching ? 'animate-spin' : ''}`} />
                Làm mới trạng thái
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <button type="button" onClick={() => setRequestStatusFilter('all')} className={`rounded-xl border px-4 py-3 text-left transition ${requestStatusFilter === 'all' ? 'border-[#1A3C6E] bg-[#1A3C6E]/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tất cả hồ sơ</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{requestStatusCounts.all}</p>
              </button>
              <button type="button" onClick={() => setRequestStatusFilter('PendingApproval')} className={`rounded-xl border px-4 py-3 text-left transition ${requestStatusFilter === 'PendingApproval' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chờ duyệt</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{requestStatusCounts.PendingApproval}</p>
              </button>
              <button type="button" onClick={() => setRequestStatusFilter('Approved')} className={`rounded-xl border px-4 py-3 text-left transition ${requestStatusFilter === 'Approved' ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đã duyệt</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{requestStatusCounts.Approved}</p>
              </button>
              <button type="button" onClick={() => setRequestStatusFilter('Rejected')} className={`rounded-xl border px-4 py-3 text-left transition ${requestStatusFilter === 'Rejected' ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bị từ chối</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{requestStatusCounts.Rejected}</p>
              </button>
              <button type="button" onClick={() => setRequestStatusFilter('Paid')} className={`rounded-xl border px-4 py-3 text-left transition ${requestStatusFilter === 'Paid' ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đã thanh toán</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{requestStatusCounts.Paid}</p>
              </button>
              <button type="button" onClick={() => setRequestStatusFilter('ConvertedToInventory')} className={`rounded-xl border px-4 py-3 text-left transition ${requestStatusFilter === 'ConvertedToInventory' ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đã vào kho</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{requestStatusCounts.ConvertedToInventory}</p>
              </button>
            </div>

            {requestsQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner size="lg" />
              </div>
            ) : filteredRequests.length ? (
              <div className="mt-4 space-y-4">
                {filteredRequests.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-bold text-slate-900">{item.vehicleTitle || `Hồ sơ #${item.id}`}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(item.status)}`}>
                            {normalizeStatus(item.status)}
                          </span>
                        </div>
                        <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                          <p>Giá manager đề nghị: <span className="font-semibold text-slate-900">{formatPrice(item.requestedPurchasePrice)}</span></p>
                          <p>Gửi lúc: <span className="font-semibold text-slate-900">{formatDateTime(item.createdAt)}</span></p>
                          <p>Giá admin phản hồi: <span className="font-semibold text-slate-900">{formatPrice(item.approvedPurchasePrice)}</span></p>
                          <p>Phản hồi lúc: <span className="font-semibold text-slate-900">{formatDateTime(item.approvedAt)}</span></p>
                        </div>

                        {item.adminNote && (
                          <div className={`mt-3 rounded-xl border px-4 py-3 text-sm leading-6 ${item.status === 'Rejected' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-slate-200 bg-white text-slate-700'}`}>
                            <p className="font-semibold text-slate-900">Phản hồi từ admin</p>
                            <p className="mt-1">{item.adminNote}</p>
                          </div>
                        )}

                        {item.managerNote && (
                          <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                            <p className="font-semibold text-slate-900">Ghi chú đã gửi</p>
                            <p className="mt-1">{item.managerNote}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[220px]">
                        {item.status === 'PendingApproval' && (
                          <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            <Clock3 className="h-4 w-4" />
                            Hồ sơ đang chờ admin duyệt.
                          </div>
                        )}
                        {item.status === 'Approved' && (
                          <>
                            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                              <CheckCircle2 className="h-4 w-4" />
                              Admin đã duyệt khoản tiền mua.
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => markPaidMutation.mutate(item.id)}
                              disabled={markPaidMutation.isPending}
                            >
                              {markPaidMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                              Xác nhận đã thanh toán
                            </Button>
                          </>
                        )}
                        {item.status === 'Rejected' && (
                          <div className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                            <CircleX className="h-4 w-4" />
                            Hồ sơ đã bị từ chối. Xem ghi chú của admin để xử lý lại.
                          </div>
                        )}
                        {item.createdVehicleId != null && (
                          <span className="rounded-xl bg-sky-100 px-4 py-3 text-sm font-semibold text-sky-900">
                            Đã tạo xe kho #{item.createdVehicleId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Không có hồ sơ nào trong trạng thái đang lọc.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
