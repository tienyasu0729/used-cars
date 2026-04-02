/**
 * Chi nhánh công khai — GET /api/v1/branches (cùng chuẩn ApiResponse + axiosInstance)
 */
import axiosInstance from '@/utils/axiosInstance'
import { externalImageDisplayUrl } from '@/utils/externalImageDisplayUrl'
import type { Branch, BranchScheduleSlot } from '@/types/branch'
import { BRANCH_DAY_LABELS_VI } from '@/types/branch'

export interface BranchPublicScheduleDto {
  dayOfWeek: number
  closed: boolean
  openTime?: string | null
  closeTime?: string | null
}

export interface BranchPublicDto {
  id: number
  name: string
  address: string
  phone?: string | null
  lat?: number | null
  lng?: number | null
  showroomImageUrls?: string[] | null
  workingHours?: BranchPublicScheduleDto[] | null
}

/** Đội ngũ công khai — GET /branches/{id}/team */
export interface BranchTeamMemberDto {
  name: string
  role: string
  avatarUrl?: string | null
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

function unwrapTeamList(res: unknown): BranchTeamMemberDto[] {
  const r = res as { data?: BranchTeamMemberDto[] }
  if (Array.isArray(r)) return r
  if (r?.data && Array.isArray(r.data)) return r.data
  return []
}

function normalizeTime(t: string | null | undefined): string {
  if (t == null || t === '') return ''
  const s = String(t)
  const m = s.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return s
  return `${m[1].padStart(2, '0')}:${m[2]}`
}

function timeToMinutes(t: string): number {
  const m = t.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return NaN
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
}

/** Hiển thị một khung giờ (hỗ trợ ca qua đêm: đóng sau nửa đêm). */
export function formatBranchSlotHours(slot: BranchScheduleSlot): string {
  if (slot.closed) return 'Nghỉ'
  const o = slot.openTime
  const c = slot.closeTime
  if (!o || !c) return '—'
  const om = timeToMinutes(o)
  const cm = timeToMinutes(c)
  if (Number.isNaN(om) || Number.isNaN(cm)) return `${o} - ${c}`
  if (cm > om) return `${o} - ${c}`
  if (cm === om) return o
  return `${o} - ${c} (hôm sau)`
}

function mapDtoSlotToSlot(d: BranchPublicScheduleDto): BranchScheduleSlot {
  const closed = !!d.closed
  if (closed) {
    return { dayOfWeek: d.dayOfWeek, closed: true, openTime: null, closeTime: null }
  }
  const ot = normalizeTime(d.openTime ?? undefined)
  const ct = normalizeTime(d.closeTime ?? undefined)
  return {
    dayOfWeek: d.dayOfWeek,
    closed: false,
    openTime: ot || null,
    closeTime: ct || null,
  }
}

/** Luôn trả đủ 7 ngày (0–6). */
export function normalizeBranchWorkingHoursFromDto(
  list: BranchPublicScheduleDto[] | null | undefined,
): BranchScheduleSlot[] {
  const map = new Map<number, BranchScheduleSlot>()
  for (const raw of list ?? []) {
    map.set(raw.dayOfWeek, mapDtoSlotToSlot(raw))
  }
  const out: BranchScheduleSlot[] = []
  for (let dow = 0; dow <= 6; dow++) {
    out.push(map.get(dow) ?? { dayOfWeek: dow, closed: true, openTime: null, closeTime: null })
  }
  return out
}

function formatDayRangeLabel(startDow: number, endDow: number): string {
  const a = BRANCH_DAY_LABELS_VI[startDow] ?? `Ngày ${startDow}`
  const b = BRANCH_DAY_LABELS_VI[endDow] ?? `Ngày ${endDow}`
  if (startDow === endDow) return a
  return `${a} – ${b}`
}

/** Các ngày mở cửa (đã sort) → "Thứ 2 – Thứ 6", hoặc "Thứ 2 – Thứ 3, Thứ 6" nếu gián đoạn. */
function formatSortedOpenDaysLabel(sortedUniqueDows: number[]): string {
  if (sortedUniqueDows.length === 0) return ''
  const runs: { s: number; e: number }[] = []
  for (const d of sortedUniqueDows) {
    const last = runs[runs.length - 1]
    if (last && last.e + 1 === d) last.e = d
    else runs.push({ s: d, e: d })
  }
  return runs.map((r) => formatDayRangeLabel(r.s, r.e)).join(', ')
}

function buildHoursSummaryLine(slots: BranchScheduleSlot[]): string {
  const openDays = slots.filter((s) => !s.closed && s.openTime && s.closeTime)
  if (openDays.length === 0) return 'Tạm ngưng / đóng cửa'

  type Seg = { start: number; end: number; open: string; close: string }
  const segs: Seg[] = []
  for (const s of openDays) {
    const key = `${s.openTime}|${s.closeTime}`
    const last = segs[segs.length - 1]
    if (last && last.end + 1 === s.dayOfWeek && `${last.open}|${last.close}` === key) {
      last.end = s.dayOfWeek
    } else {
      segs.push({
        start: s.dayOfWeek,
        end: s.dayOfWeek,
        open: s.openTime!,
        close: s.closeTime!,
      })
    }
  }

  return segs
    .map((g) => {
      const range = formatDayRangeLabel(g.start, g.end)
      const hours = formatBranchSlotHours({
        dayOfWeek: g.start,
        closed: false,
        openTime: g.open,
        closeTime: g.close,
      })
      return `${range}: ${hours}`
    })
    .join(' · ')
}

/** Map DTO API → Branch dùng trong UI. */
export function mapBranchDtoToBranch(d: BranchPublicDto): Branch {
  const lat = d.lat != null && Number.isFinite(Number(d.lat)) ? Number(d.lat) : 16.0544
  const lng = d.lng != null && Number.isFinite(Number(d.lng)) ? Number(d.lng) : 108.2022
  const rawUrls = d.showroomImageUrls ?? []
  const images = rawUrls
    .map((u) => externalImageDisplayUrl(String(u ?? '').trim()))
    .filter((u) => u.length > 0)

  const workingHours = normalizeBranchWorkingHoursFromDto(d.workingHours)
  const hoursSummaryLine = buildHoursSummaryLine(workingHours)
  const openDays = workingHours.filter((s) => !s.closed && s.openTime && s.closeTime)
  const firstOpen = openDays[0]
  const uniform =
    firstOpen &&
    openDays.every(
      (s) => s.openTime === firstOpen.openTime && s.closeTime === firstOpen.closeTime,
    )
  const sortedDows = [...new Set(openDays.map((s) => s.dayOfWeek))].sort((a, b) => a - b)

  return {
    id: String(d.id),
    name: d.name,
    address: d.address,
    phone: d.phone?.trim() || '—',
    lat,
    lng,
    images: images.length > 0 ? images : undefined,
    workingHours,
    hoursSummaryLine,
    openTime: uniform && firstOpen.openTime ? firstOpen.openTime : '',
    closeTime: uniform && firstOpen.closeTime ? firstOpen.closeTime : '',
    workingDays:
      uniform && sortedDows.length > 0
        ? formatSortedOpenDaysLabel(sortedDows)
        : 'Theo từng ngày',
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

  getBranchTeam: async (branchId: number): Promise<BranchTeamMemberDto[]> => {
    const res = await axiosInstance.get<unknown>(`/branches/${branchId}/team`)
    return unwrapTeamList(res)
  },
}
