export interface MockTransferRequest {
  id: string
  vehicleId: string
  vehicleName: string
  fromBranchId: string
  toBranchId: string
  requestedBy: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export const mockTransferRequests: MockTransferRequest[] = [
  {
    id: 't1',
    vehicleId: 'v1',
    vehicleName: 'Toyota Camry 2.5Q 2023',
    fromBranchId: 'branch1',
    toBranchId: 'branch2',
    requestedBy: 'u2',
    status: 'pending',
    createdAt: '2025-03-14T09:00:00Z',
  },
]
