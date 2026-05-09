/**
 * usePricingDraftStorage
 *
 * Persist/restore toàn bộ form state của trang định giá xe vào sessionStorage.
 * - Dữ liệu tồn tại trong tab hiện tại, mất khi đóng tab (phù hợp với workflow thẩm định).
 * - imageRows chỉ lưu các row đã có Cloudinary URL (bỏ row rỗng).
 * - uploadCache: Map<fileKey, cloudinaryUrl> để tránh upload lại ảnh trùng.
 *   fileKey = "<fileName>|<fileSize>|<lastModified>"
 */

import { useCallback } from 'react'
import type { VehiclePricingImageRow } from '@/features/manager/utils/vehiclePricing'
import type { ManagerPricingEstimateResponse } from '@/types/pricing.types'

const DRAFT_KEY = 'pricing_draft_v1'
const UPLOAD_CACHE_KEY = 'pricing_upload_cache_v1'

export interface PricingDraft {
  categoryId: number
  subcategoryId: number
  title: string
  year: number
  mileage: number
  fuel: string
  transmission: string
  bodyStyle: string
  origin: string
  description: string
  imageRows: VehiclePricingImageRow[]
  latestValuation: ManagerPricingEstimateResponse | null
  requestedPurchasePrice: number
  managerNote: string
  savedAt: number
}

function readDraft(): PricingDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PricingDraft
  } catch {
    return null
  }
}

function readUploadCache(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(UPLOAD_CACHE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

/** Tạo key duy nhất cho file dựa trên tên + size + lastModified. */
export function buildFileKey(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`
}

export function usePricingDraftStorage() {
  /** Lưu toàn bộ draft vào sessionStorage. */
  const saveDraft = useCallback((draft: Omit<PricingDraft, 'savedAt'>) => {
    try {
      const payload: PricingDraft = {
        ...draft,
        // Chỉ lưu row đã có URL thực (Cloudinary), bỏ row rỗng
        imageRows: draft.imageRows.filter((r) => r.url.trim().startsWith('http')),
        savedAt: Date.now(),
      }
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
    } catch {
      // sessionStorage đầy hoặc private mode — bỏ qua
    }
  }, [])

  /** Đọc draft đã lưu. Trả về null nếu không có hoặc quá 4 giờ. */
  const loadDraft = useCallback((): PricingDraft | null => {
    const draft = readDraft()
    if (!draft) return null
    // Hết hạn sau 4 giờ
    if (Date.now() - draft.savedAt > 4 * 60 * 60 * 1000) {
      sessionStorage.removeItem(DRAFT_KEY)
      return null
    }
    return draft
  }, [])

  /** Xóa draft (sau khi gửi duyệt hoặc người dùng reset). */
  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(DRAFT_KEY)
  }, [])

  /**
   * Tra cứu URL đã upload cho file này.
   * Trả về URL nếu đã có, null nếu chưa.
   */
  const getCachedUploadUrl = useCallback((file: File): string | null => {
    const cache = readUploadCache()
    return cache[buildFileKey(file)] ?? null
  }, [])

  /**
   * Lưu URL vừa upload vào cache.
   */
  const setCachedUploadUrl = useCallback((file: File, url: string) => {
    try {
      const cache = readUploadCache()
      cache[buildFileKey(file)] = url
      sessionStorage.setItem(UPLOAD_CACHE_KEY, JSON.stringify(cache))
    } catch {
      // bỏ qua nếu storage đầy
    }
  }, [])

  /** Xóa upload cache (khi cần force re-upload). */
  const clearUploadCache = useCallback(() => {
    sessionStorage.removeItem(UPLOAD_CACHE_KEY)
  }, [])

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    getCachedUploadUrl,
    setCachedUploadUrl,
    clearUploadCache,
  }
}
