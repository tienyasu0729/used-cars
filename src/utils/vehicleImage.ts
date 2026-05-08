import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'
import { resolveUploadPublicUrl } from '@/utils/mediaUrl'
import type { VehicleImage } from '@/types/vehicle.types'

function normalizeImageUrl(raw: string | null | undefined): string | undefined {
  const uploadUrl = resolveUploadPublicUrl(raw)
  if (!uploadUrl) return undefined
  return externalImageDisplayUrl(uploadUrl)
}

export function getVehicleImageFromImages(images?: Array<VehicleImage | string> | null): string | undefined {
  if (!images || images.length === 0) return undefined
  const primary = images.find((img) => typeof img === 'object' && img?.primaryImage)
  const raw = typeof primary === 'string'
    ? primary
    : primary?.url ?? (typeof images[0] === 'string' ? images[0] : images[0]?.url)
  return normalizeImageUrl(raw)
}

export function getVehicleDisplayImage(
  rawSources: Array<string | null | undefined>,
  fallback = 'https://placehold.co/160x112?text=No+Image',
): string {
  for (const raw of rawSources) {
    const normalized = normalizeImageUrl(raw)
    if (normalized) return normalized
  }
  return fallback
}

export function getVehicleDisplayImageCandidates(
  rawSources: Array<string | null | undefined>,
  fallback = 'https://placehold.co/160x112?text=No+Image',
): string[] {
  const out: string[] = []
  for (const raw of rawSources) {
    const normalized = normalizeImageUrl(raw)
    if (!normalized) continue
    if (!out.includes(normalized)) out.push(normalized)
  }
  if (!out.includes(fallback)) out.push(fallback)
  return out
}
