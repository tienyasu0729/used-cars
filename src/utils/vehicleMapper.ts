/**
 * Chuẩn hoá payload API (camelCase, VehicleSummaryDto) → Vehicle dùng trong UI.
 */
import type { Vehicle, VehicleImage, VehicleStatus } from '@/types/vehicle.types'

function toNum(v: unknown): number {
  if (v == null || v === '') return NaN
  if (typeof v === 'number') return Number.isFinite(v) ? v : NaN
  const n = Number(v)
  return Number.isFinite(n) ? n : NaN
}

function toStr(v: unknown): string {
  if (v == null) return ''
  return String(v)
}

function toPrice(v: unknown): number {
  const n = toNum(v)
  return Number.isFinite(n) ? n : 0
}

function normalizeImage(raw: unknown, index: number): VehicleImage | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const url = toStr(o.url ?? o.imageUrl)
  if (!url) return null
  const id = toNum(o.id)
  return {
    id: Number.isFinite(id) ? id : index,
    url,
    sortOrder: Number.isFinite(toNum(o.sortOrder)) ? toNum(o.sortOrder) : index,
    primaryImage: Boolean(o.primaryImage ?? o.primary_image),
  }
}

function normalizeImages(r: Record<string, unknown>): VehicleImage[] {
  const rawList = r.images
  if (Array.isArray(rawList)) {
    const out: VehicleImage[] = []
    rawList.forEach((item, i) => {
      const img = normalizeImage(item, i)
      if (img) out.push(img)
    })
    if (out.length > 0) return out
  }
  const primary = toStr(r.primaryImageUrl ?? r.primary_image_url)
  if (primary) {
    return [{ id: 0, url: primary, sortOrder: 0, primaryImage: true }]
  }
  return []
}

const STATUSES: VehicleStatus[] = ['Available', 'Reserved', 'Sold', 'Hidden', 'InTransfer']

function toStatus(v: unknown): VehicleStatus {
  const s = toStr(v)
  return STATUSES.includes(s as VehicleStatus) ? (s as VehicleStatus) : 'Available'
}

/** Số km trong tiêu đề dạng "85.000 km" / "120000 km" */
function inferMileageFromTitle(title: string): number | undefined {
  if (!title) return undefined
  const dotGrouped = title.match(/(\d{1,3}(?:\.\d{3})+)\s*km\b/i)
  if (dotGrouped) {
    const n = parseInt(dotGrouped[1].replace(/\./g, ''), 10)
    return Number.isFinite(n) ? n : undefined
  }
  const plain = title.match(/\b(\d{4,7})\s*km\b/i)
  if (plain) {
    const n = parseInt(plain[1], 10)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

/** Gợi ý hộp số từ tiêu đề VN (2.0AT, 1.6 MT, …) */
function inferTransmissionFromTitle(title: string): string | undefined {
  if (!title.trim()) return undefined
  const s = title
  if (/CVT/i.test(s)) return 'CVT'
  if (/số\s*tự\s*động|automatic/i.test(s)) return 'Số tự động'
  if (/\d+\.\d+AT|\d+\s*\.\d+\s*AT|\d+\s*AT\b/i.test(s)) return 'Số tự động'
  if (/\d+\.\d+MT|\d+\s*\.\d+\s*MT|\d+\s*MT\b/i.test(s)) return 'Số sàn'
  if (/\bMT\b|số\s*sàn|manual/i.test(s)) return 'Số sàn'
  if (/\bAT\b/i.test(s)) return 'Số tự động'
  return undefined
}

function inferFuelFromTitle(title: string): string | undefined {
  if (!title.trim()) return undefined
  const s = title.toLowerCase()
  if (/máy\s*xăng/.test(s)) return 'Máy xăng'
  if (/hybrid/.test(s)) return 'Hybrid'
  if (/\bev\b|điện|electric/.test(s)) return 'Điện'
  if (/dầu|diesel|tdi|cdi/.test(s)) return 'Dầu'
  if (/xăng|petrol|gasoline/.test(s)) return 'Xăng'
  return undefined
}

function normalizePostingDate(v: unknown): string | undefined {
  if (v == null || v === '') return undefined
  if (typeof v === 'string') return v
  if (Array.isArray(v) && v.length >= 3) {
    const [y, m, d] = v
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  return String(v)
}

/**
 * Map một object từ GET /vehicles, /vehicles/{id}, v.v. sang Vehicle.
 */
export function normalizeVehicle(raw: unknown): Vehicle {
  const r = raw as Record<string, unknown>
  const title = toStr(r.title)

  const mileageRaw =
    r.mileage ?? r.odometer ?? r.odo_km ?? r.mileage_km ?? r.odometer_km
  const mileageNum =
    mileageRaw == null || mileageRaw === '' ? undefined : toNum(mileageRaw)
  let mileage =
    mileageNum !== undefined && Number.isFinite(mileageNum) ? mileageNum : undefined
  if (mileage === undefined) {
    const fromTitle = inferMileageFromTitle(title)
    if (fromTitle !== undefined) mileage = fromTitle
  }

  let fuel = toStr(r.fuel ?? r.fuelType ?? r.fuel_type ?? r.energyType)
  if (!fuel) fuel = inferFuelFromTitle(title) ?? ''

  let transmission = toStr(
    r.transmission ?? r.transmissionType ?? r.transmission_type ?? r.gearbox
  )
  if (!transmission) transmission = inferTransmissionFromTitle(title) ?? ''

  const cid = toNum(r.categoryId ?? r.category_id)
  const sid = toNum(r.subcategoryId ?? r.subcategory_id)
  const bid = toNum(r.branchId ?? r.branch_id)

  const desc = toStr(r.description)
  const bodyStyle = toStr(r.bodyStyle ?? r.body_style)
  const origin = toStr(r.origin)
  const branchName = toStr(r.branchName ?? r.branch_name)
  const postingRaw = r.postingDate ?? r.posting_date
  const posting_date = normalizePostingDate(postingRaw)

  return {
    id: toNum(r.id),
    listing_id: toStr(r.listingId ?? r.listing_id),
    title,
    price: toPrice(r.price),
    year: Number.isFinite(toNum(r.year)) ? toNum(r.year) : 0,
    mileage,
    fuel,
    transmission,
    status: toStatus(r.status),
    listing_hold_active: Boolean(r.listingHoldActive ?? r.listing_hold_active),
    deleted: Boolean(r.deleted ?? r.is_deleted ?? r.isDeleted),
    category_id: Number.isFinite(cid) ? cid : 0,
    subcategory_id: Number.isFinite(sid) ? sid : 0,
    branch_id: Number.isFinite(bid) ? bid : 0,
    images: normalizeImages(r),
    brand: toStr(r.categoryName ?? r.brand),
    model: toStr(r.subcategoryName ?? r.model),
    created_at: r.created_at != null ? toStr(r.created_at) : undefined,
    description: desc || undefined,
    body_style: bodyStyle || undefined,
    origin: origin || undefined,
    posting_date,
    branch_name: branchName || undefined,
    my_pending_deposit_id: (() => {
      const raw = r.myPendingDepositId ?? r.my_pending_deposit_id
      if (raw == null) return null
      const n = toNum(raw)
      return Number.isFinite(n) && n > 0 ? n : null
    })(),
  }
}

export function normalizeVehicleList(items: unknown[]): Vehicle[] {
  return items.map((item) => normalizeVehicle(item))
}
