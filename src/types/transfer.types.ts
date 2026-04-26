/**
 * Tier 3.3 — Điều chuyển xe (map backend camelCase, status PascalCase như DB CHECK).
 */

export type TransferStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed'

export interface TransferApprovalHistoryItem {
  approvedBy: number
  approvedByName: string
  action: 'Approved' | 'Rejected'
  note: string | null
  /** ISO string từ Instant */
  actedAt: string
}

export interface TransferRequest {
  id: number
  vehicleId: number
  vehicleTitle: string
  vehicleListingId: string
  fromBranchId: number
  fromBranchName: string
  toBranchId: number
  toBranchName: string
  requestedBy: number
  requestedByName: string
  status: TransferStatus
  reason: string | null
  createdAt: string
  updatedAt: string
  approvalHistory?: TransferApprovalHistoryItem[]
}

export interface CreateTransferPayload {
  vehicleId: number
  toBranchId: number
  reason?: string
}

export interface TransferNotePayload {
  note: string
}

export interface TransferCompletePayload {
  note?: string
}
