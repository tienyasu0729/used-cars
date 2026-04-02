/** Báo cáo chi nhánh — chờ API Tier báo cáo; hiện dùng empty state. */
export interface BranchReportData {
  monthlyRevenue: number[]
  salesByBrand: { brand: string; count: number }[]
  topVehicles: { name: string; sold: number; revenue: number; image?: string }[]
}

export const EMPTY_BRANCH_REPORTS: BranchReportData = {
  monthlyRevenue: [],
  salesByBrand: [],
  topVehicles: [],
}
