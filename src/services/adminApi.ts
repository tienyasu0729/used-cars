import { api } from './apiClient'
import { asApiArray } from '@/utils/asApiArray'
import type { AdminPermissionRow } from '@/types/admin.types'

export type UpdateAdminUserBody = {
  name: string
  phone: string | null
  role: string
  branchId: number | null
  status: string
}

export type CreateAdminUserBody = {
  name: string
  email: string
  phone?: string
  password: string
  role: string
  branchId?: number | null
}

export type UpdateAdminBranchBody = {
  name: string
  address: string
  phone: string | null
  status: string
}

export const adminApi = {
  async listPermissions(): Promise<AdminPermissionRow[]> {
    const res = await api.get<unknown>('/admin/permissions')
    return asApiArray<AdminPermissionRow>(res.data)
  },

  async updateUser(id: string, body: UpdateAdminUserBody): Promise<void> {
    await api.put(`/admin/users/${id}`, body)
  },

  async createUser(body: CreateAdminUserBody): Promise<{ id: number }> {
    const res = await api.post<unknown>('/admin/users', body)
    const b = res.data as { data?: { id?: number } }
    const id = b.data?.id
    if (id == null) throw new Error('Tạo user thất bại')
    return { id }
  },

  async patchUserStatus(id: string, body: { status: string; reason?: string }): Promise<void> {
    await api.patch(`/admin/users/${id}/status`, body)
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`)
  },

  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    const res = await api.post<unknown>(`/admin/users/${id}/reset-password`)
    const b = res.data as { data?: { temporaryPassword?: string } }
    const temp = b.data?.temporaryPassword
    if (!temp) throw new Error('Không nhận được mật khẩu tạm')
    return { temporaryPassword: temp }
  },

  async createRole(body: { name: string; permissionIds: number[] }): Promise<{ id: number; name: string }> {
    const res = await api.post<unknown>('/admin/roles', body)
    const b = res.data as { data?: { id?: number; name?: string } }
    const d = b.data
    if (d?.id == null) throw new Error('Tạo vai trò thất bại')
    return { id: d.id, name: String(d.name ?? '') }
  },

  async updateRole(id: string, body: { name: string; permissionIds: number[] }): Promise<void> {
    await api.put(`/admin/roles/${id}`, body)
  },

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/admin/roles/${id}`)
  },

  async createBranch(body: {
    name: string
    address: string
    phone?: string
    managerId?: number
  }): Promise<void> {
    await api.post('/admin/branches', body)
  },

  async updateBranch(id: string, body: UpdateAdminBranchBody): Promise<void> {
    await api.put(`/admin/branches/${id}`, body)
  },

  async deleteBranch(id: string): Promise<void> {
    await api.delete(`/admin/branches/${id}`)
  },
}
