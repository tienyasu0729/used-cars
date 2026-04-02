import { api } from './apiClient'
import type {
  AdminUser,
  AdminBranch,
  AdminRole,
  RolePermission,
  CatalogBrand,
  CatalogModel,
  CatalogColor,
  CatalogFuelType,
  CatalogTransmission,
} from '@/types/admin.types'

export const adminApi = {
  async updateUser(id: string, data: Partial<AdminUser>) {
    const res = await api.put<AdminUser>(`/admin/users/${id}`, data)
    return res.data
  },
  async createRole(data: {
    name: string
    description?: string
    permissions?: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean; approve: boolean }>
  }) {
    const res = await api.post<AdminRole>('/admin/roles', data)
    return res.data
  },
  async updateRole(id: string, data: { permissions?: Record<string, RolePermission> }) {
    const res = await api.put<AdminRole>(`/admin/roles/${id}`, data)
    return res.data
  },
  async createBranch(data: {
    name: string
    address: string
    phone: string
    manager: string
    workingHours?: string
  }): Promise<AdminBranch> {
    const res = await api.post<AdminBranch>('/admin/branches', data)
    return res.data
  },
  async createCatalogBrand(data: Omit<CatalogBrand, 'id' | 'vehicleCount'>) {
    const res = await api.post<CatalogBrand>('/admin/catalog/brands', data)
    return res.data
  },
  async createCatalogModel(data: Omit<CatalogModel, 'id' | 'vehicleCount'>) {
    const res = await api.post<CatalogModel>('/admin/catalog/models', data)
    return res.data
  },
  async createCatalogColor(data: Omit<CatalogColor, 'id' | 'vehicleCount'>) {
    const res = await api.post<CatalogColor>('/admin/catalog/colors', data)
    return res.data
  },
  async createCatalogFuelType(data: Omit<CatalogFuelType, 'id' | 'vehicleCount'>) {
    const res = await api.post<CatalogFuelType>('/admin/catalog/fuel-types', data)
    return res.data
  },
  async createCatalogTransmission(data: Omit<CatalogTransmission, 'id' | 'vehicleCount'>) {
    const res = await api.post<CatalogTransmission>('/admin/catalog/transmissions', data)
    return res.data
  },
  updateCatalogBrand(id: string, data: Partial<CatalogBrand>) {
    return api.put<CatalogBrand>(`/admin/catalog/brands/${id}`, data).then((r) => r.data)
  },
  async deleteCatalogBrand(id: string): Promise<void> {
    await api.delete(`/admin/catalog/brands/${id}`)
  },
  async uploadCatalogBrandLogo(brandId: string, file: File): Promise<{ logoUrl: string }> {
    const formData = new FormData()
    formData.append('logo', file)
    const res = await api.post<{ logoUrl: string }>(`/admin/catalog/brands/${brandId}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
  async deleteCatalogModel(id: string): Promise<void> {
    await api.delete(`/admin/catalog/models/${id}`)
  },
  async deleteCatalogColor(id: string): Promise<void> {
    await api.delete(`/admin/catalog/colors/${id}`)
  },
  async deleteCatalogFuelType(id: string): Promise<void> {
    await api.delete(`/admin/catalog/fuel-types/${id}`)
  },
  async deleteCatalogTransmission(id: string): Promise<void> {
    await api.delete(`/admin/catalog/transmissions/${id}`)
  },
}
