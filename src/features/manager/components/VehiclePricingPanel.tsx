import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { managerPricingService } from '@/services/managerPricing.service'
import type {
  ManagerPricingEstimateResponse,
  ManagerPricingImageAssetInput,
  ManagerPricingVehicleInput,
} from '@/types/pricing.types'
import { formatPriceNumber } from '@/utils/format'

interface VehiclePricingPanelProps {
  branchId: number
  vehicleInput: ManagerPricingVehicleInput
  imageAssets: ManagerPricingImageAssetInput[]
  onPrepareImageAssets?: () => Promise<ManagerPricingImageAssetInput[]>
  onEstimated?: (result: ManagerPricingEstimateResponse) => void
}

function formatVnd(value?: number | null) {
  if (value == null) return '--'
  return `${formatPriceNumber(value)} đ`
}

function SummaryCard({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note?: string | null
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
      {note ? <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p> : null}
    </div>
  )
}

export function VehiclePricingPanel({
  branchId,
  vehicleInput,
  imageAssets,
  onPrepareImageAssets,
  onEstimated,
}: VehiclePricingPanelProps) {
  const [isEstimating, setIsEstimating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ManagerPricingEstimateResponse | null>(null)

  const missingRequirements = useMemo(() => {
    const items: string[] = []
    if (!(branchId > 0)) items.push('chi nhánh')
    if (!(vehicleInput.title.trim().length > 0)) items.push('tiêu đề xe')
    if (!(vehicleInput.categoryId > 0)) items.push('hãng xe')
    if (!(vehicleInput.subcategoryId > 0)) items.push('dòng xe')
    if (!(vehicleInput.year > 0)) items.push('năm sản xuất')
    if (!imageAssets.some((item) => item.url.trim().length > 0)) items.push('ít nhất 1 ảnh Cloudinary')
    return items
  }, [branchId, imageAssets, vehicleInput])

  const hasMinimumInput = missingRequirements.length === 0

  const handleEstimate = async () => {
    setError(null)
    setIsEstimating(true)
    try {
      const preparedAssets = onPrepareImageAssets ? await onPrepareImageAssets() : imageAssets
      const filteredAssets = preparedAssets.filter((item) => item.url.trim().length > 0)
      if (!filteredAssets.length) {
        throw new Error('Cần ít nhất 1 ảnh Cloudinary trước khi định giá.')
      }

      const data = await managerPricingService.estimate({
        branchId,
        vehicleInput,
        imageAssets: filteredAssets,
      })

      setResult(data)
      onEstimated?.(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không gọi được dịch vụ định giá.')
    } finally {
      setIsEstimating(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1A3C6E]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#1A3C6E]">
            <Sparkles className="h-4 w-4" />
            Định giá xe
          </div>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Kết quả định giá tham khảo</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Hệ thống tổng hợp dữ liệu thị trường và hình ảnh hiện có để đề xuất mức giá thu mua tham khảo cho xe.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => void handleEstimate()}
          disabled={isEstimating || !hasMinimumInput}
          className="min-w-[180px] bg-[#1A3C6E]"
        >
          {isEstimating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang định giá...
            </span>
          ) : (
            'Định giá'
          )}
        </Button>
      </div>

      {!hasMinimumInput && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Thiếu dữ liệu để định giá: {missingRequirements.join(', ')}.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {!result && !error && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm leading-6 text-slate-600">
          Sau khi nhập đủ thông tin xe và ảnh, bấm <span className="font-semibold text-slate-900">Định giá</span> để nhận mức giá tham khảo.
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <SummaryCard
              label="Giá bán tham khảo"
              value={formatVnd(result.marketSellingPrice?.suggestedPrice)}
              note={`${formatVnd(result.marketSellingPrice?.minPrice)} - ${formatVnd(result.marketSellingPrice?.maxPrice)}`}
            />
            <SummaryCard
              label="Giá thu mua đề xuất"
              value={formatVnd(result.purchasePrice?.suggestedPrice)}
              note={result.purchasePrice?.label ?? 'Mức giá để nhân viên tham khảo khi thương lượng'}
            />
            <SummaryCard
              label="Khoảng thu mua"
              value={
                result.purchasePrice?.minPrice != null || result.purchasePrice?.maxPrice != null
                  ? `${formatVnd(result.purchasePrice?.minPrice)} - ${formatVnd(result.purchasePrice?.maxPrice)}`
                  : '--'
              }
              note="Khoảng giá tham khảo theo dữ liệu hiện có"
            />
          </div>

          {result.expertExplanation?.summary && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">Nhận định chung</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{result.expertExplanation.summary}</p>
            </div>
          )}

          {!!result.businessWarnings?.length && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-amber-950">
                <AlertTriangle className="h-4 w-4" />
                Lưu ý khi thẩm định
              </p>
              <div className="mt-3 space-y-2">
                {result.businessWarnings.map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-xl bg-white/80 px-4 py-3 text-sm leading-6 text-amber-950">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
