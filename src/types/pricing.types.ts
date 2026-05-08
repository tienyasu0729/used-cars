export type PricingDeclaredGroup =
  | 'front'
  | 'rear'
  | 'left_side'
  | 'right_side'
  | 'interior_front'
  | 'interior_rear'
  | 'dashboard'
  | 'odometer'
  | 'engine_bay'
  | 'tire'
  | 'damage_detail'
  | 'document'
  | 'other'

export interface ManagerPricingImageAssetInput {
  url: string
  publicId?: string | null
  source?: 'cloudinary'
  declaredGroup: PricingDeclaredGroup
  caption?: string | null
  captionBy?: string | null
  captionType?: string | null
}

export interface ManagerPricingVehicleInput {
  title: string
  categoryId: number
  subcategoryId: number
  year: number
  mileage: number
  fuel: string
  transmission: string
  bodyStyle?: string | null
  origin?: string | null
  description?: string | null
}

export interface ManagerPricingEstimateRequest {
  branchId: number
  vehicleInput: ManagerPricingVehicleInput
  imageAssets: ManagerPricingImageAssetInput[]
}

export interface ManagerPricingEstimateResponse {
  valuationId?: string
  resultType?: string
  resultFlags?: string[]
  confidence?: number
  confidenceLabel?: string
  confidenceWarnings?: string[]
  businessWarnings?: string[]
  internalDiagnostics?: string[]
  vehicleUnderstanding?: {
    detectedVariant?: string | null
    taxonomyWarning?: string | null
  }
  marketSellingPrice?: {
    suggestedPrice?: number | null
    minPrice?: number | null
    maxPrice?: number | null
    label?: string
  }
  fairPrice?: {
    suggestedPrice?: number | null
    rawSuggestedPrice?: number | null
    range?: { min?: number | null; max?: number | null }
    label?: string
    roundingStep?: number | null
    roundingNote?: string | null
  }
  purchasePrice?: {
    suggestedPrice?: number | null
    rawSuggestedPrice?: number | null
    minPrice?: number | null
    maxPrice?: number | null
    label?: string
    roundingStep?: number | null
    roundingNote?: string | null
  }
  marketStats?: {
    similarListingsUsed?: number
    effectiveSampleSize?: number
    weightedMedianPrice?: number | null
  }
  marketSearch?: {
    selectedAttemptLevel?: number
  }
  topComparablesUsed?: Array<{
    listingId?: string
    title?: string
    price?: number
    similarityScore?: number
    weight?: number
    warnings?: string[]
  }>
  imageCaptionAnalysis?: {
    captionProvidedCount?: number
    captionHelpedResolveGroups?: number
    captionConfirmedFindings?: number
    captionConflicts?: number
    captionOnlyClaims?: Array<{
      publicId?: string
      claim?: string
      status?: string
    }>
  }
  expertExplanation?: {
    summary?: string
    marketReasoning?: string[]
    conditionReasoning?: string[]
    purchaseReasoning?: string[]
    limitations?: string[]
    recommendedNextActions?: string[]
  }
}

export interface ImportedVehicleImageRow {
  fileName: string
  declaredGroup: PricingDeclaredGroup
  caption?: string | null
  captionBy?: string | null
  captionType?: string | null
}

export interface ImportedVehiclePricingPayload {
  vehicleInput: ManagerPricingVehicleInput
  images: ImportedVehicleImageRow[]
}

export interface ImportValidationIssue {
  level: 'error' | 'warning'
  message: string
}

export type UsedCarPurchaseRequestStatus =
  | 'PendingApproval'
  | 'Approved'
  | 'Rejected'
  | 'Paid'
  | 'ConvertedToInventory'

export interface UsedCarPurchaseRequestSummary {
  id: number
  branchId: number
  requestedBy?: number | null
  requestedByName?: string | null
  status: UsedCarPurchaseRequestStatus
  requestedPurchasePrice: number
  approvedPurchasePrice?: number | null
  managerNote?: string | null
  adminNote?: string | null
  approvedBy?: number | null
  approvedByName?: string | null
  approvedAt?: string | null
  paidBy?: number | null
  paidByName?: string | null
  paidAt?: string | null
  createdVehicleId?: number | null
  createdAt: string
  updatedAt: string
  vehicleTitle?: string | null
  primaryImageUrl?: string | null
}

export interface UsedCarPurchaseRequestDetail extends UsedCarPurchaseRequestSummary {
  vehicleSnapshot?: Record<string, unknown> | null
  imageSnapshot?: Array<Record<string, unknown>> | null
  valuationSnapshot?: Record<string, unknown> | null
}

export interface UsedCarPurchaseRequestListResponse {
  items: UsedCarPurchaseRequestSummary[]
  meta: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

export interface CreateUsedCarPurchaseRequestPayload {
  branchId: number
  vehicleInput: ManagerPricingVehicleInput
  imageAssets: ManagerPricingImageAssetInput[]
  valuationSnapshot: ManagerPricingEstimateResponse
  requestedPurchasePrice: number
  managerNote?: string | null
}

export interface ApproveUsedCarPurchaseRequestPayload {
  approvedPurchasePrice: number
  adminNote?: string | null
}

export interface RejectUsedCarPurchaseRequestPayload {
  adminNote: string
}
