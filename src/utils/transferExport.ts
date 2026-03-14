import type { ManagerTransfer } from '@/mock/mockManagerData'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ Duyệt',
  approved: 'Đã Duyệt',
  rejected: 'Từ Chối',
}

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

export function exportTransfersToCsv(
  transfers: ManagerTransfer[],
  type: 'outgoing' | 'incoming'
): void {
  const cols =
    type === 'outgoing'
      ? ['Mã Yêu Cầu', 'Phương Tiện', 'VIN', 'Đến Chi Nhánh', 'Khu Vực', 'Ngày Yêu Cầu', 'Trạng Thái']
      : ['Mã Yêu Cầu', 'Phương Tiện', 'VIN', 'Từ Chi Nhánh', 'Ngày Yêu Cầu', 'Trạng Thái']
  const rows = transfers.map((t) => {
    const status = STATUS_LABEL[t.status] ?? t.status
    if (type === 'outgoing') {
      return [
        t.id,
        t.vehicleName,
        t.vin ?? '',
        t.toBranchName,
        t.toBranchRegion ?? '',
        t.createdAt,
        status,
      ]
    }
    return [
      t.id,
      t.vehicleName,
      t.vin ?? '',
      t.fromBranchName,
      t.createdAt,
      status,
    ]
  })
  const header = cols.join(',')
  const body = rows.map((r) => r.map(escapeCsv).join(',')).join('\n')
  const csv = '\uFEFF' + header + '\n' + body
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `yeu-cau-dieu-chuyen-${type}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
