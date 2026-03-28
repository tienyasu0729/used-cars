/**
 * Chi nhánh công khai — GET /api/v1/branches (cùng chuẩn ApiResponse + axiosInstance)
 */
import axiosInstance from '@/utils/axiosInstance'
import type { Branch } from '@/types/branch'

export interface BranchPublicDto {
  id: number
  name: string
  address: string
  phone?: string | null
  lat?: number | null
  lng?: number | null
}

function unwrapList(res: unknown): BranchPublicDto[] {
  const r = res as { data?: BranchPublicDto[] }
  if (Array.isArray(r)) return r
  if (r?.data && Array.isArray(r.data)) return r.data
  return []
}

function unwrapOne(res: unknown): BranchPublicDto | null {
  const r = res as { data?: BranchPublicDto }
  if (r?.data && typeof r.data === 'object') return r.data
  if (r && typeof r === 'object' && 'id' in r) return r as BranchPublicDto
  return null
}

/** Map DTO API → Branch dùng trong UI (field mock cũ có default). */
export function mapBranchDtoToBranch(d: BranchPublicDto): Branch {
  const lat = d.lat != null && Number.isFinite(Number(d.lat)) ? Number(d.lat) : 16.0544
  const lng = d.lng != null && Number.isFinite(Number(d.lng)) ? Number(d.lng) : 108.2022
  return {
    id: String(d.id),
    name: d.name,
    address: d.address,
    phone: d.phone?.trim() || '—',
    lat,
    lng,
    openTime: '08:00',
    closeTime: '18:00',
    workingDays: 'Thứ 2 - Chủ nhật',
  }
}

export const branchService = {
  getBranches: async (): Promise<Branch[]> => {
    const res = await axiosInstance.get<unknown>('/branches')
    return unwrapList(res).map(mapBranchDtoToBranch)
  },

  getBranchById: async (id: string): Promise<Branch | null> => {
    const numeric = parseInt(id, 10)
    if (Number.isNaN(numeric)) return null
    const res = await axiosInstance.get<unknown>(`/branches/${numeric}`)
    const dto = unwrapOne(res)
    return dto ? mapBranchDtoToBranch(dto) : null
  },
}
