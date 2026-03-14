import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services/adminApi'
import type { AdminUser } from '@/mock/mockAdminData'

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-roles'] }),
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean; approve: boolean }> }) =>
      adminApi.updateRole(id, { permissions }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-roles'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) => adminApi.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function useApproveTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => adminApi.approveTransfer(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-transfers'] }),
  })
}

export function useRejectTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectTransfer(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-transfers'] }),
  })
}

export function useCreateBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createBranch,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-branches'] }),
  })
}

export function useCreateCatalogBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createCatalogBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })
}

export function useCreateCatalogModel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createCatalogModel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })
}

export function useCreateCatalogColor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createCatalogColor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })
}

export function useCreateCatalogFuelType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createCatalogFuelType,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })
}

export function useCreateCatalogTransmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.createCatalogTransmission,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })
}

export function useUpdateCatalogBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminApi.updateCatalogBrand(id, data as Parameters<typeof adminApi.updateCatalogBrand>[1]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })
}

export function useDeleteCatalogBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.deleteCatalogBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })
}

export function useUploadCatalogBrandLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ brandId, file }: { brandId: string; file: File }) =>
      adminApi.uploadCatalogBrandLogo(brandId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })
}

export function useDeleteCatalogModel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.deleteCatalogModel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })
}

export function useDeleteCatalogColor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.deleteCatalogColor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })
}

export function useDeleteCatalogFuelType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.deleteCatalogFuelType,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })
}

export function useDeleteCatalogTransmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminApi.deleteCatalogTransmission,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog'] }),
  })
}
