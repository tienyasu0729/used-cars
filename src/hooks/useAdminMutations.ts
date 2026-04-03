import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  adminApi,
  type CreateAdminUserBody,
  type UpdateAdminBranchBody,
  type UpdateAdminUserBody,
} from '@/services/adminApi'
import { transferService } from '@/services/transfer.service'

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; permissionIds: number[] }) => adminApi.createRole(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] })
    },
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name, permissionIds }: { id: string; name: string; permissionIds: number[] }) =>
      adminApi.updateRole(id, { name, permissionIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-roles'] }),
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-roles'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAdminUserBody }) => adminApi.updateUser(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAdminUserBody) => adminApi.createUser(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function usePatchUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      adminApi.patchUserStatus(id, { status, reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}

export function useResetUserPassword() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.resetPassword(id),
  })
}

export function useUpdateBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAdminBranchBody }) => adminApi.updateBranch(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-branches'] }),
  })
}

export function useDeleteBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteBranch(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-branches'] }),
  })
}

export function useApproveTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => transferService.approveTransfer(id, { note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-transfers'] })
      qc.invalidateQueries({ queryKey: ['manager-transfers'] })
    },
  })
}

export function useRejectTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => transferService.rejectTransfer(id, { note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-transfers'] })
      qc.invalidateQueries({ queryKey: ['manager-transfers'] })
    },
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
