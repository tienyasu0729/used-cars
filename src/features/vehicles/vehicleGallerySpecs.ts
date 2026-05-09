/**
 * Bảng thông số giống tab "Thông Số Kỹ Thuật" trên VehicleDetailGallery —
 * dùng chung cho OrderDetailPage và (sau refactor) trang chi tiết xe.
 */
import { formatDate, formatMileage } from '@/utils/format'
import type { Vehicle } from '@/types/vehicle.types'

export type VehicleSpecRow = { label: string; value: string }

export function getVehicleGallerySpecRows(vehicle: Vehicle): VehicleSpecRow[] {
  const postingLabel =
    vehicle.posting_date != null && vehicle.posting_date !== ''
      ? Number.isNaN(new Date(vehicle.posting_date).getTime())
        ? vehicle.posting_date
        : formatDate(vehicle.posting_date)
      : '—'

  return [
    { label: 'Mã xe', value: vehicle.listing_id || '—' },
    { label: 'Hãng xe', value: vehicle.brand || '—' },
    { label: 'Dòng xe', value: vehicle.model || '—' },
    { label: 'Năm sản xuất', value: String(vehicle.year) },
    { label: 'Kiểu dáng', value: vehicle.body_style || '—' },
    { label: 'Xuất xứ', value: vehicle.origin || '—' },
    { label: 'Nhiên liệu', value: vehicle.fuel || '—' },
    { label: 'Hộp số', value: vehicle.transmission || '—' },
    { label: 'Số km đã đi', value: formatMileage(vehicle.mileage) },
    { label: 'Chi nhánh', value: vehicle.branch_name || '—' },
    { label: 'Ngày đăng tin', value: postingLabel },
    { label: 'Trạng thái', value: vehicle.status },
  ]
}

/** Các trường bổ sung — chỉ trả về dòng có dữ liệu (không lấp hàng —). */
export function getVehicleExtraSpecRows(vehicle: Vehicle): VehicleSpecRow[] {
  const rows: VehicleSpecRow[] = []
  const ver = vehicle.trim?.trim()
  if (ver) rows.push({ label: 'Phiên bản', value: ver })
  if (vehicle.engine?.trim()) rows.push({ label: 'Động cơ', value: vehicle.engine.trim() })
  if (vehicle.exteriorColor?.trim()) rows.push({ label: 'Màu ngoại thất', value: vehicle.exteriorColor.trim() })
  if (vehicle.interiorColor?.trim()) rows.push({ label: 'Màu nội thất', value: vehicle.interiorColor.trim() })
  if (vehicle.horsepower != null) rows.push({ label: 'Công suất (HP)', value: String(vehicle.horsepower) })
  if (vehicle.wheelbaseMm != null) rows.push({ label: 'Chiều dài cơ sở (mm)', value: String(vehicle.wheelbaseMm) })
  if (vehicle.airbags != null) rows.push({ label: 'Túi khí', value: String(vehicle.airbags) })
  if (vehicle.safetySystem?.trim()) rows.push({ label: 'Hệ thống an toàn', value: vehicle.safetySystem.trim() })
  return rows
}
