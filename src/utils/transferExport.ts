import type { TransferRequest, TransferStatus } from '@/types/transfer.types'
import { downloadExcel } from '@/utils/excelExport'

const STATUS_LABEL: Record<TransferStatus, string> = {
  Pending: 'Chờ duyệt',
  Approved: 'Đã duyệt',
  Rejected: 'Từ chối',
  Completed: 'Hoàn thành',
}

/** Xuất Excel từ dữ liệu API TransferRequest. */
export function exportTransfersToExcel(
  transfers: TransferRequest[],
  type: 'outgoing' | 'incoming',
): void {
  const headers =
    type === 'outgoing'
      ? ['Mã Yêu Cầu', 'Phương Tiện', 'Mã tin', 'Đến Chi Nhánh', 'Ngày Yêu Cầu', 'Trạng Thái']
      : ['Mã Yêu Cầu', 'Phương Tiện', 'Mã tin', 'Từ Chi Nhánh', 'Ngày Yêu Cầu', 'Trạng Thái']
  const rows = transfers.map((t) => {
    const status = STATUS_LABEL[t.status] ?? t.status
    if (type === 'outgoing') {
      return [String(t.id), t.vehicleTitle, t.vehicleListingId, t.toBranchName, t.createdAt, status]
    }
    return [String(t.id), t.vehicleTitle, t.vehicleListingId, t.fromBranchName, t.createdAt, status]
  })
  const filename = `yeu-cau-dieu-chuyen-${type}-${new Date().toISOString().slice(0, 10)}.xlsx`
  downloadExcel(filename, headers, rows, 'Điều chuyển')
}
