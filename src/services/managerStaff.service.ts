/**
 * API quản lý nhân viên (Admin / BranchManager) — khớp backend ManagerStaffController.
 */
import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'

export interface StaffListItemDto {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
  branchId: number | null
  branchName: string
  status: string
  createdAt: string
  /** Soft delete — vẫn trong danh sách chi nhánh, không đăng nhập được. */
  deleted?: boolean
}

export interface CreateStaffRequestBody {
  name: string
  email: string
  phone: string
  password: string
  branchId: number
}

export interface UpdateStaffBody {
  name: string
  phone: string
}

export interface UpdateStaffStatusBody {
  status: 'active' | 'inactive'
}

/** Lịch sử làm việc tại các chi nhánh (bảng StaffAssignments). */
export interface StaffAssignmentItemDto {
  id: number
  branchId: number
  branchName: string
  startDate: string
  endDate: string | null
  active: boolean
}

export interface TransferStaffBody {
  branchId: number
  /** yyyy-mm-dd */
  startDate: string
}

function unwrapData<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as ApiResponse<T>).data !== undefined) {
    return (res as ApiResponse<T>).data as T
  }
  return res as T
}

export const managerStaffService = {
  async list(branchId?: number): Promise<StaffListItemDto[]> {
    const res = await axiosInstance.get<unknown>('/manager/staff', {
      params: branchId != null ? { branchId } : undefined,
    })
    const data = unwrapData<StaffListItemDto[]>(res)
    return Array.isArray(data) ? data : []
  },

  /** Alias theo spec tích hợp — cùng `list`. */
  getStaffList(branchId?: number) {
    return managerStaffService.list(branchId)
  },

  async create(body: CreateStaffRequestBody): Promise<StaffListItemDto> {
    const res = await axiosInstance.post<unknown>('/manager/staff', body)
    return unwrapData<StaffListItemDto>(res)
  },

  async update(id: number, body: UpdateStaffBody): Promise<StaffListItemDto> {
    const res = await axiosInstance.put<unknown>(`/manager/staff/${id}`, body)
    return unwrapData<StaffListItemDto>(res)
  },

  createStaff(body: CreateStaffRequestBody) {
    return managerStaffService.create(body)
  },

  async updateStatus(id: number, body: UpdateStaffStatusBody): Promise<void> {
    await axiosInstance.patch<unknown>(`/manager/staff/${id}/status`, body)
  },

  toggleStaffStatus(id: number, body: UpdateStaffStatusBody) {
    return managerStaffService.updateStatus(id, body)
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete<unknown>(`/manager/staff/${id}`)
  },

  async restore(id: number, body?: { branchId?: number }): Promise<StaffListItemDto> {
    const res = await axiosInstance.post<unknown>(`/manager/staff/${id}/restore`, body ?? {})
    return unwrapData<StaffListItemDto>(res)
  },

  deleteStaff(id: number) {
    return managerStaffService.delete(id)
  },

  updateStaff(id: number, body: UpdateStaffBody) {
    return managerStaffService.update(id, body)
  },

  async listAssignments(id: number): Promise<StaffAssignmentItemDto[]> {
    const res = await axiosInstance.get<unknown>(`/manager/staff/${id}/assignments`)
    const data = unwrapData<StaffAssignmentItemDto[]>(res)
    return Array.isArray(data) ? data : []
  },

  async transfer(id: number, body: TransferStaffBody): Promise<StaffAssignmentItemDto> {
    const res = await axiosInstance.post<unknown>(`/manager/staff/${id}/assignments`, body)
    return unwrapData<StaffAssignmentItemDto>(res)
  },
}
