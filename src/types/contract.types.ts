export interface ContractPreview {
  bookingId: number
  contractStatus: string
  termsVersion: string
  termsContent: string
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  vehicleTitle: string
  vehicleListingId: string
  branchName: string
  bookingDate: string
  timeSlot: string
  signatureUrl: string | null
  idCardUrl: string | null
  licenseUrl: string | null
  contentSha256: string | null
  signedAt: string | null
  expiresAt: string | null
}

export interface CompleteContractRequest {
  agreed: boolean
  signatureType: 'draw' | 'type' | 'upload'
  signatureUrl: string
  idCardUrl?: string
  licenseUrl?: string
}

export interface CloudinarySignedUpload {
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  publicId: string | null
  overwrite: boolean
  uploadUrl: string
  resourceType: string
}

export interface DocumentSessionResponse {
  sessionId: string
  purpose: string
  status: string
  qrUrl?: string
  fileUrl?: string
  expiresAt: string
}
