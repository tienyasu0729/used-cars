import type { ManagerPricingImageAssetInput, PricingDeclaredGroup } from '@/types/pricing.types'

export interface VehiclePricingImageRow {
  url: string
  declaredGroup: PricingDeclaredGroup
  caption: string
  captionBy: string
  captionType: string
}

export const PRICING_DECLARED_GROUP_OPTIONS: PricingDeclaredGroup[] = [
  'front',
  'rear',
  'left_side',
  'right_side',
  'interior_front',
  'interior_rear',
  'dashboard',
  'odometer',
  'engine_bay',
  'tire',
  'damage_detail',
  'document',
  'other',
]

export function createEmptyPricingImageRow(): VehiclePricingImageRow {
  return {
    url: '',
    declaredGroup: 'other',
    caption: '',
    captionBy: 'manager',
    captionType: 'user_note',
  }
}

export function normalizePricingImageRow(row?: Partial<VehiclePricingImageRow>): VehiclePricingImageRow {
  return {
    url: row?.url ?? '',
    declaredGroup: (row?.declaredGroup ?? 'other') as PricingDeclaredGroup,
    caption: row?.caption ?? '',
    captionBy: row?.captionBy ?? 'manager',
    captionType: row?.captionType ?? 'user_note',
  }
}

export function buildPricingImageAssets(rows: VehiclePricingImageRow[]): ManagerPricingImageAssetInput[] {
  return rows
    .map((row) => normalizePricingImageRow(row))
    .filter((row) => row.url.trim().length > 0)
    .map((row) => ({
      url: row.url.trim(),
      source: 'cloudinary',
      declaredGroup: row.declaredGroup,
      caption: row.caption.trim() || null,
      captionBy: row.captionBy.trim() || 'manager',
      captionType: row.captionType.trim() || 'user_note',
    }))
}
