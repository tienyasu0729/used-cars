import { api } from './apiClient'

export type CatalogPageMeta = {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type AdminCatalogBrandRow = {
  id: string
  name: string
  slug: string
  vehicleCount: number
  status: string
}

export type AdminCatalogModelRow = {
  id: string
  name: string
  brandId: string
  vehicleCount: number
  status: string
}

export type AdminCatalogBrandsPage = {
  content: AdminCatalogBrandRow[]
  meta: CatalogPageMeta
}

export type AdminCatalogModelsPage = {
  content: AdminCatalogModelRow[]
  meta: CatalogPageMeta
}

export type AdminCatalogTypedOption = {
  id: number
  name: string
  status: string
  vehicleCount: number
}

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return (raw as { data: T }).data
  }
  return raw as T
}

export async function fetchAdminCatalogBrands(
  q: string,
  page: number,
  size: number,
): Promise<AdminCatalogBrandsPage> {
  const res = await api.get<unknown>('/admin/catalog/brands', {
    params: { q: q.trim() || undefined, page, size },
  })
  const d = unwrap<AdminCatalogBrandsPage>(res.data)
  return {
    content: Array.isArray(d?.content) ? d.content : [],
    meta: d?.meta ?? { page: 0, size, totalElements: 0, totalPages: 0 },
  }
}

export async function fetchAdminCatalogModels(
  q: string,
  categoryId: number | undefined,
  page: number,
  size: number,
): Promise<AdminCatalogModelsPage> {
  const res = await api.get<unknown>('/admin/catalog/models', {
    params: {
      q: q.trim() || undefined,
      categoryId: categoryId != null && categoryId > 0 ? categoryId : undefined,
      page,
      size,
    },
  })
  const d = unwrap<AdminCatalogModelsPage>(res.data)
  return {
    content: Array.isArray(d?.content) ? d.content : [],
    meta: d?.meta ?? { page: 0, size, totalElements: 0, totalPages: 0 },
  }
}

export async function fetchFuelTypes(): Promise<AdminCatalogTypedOption[]> {
  const res = await api.get<unknown>('/admin/catalog/fuel-types')
  const d = unwrap<AdminCatalogTypedOption[]>(res.data)
  return Array.isArray(d) ? d : []
}

export async function fetchTransmissions(): Promise<AdminCatalogTypedOption[]> {
  const res = await api.get<unknown>('/admin/catalog/transmissions')
  const d = unwrap<AdminCatalogTypedOption[]>(res.data)
  return Array.isArray(d) ? d : []
}

export async function createCatalogBrand(body: { name: string; status: string }): Promise<AdminCatalogBrandRow> {
  const res = await api.post<unknown>('/admin/catalog/brands', body)
  return unwrap<AdminCatalogBrandRow>(res.data)
}

export async function updateCatalogBrand(
  id: number,
  body: { name: string; status: string },
): Promise<void> {
  await api.put(`/admin/catalog/brands/${id}`, body)
}

export async function createCatalogModel(body: {
  categoryId: number
  name: string
  status: string
}): Promise<AdminCatalogModelRow> {
  const res = await api.post<unknown>('/admin/catalog/models', body)
  const raw = unwrap<Record<string, unknown>>(res.data)
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    brandId: String(raw.brandId ?? ''),
    vehicleCount: Number(raw.vehicleCount ?? 0),
    status: String(raw.status ?? 'active'),
  }
}

export async function updateCatalogModel(id: number, body: { name: string; status: string }): Promise<void> {
  await api.put(`/admin/catalog/models/${id}`, body)
}

export async function createFuelType(name: string): Promise<AdminCatalogTypedOption> {
  const res = await api.post<unknown>('/admin/catalog/fuel-types', { name })
  return unwrap<AdminCatalogTypedOption>(res.data)
}

export async function createTransmission(name: string): Promise<AdminCatalogTypedOption> {
  const res = await api.post<unknown>('/admin/catalog/transmissions', { name })
  return unwrap<AdminCatalogTypedOption>(res.data)
}

export async function updateCatalogFuelType(id: number, body: { name: string; status: string }): Promise<void> {
  await api.put(`/admin/catalog/fuel-types/${id}`, body)
}

export async function updateCatalogTransmission(id: number, body: { name: string; status: string }): Promise<void> {
  await api.put(`/admin/catalog/transmissions/${id}`, body)
}
