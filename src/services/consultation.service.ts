import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'

export interface CreateConsultationPayload {
  customerName: string
  customerPhone: string
  vehicleId?: number | null
  message: string
  priority?: string | null
}

export interface ConsultationListItem {
  id: number
  customerId: number | null
  customerName: string
  customerPhone: string
  vehicleId: number | null
  vehicleTitle: string | null
  message: string
  status: string
  priority: string
  assignedStaffId: number | null
  assignedStaffName: string | null
  createdAt: string
  updatedAt: string
}

export interface ListConsultationsParams {
  status?: string
  priority?: string
  /** Admin: true = chỉ phiếu có xe, false = chỉ phiếu không xe */
  has_vehicle?: boolean
  page?: number
  size?: number
}

function unwrapList<T>(res: unknown): T[] {
  const r = res as ApiResponse<T[]>
  const raw = r?.data
  return Array.isArray(raw) ? raw : []
}

function unwrapMeta(res: unknown): Record<string, unknown> | undefined {
  const r = res as ApiResponse<unknown>
  return r?.meta && typeof r.meta === 'object' ? (r.meta as Record<string, unknown>) : undefined
}

export async function createConsultation(data: CreateConsultationPayload): Promise<{ id: number; success: boolean }> {
  const res = (await axiosInstance.post('/consultations', data)) as ApiResponse<{ id: number; success: boolean }>
  if (!res?.data || typeof res.data.id !== 'number') {
    throw new Error('Invalid create consultation response')
  }
  return res.data
}

export async function listConsultations(
  params: ListConsultationsParams = {},
): Promise<{ items: ConsultationListItem[]; meta: Record<string, unknown> | undefined }> {
  const res = await axiosInstance.get<unknown>('/consultations', {
    params: {
      status: params.status,
      priority: params.priority,
      has_vehicle: params.has_vehicle,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  })
  return { items: unwrapList<ConsultationListItem>(res), meta: unwrapMeta(res) }
}

export async function respondToConsultation(id: number): Promise<void> {
  await axiosInstance.patch(`/consultations/${id}/respond`)
}

export async function updateConsultationStatus(id: number, status: string): Promise<void> {
  await axiosInstance.patch(`/consultations/${id}/status`, { status })
}
