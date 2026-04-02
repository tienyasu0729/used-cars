/** 0 = Chủ nhật … 6 = Thứ 7 (khớp backend / DB). */
export const BRANCH_DAY_LABELS_VI = [
  'Chủ nhật',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
] as const

export interface BranchScheduleSlot {
  dayOfWeek: number
  closed: boolean
  openTime: string | null
  closeTime: string | null
}

export interface Branch {
  id: string
  name: string
  address: string
  phone: string
  email?: string
  district?: string
  lat: number
  lng: number
  /** Giữ cho chỗ còn đọc tóm tắt cũ; ưu tiên hiển thị hoursSummaryLine + workingHours. */
  openTime: string
  closeTime: string
  workingDays: string
  /** Một dòng cho card (tóm tắt từ lịch 7 ngày). */
  hoursSummaryLine?: string
  /** Đủ 7 phần tử sau khi map từ API. */
  workingHours?: BranchScheduleSlot[]
  vehicleCount?: number
  staffCount?: number
  images?: string[]
  description?: string
}
