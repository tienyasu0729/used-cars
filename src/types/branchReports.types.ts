export interface BranchReportTopModel {
  subcategoryId: number
  modelName: string
  brandName: string
  soldCount: number
}

export interface BranchReportData {
  monthlyRevenue: number[]
  salesByBrand: { brand: string; count: number }[]
  topModels: BranchReportTopModel[]
}
