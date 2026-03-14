import { api } from './apiClient'
import {
  mockAdminUsers,
  mockAdminTransfers,
  mockAdminBranches,
  mockAdminRoles,
  mockCatalogBrands,
  mockCatalogModels,
  mockCatalogColors,
  mockCatalogFuelTypes,
  mockCatalogTransmissions,
} from '@/mock/mockAdminData'
import type { AdminUser, AdminBranch, AdminTransfer, AdminRole, RolePermission } from '@/mock/mockAdminData'
import type { CatalogBrand, CatalogModel, CatalogColor, CatalogFuelType, CatalogTransmission } from '@/mock/mockAdminData'
import { isMockMode } from '@/config/dataSource'

export const adminApi = {
  async updateUser(id: string, data: Partial<AdminUser>) {
    if (isMockMode()) {
      const u = mockAdminUsers.find((x) => x.id === id)
      if (u) Object.assign(u, data)
      return u
    }
    const res = await api.put<AdminUser>(`/admin/users/${id}`, data)
    return res.data
  },
  async approveTransfer(id: string, note?: string) {
    if (isMockMode()) {
      const t = mockAdminTransfers.find((x) => x.id === id)
      if (t) t.status = 'approved'
      return t
    }
    const res = await api.post<AdminTransfer>(`/admin/transfers/${id}/approve`, { approved: true, note })
    return res.data
  },
  async rejectTransfer(id: string, reason: string) {
    if (isMockMode()) {
      const t = mockAdminTransfers.find((x) => x.id === id)
      if (t) t.status = 'rejected'
      return t
    }
    const res = await api.post<AdminTransfer>(`/admin/transfers/${id}/approve`, { approved: false, note: reason })
    return res.data
  },
  async createRole(data: { name: string; description?: string; permissions?: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean; approve: boolean }> }) {
    if (isMockMode()) {
      const defaultPerms = { view: false, create: false, edit: false, delete: false, approve: false }
      const r: AdminRole = {
        id: `r${mockAdminRoles.length + 1}`,
        name: data.name,
        description: data.description ?? '',
        userCount: 0,
        permissions: data.permissions ?? { inventory: defaultPerms, leads: defaultPerms, financial: defaultPerms, marketing: defaultPerms, users: defaultPerms, settings: defaultPerms },
      }
      mockAdminRoles.push(r)
      return r
    }
    const res = await api.post<AdminRole>('/admin/roles', data)
    return res.data
  },
  async updateRole(id: string, data: { permissions?: Record<string, RolePermission> }) {
    if (isMockMode()) {
      const r = mockAdminRoles.find((x) => x.id === id)
      if (r && data.permissions) r.permissions = data.permissions
      return r
    }
    const res = await api.put<AdminRole>(`/admin/roles/${id}`, data)
    return res.data
  },
  async createBranch(data: { name: string; address: string; phone: string; manager: string; workingHours?: string }): Promise<AdminBranch> {
    if (isMockMode()) {
      const b: AdminBranch = {
        id: `branch${mockAdminBranches.length + 1}`,
        name: data.name,
        manager: data.manager,
        address: data.address,
        phone: data.phone,
        status: 'active',
        vehicleCount: 0,
        staffCount: 0,
      }
      mockAdminBranches.push(b)
      return b
    }
    const res = await api.post<AdminBranch>('/admin/branches', data)
    return res.data
  },
  async createCatalogBrand(data: Omit<CatalogBrand, 'id' | 'vehicleCount'>) {
    if (isMockMode()) {
      const b: CatalogBrand = {
        ...data,
        id: `b${mockCatalogBrands.length + 1}`,
        vehicleCount: 0,
      }
      mockCatalogBrands.push(b)
      return b
    }
    const res = await api.post<CatalogBrand>('/admin/catalog/brands', data)
    return res.data
  },
  async createCatalogModel(data: Omit<CatalogModel, 'id' | 'vehicleCount'>) {
    if (isMockMode()) {
      const m: CatalogModel = {
        ...data,
        id: `m${mockCatalogModels.length + 1}`,
        vehicleCount: 0,
      }
      mockCatalogModels.push(m)
      return m
    }
    const res = await api.post<CatalogModel>('/admin/catalog/models', data)
    return res.data
  },
  async createCatalogColor(data: Omit<CatalogColor, 'id' | 'vehicleCount'>) {
    if (isMockMode()) {
      const c: CatalogColor = {
        ...data,
        id: `c${mockCatalogColors.length + 1}`,
        vehicleCount: 0,
      }
      mockCatalogColors.push(c)
      return c
    }
    const res = await api.post<CatalogColor>('/admin/catalog/colors', data)
    return res.data
  },
  async createCatalogFuelType(data: Omit<CatalogFuelType, 'id' | 'vehicleCount'>) {
    if (isMockMode()) {
      const f: CatalogFuelType = {
        ...data,
        id: `f${mockCatalogFuelTypes.length + 1}`,
        vehicleCount: 0,
      }
      mockCatalogFuelTypes.push(f)
      return f
    }
    const res = await api.post<CatalogFuelType>('/admin/catalog/fuel-types', data)
    return res.data
  },
  async createCatalogTransmission(data: Omit<CatalogTransmission, 'id' | 'vehicleCount'>) {
    if (isMockMode()) {
      const t: CatalogTransmission = {
        ...data,
        id: `tx${mockCatalogTransmissions.length + 1}`,
        vehicleCount: 0,
      }
      mockCatalogTransmissions.push(t)
      return t
    }
    const res = await api.post<CatalogTransmission>('/admin/catalog/transmissions', data)
    return res.data
  },
  updateCatalogBrand(id: string, data: Partial<CatalogBrand>) {
    if (isMockMode()) {
      const b = mockCatalogBrands.find((x) => x.id === id)
      if (b) Object.assign(b, data)
      return Promise.resolve(b)
    }
    return api.put<CatalogBrand>(`/admin/catalog/brands/${id}`, data).then((r) => r.data)
  },
  async deleteCatalogBrand(id: string): Promise<void> {
    if (isMockMode()) {
      const i = mockCatalogBrands.findIndex((x) => x.id === id)
      if (i >= 0) mockCatalogBrands.splice(i, 1)
      return
    }
    await api.delete(`/admin/catalog/brands/${id}`)
  },
  async uploadCatalogBrandLogo(brandId: string, file: File): Promise<{ logoUrl: string }> {
    if (isMockMode()) {
      const url = URL.createObjectURL(file)
      const b = mockCatalogBrands.find((x) => x.id === brandId)
      if (b) b.logoUrl = url
      return { logoUrl: url }
    }
    const formData = new FormData()
    formData.append('logo', file)
    const res = await api.post<{ logoUrl: string }>(`/admin/catalog/brands/${brandId}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
  async deleteCatalogModel(id: string): Promise<void> {
    if (isMockMode()) {
      const i = mockCatalogModels.findIndex((x) => x.id === id)
      if (i >= 0) mockCatalogModels.splice(i, 1)
      return
    }
    await api.delete(`/admin/catalog/models/${id}`)
  },
  async deleteCatalogColor(id: string): Promise<void> {
    if (isMockMode()) {
      const i = mockCatalogColors.findIndex((x) => x.id === id)
      if (i >= 0) mockCatalogColors.splice(i, 1)
      return
    }
    await api.delete(`/admin/catalog/colors/${id}`)
  },
  async deleteCatalogFuelType(id: string): Promise<void> {
    if (isMockMode()) {
      const i = mockCatalogFuelTypes.findIndex((x) => x.id === id)
      if (i >= 0) mockCatalogFuelTypes.splice(i, 1)
      return
    }
    await api.delete(`/admin/catalog/fuel-types/${id}`)
  },
  async deleteCatalogTransmission(id: string): Promise<void> {
    if (isMockMode()) {
      const i = mockCatalogTransmissions.findIndex((x) => x.id === id)
      if (i >= 0) mockCatalogTransmissions.splice(i, 1)
      return
    }
    await api.delete(`/admin/catalog/transmissions/${id}`)
  },
}
