import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  adminApi,
  type CreateAdminUserBody,
  type UpdateAdminBranchBody,
  type UpdateAdminUserBody,
} from '@/services/adminApi'
import {
  createCatalogBrand,
  createCatalogModel,
  createFuelType,
  createTransmission,
  updateCatalogBrand,
  updateCatalogFuelType,
  updateCatalogModel,
  updateCatalogTransmission,
} from '@/services/adminCatalog.service'
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

export function useUpdateCatalogModel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name, status }: { id: number; name: string; status: string }) =>
      updateCatalogModel(id, { name, status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog-models'] }),
  })
}

export function useCreateCatalogBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; status: string }) => createCatalogBrand(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog-brands'] }),
  })
}

export function useUpdateCatalogBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name: string; status: string } }) =>
      updateCatalogBrand(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog-brands'] }),
  })
}

export function useCreateCatalogModel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { categoryId: number; name: string; status: string }) => createCatalogModel(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog-models'] }),
  })
}

export function useCreateFuelType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createFuelType(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog-fuel-types'] }),
  })
}

export function useCreateTransmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createTransmission(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog-transmissions'] }),
  })
}

export function useUpdateCatalogFuelType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name: string; status: string } }) =>
      updateCatalogFuelType(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog-fuel-types'] }),
  })
}

export function useUpdateCatalogTransmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name: string; status: string } }) =>
      updateCatalogTransmission(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-catalog-transmissions'] }),
  })
}

