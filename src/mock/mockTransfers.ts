export interface MockTransferRequest {
  id: string
  vehicleId: string
  vehicleCode: string
  vehicleName: string
  fromBranchId: string
  toBranchId: string
  requestedBy: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reason?: string
  notes?: string
}

export const mockTransferRequests: MockTransferRequest[] = [
  { id: 't1', vehicleId: 'v1', vehicleCode: 'VIN-2024-X5', vehicleName: 'Toyota Camry 2.5Q 2024', fromBranchId: 'branch1', toBranchId: 'branch2', requestedBy: 'u2', status: 'pending', createdAt: '2025-05-20T09:00:00Z' },
  { id: 't2', vehicleId: 'v2', vehicleCode: 'VIN-2023-M3', vehicleName: 'Honda Civic 2023', fromBranchId: 'branch3', toBranchId: 'branch1', requestedBy: 'u2', status: 'approved', createdAt: '2025-05-18T09:00:00Z' },
  { id: 't3', vehicleId: 'v4', vehicleCode: 'VIN-2024-CRV', vehicleName: 'Mazda CX-5 2024', fromBranchId: 'branch3', toBranchId: 'branch1', requestedBy: 'u2', status: 'rejected', createdAt: '2025-05-15T09:00:00Z' },
  { id: 't4', vehicleId: 'v1', vehicleCode: 'VIN-2022-CAM', vehicleName: 'Toyota Camry 2.5Q 2022', fromBranchId: 'branch2', toBranchId: 'branch1', requestedBy: 'u2', status: 'approved', createdAt: '2025-05-10T09:00:00Z' },
]
