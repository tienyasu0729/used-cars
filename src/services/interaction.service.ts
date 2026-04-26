/**
 * Tier 3.1 — Saved vehicles & view history (axiosInstance + guest_id)
 */
import axiosInstance from '@/utils/axiosInstance'
import type { SavedVehicleItem, ViewedVehicleItem } from '@/types/interaction.types'
import type { VehicleStatus } from '@/types/vehicle.types'

const GUEST_HEADER = 'X-Guest-Id'

/** Luôn có guest_id trước khi gọi API view history */
export function getOrCreateGuestId(): string {
  let guestId = localStorage.getItem('guest_id')
  if (!guestId) {
    guestId = crypto.randomUUID()
    localStorage.setItem('guest_id', guestId)
  }
  return guestId
}

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

function toStatus(v: unknown): VehicleStatus {
  const s = toStr(v)
  const allowed: VehicleStatus[] = ['Available', 'Reserved', 'Sold', 'Hidden', 'InTransfer']
  return allowed.includes(s as VehicleStatus) ? (s as VehicleStatus) : 'Available'
}

function parseSavedItem(raw: Record<string, unknown>): SavedVehicleItem | null {
  const vehicleId = toNum(raw.vehicleId ?? raw.vehicle_id)
  if (!Number.isFinite(vehicleId)) return null
  const price = toNum(raw.price)
  return {
    vehicleId,
    listingId: toStr(raw.listingId ?? raw.listing_id),
    title: toStr(raw.title),
    price: Number.isFinite(price) ? price : 0,
    status: toStatus(raw.status),
    primaryImageUrl: raw.primaryImageUrl != null ? toStr(raw.primaryImageUrl) : raw.primary_image_url != null ? toStr(raw.primary_image_url) : null,
    savedAt: toStr(raw.savedAt ?? raw.saved_at),
  }
}

function parseViewedItem(raw: Record<string, unknown>): ViewedVehicleItem | null {
  const vehicleId = toNum(raw.vehicleId ?? raw.vehicle_id)
  if (!Number.isFinite(vehicleId)) return null
  const price = toNum(raw.price)
  return {
    vehicleId,
    listingId: toStr(raw.listingId ?? raw.listing_id),
    title: toStr(raw.title),
    price: Number.isFinite(price) ? price : 0,
    primaryImageUrl: raw.primaryImageUrl != null ? toStr(raw.primaryImageUrl) : raw.primary_image_url != null ? toStr(raw.primary_image_url) : null,
  }
}

function unwrapData<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: T }).data !== undefined) {
    return (res as { data: T }).data
  }
  return res as T
}

export const interactionService = {
  saveVehicle: async (vehicleId: number): Promise<void> => {
    await axiosInstance.post('/users/me/saved-vehicles', { vehicleId })
  },

  unsaveVehicle: async (vehicleId: number): Promise<void> => {
    await axiosInstance.delete(`/users/me/saved-vehicles/${vehicleId}`)
  },

  getSavedVehicles: async (): Promise<SavedVehicleItem[]> => {
    const res = await axiosInstance.get<unknown>('/users/me/saved-vehicles')
    const raw = unwrapData<unknown[]>(res)
    if (!Array.isArray(raw)) return []
    const out: SavedVehicleItem[] = []
    for (const row of raw) {
      if (row && typeof row === 'object') {
        const item = parseSavedItem(row as Record<string, unknown>)
        if (item) out.push(item)
      }
    }
    return out
  },

  recordView: (vehicleId: number): void => {
    const guestId = getOrCreateGuestId()
    void axiosInstance
      .post(`/vehicles/${vehicleId}/view`, {}, { headers: { [GUEST_HEADER]: guestId } })
      .catch(() => {
        /* fire-and-forget */
      })
  },

  getRecentlyViewed: async (): Promise<ViewedVehicleItem[]> => {
    try {
      const guestId = getOrCreateGuestId()
      const res = await axiosInstance.get<unknown>('/vehicles/recently-viewed', {
        headers: { [GUEST_HEADER]: guestId },
      })
      const raw = unwrapData<unknown[]>(res)
      if (!Array.isArray(raw)) return []
      const out: ViewedVehicleItem[] = []
      for (const row of raw) {
        if (row && typeof row === 'object') {
          const item = parseViewedItem(row as Record<string, unknown>)
          if (item) out.push(item)
        }
      }
      return out
    } catch {
      return []
    }
  },

  mergeGuestHistory: async (guestId: string): Promise<{ mergedCount: number }> => {
    const res = await axiosInstance.post<unknown>('/users/me/merge-view-history', { guestId })
    const data = unwrapData<{ mergedCount: number }>(res)
    return { mergedCount: typeof data?.mergedCount === 'number' ? data.mergedCount : 0 }
  },
}
