import { useState } from 'react'
import { Plus, Building2, Car, Fuel, Settings2, Palette, Trash2 } from 'lucide-react'
import { useCatalog } from '@/hooks/useCatalog'
import {
  useCreateCatalogBrand,
  useCreateCatalogModel,
  useCreateCatalogColor,
  useCreateCatalogFuelType,
  useCreateCatalogTransmission,
  useUpdateCatalogBrand,
  useUploadCatalogBrandLogo,
  useDeleteCatalogBrand,
  useDeleteCatalogModel,
  useDeleteCatalogColor,
  useDeleteCatalogFuelType,
  useDeleteCatalogTransmission,
} from '@/hooks/useAdminMutations'
import { CatalogBrandsBlock } from '@/features/admin/components/CatalogBrandsBlock'
import { CatalogItemModal } from '@/features/admin/components/CatalogItemModal'
import { Button } from '@/components/ui'
import { BarChart3, Database, RefreshCw } from 'lucide-react'

const TABS = [
  { key: 'brands', label: 'Hãng Xe', icon: Building2 },
  { key: 'models', label: 'Dòng Xe', icon: Car },
  { key: 'fuelTypes', label: 'Nhiên Liệu', icon: Fuel },
  { key: 'transmissions', label: 'Hộp Số', icon: Settings2 },
  { key: 'colors', label: 'Màu Xe', icon: Palette },
] as const

type CatalogTab = (typeof TABS)[number]['key']

export function AdminCatalogPage() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('brands')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)
  const { categories, isLoadingCategories } = useCatalog()

  const catalog = {
    brands: categories.map((c) => ({
      id: String(c.id),
      name: c.name,
      slug: c.name?.toLowerCase().replace(/\s+/g, '-') ?? '',
      status: 'active' as const,
      vehicleCount: 0,
    })),
    models: [] as Record<string, unknown>[],
    colors: [] as Record<string, unknown>[],
    fuelTypes: [] as Record<string, unknown>[],
    transmissions: [] as Record<string, unknown>[],
  }
  const isLoading = isLoadingCategories

  const createBrand = useCreateCatalogBrand()
  const createModel = useCreateCatalogModel()
  const createColor = useCreateCatalogColor()
  const createFuelType = useCreateCatalogFuelType()
  const createTransmission = useCreateCatalogTransmission()
  const updateBrand = useUpdateCatalogBrand()
  const uploadLogo = useUploadCatalogBrandLogo()
  const deleteBrand = useDeleteCatalogBrand()
  const deleteModel = useDeleteCatalogModel()
  const deleteColor = useDeleteCatalogColor()
  const deleteFuelType = useDeleteCatalogFuelType()
  const deleteTransmission = useDeleteCatalogTransmission()

  const brands = catalog?.brands ?? []
  const models = catalog?.models ?? []
  const colors = catalog?.colors ?? []
  const fuelTypes = catalog?.fuelTypes ?? []
  const transmissions = catalog?.transmissions ?? []

  const getTableData = () => {
    if (activeTab === 'brands') return brands
    if (activeTab === 'models') return models
    if (activeTab === 'colors') return colors
    if (activeTab === 'fuelTypes') return fuelTypes
    return transmissions
  }

  const data = getTableData()
  const showSlug = activeTab === 'brands'
  const showHex = activeTab === 'colors'
  const totalBrands = brands.length
  const totalItems = brands.length + models.length + colors.length + fuelTypes.length + transmissions.length

  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (editItem && activeTab === 'brands') {
      await updateBrand.mutateAsync({ id: String(editItem.id), data: formData })
      return
    }
    if (editItem) return
    if (activeTab === 'brands') {
      await createBrand.mutateAsync({
        name: String(formData.name),
        slug: String(formData.slug ?? ''),
        status: (formData.status as 'active' | 'inactive') ?? 'active',
      })
    } else if (activeTab === 'models') {
      await createModel.mutateAsync({
        name: String(formData.name),
        brandId: String(formData.brandId ?? ''),
        status: (formData.status as 'active' | 'inactive') ?? 'active',
      })
    } else if (activeTab === 'colors') {
      await createColor.mutateAsync({
        name: String(formData.name),
        hex: String(formData.hex ?? '#000000'),
        status: (formData.status as 'active' | 'inactive') ?? 'active',
      })
    } else if (activeTab === 'transmissions') {
      await createTransmission.mutateAsync({
        name: String(formData.name),
        status: (formData.status as 'active' | 'inactive') ?? 'active',
      })
    } else {
      await createFuelType.mutateAsync({
        name: String(formData.name),
        status: (formData.status as 'active' | 'inactive') ?? 'active',
      })
    }
  }

  const openAdd = () => {
    setEditItem(null)
    setModalOpen(true)
  }

  const openEdit = (row: Record<string, unknown>) => {
    setEditItem(row)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa mục này?')) return
    if (activeTab === 'models') await deleteModel.mutateAsync(id)
    else if (activeTab === 'colors') await deleteColor.mutateAsync(id)
    else if (activeTab === 'fuelTypes') await deleteFuelType.mutateAsync(id)
    else if (activeTab === 'transmissions') await deleteTransmission.mutateAsync(id)
  }

  const showModal = modalOpen

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Danh Mục Xe</h2>
          <p className="mt-1 text-sm text-slate-500">Quản lý dữ liệu chính bao gồm nhãn hiệu, kiểu xe và thông số kỹ thuật</p>
        </div>
        <Button variant="primary" onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mục mới
        </Button>
      </div>
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? 'border-[#1A3C6E] text-[#1A3C6E]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>
      {activeTab === 'brands' && (
        <CatalogBrandsBlock
          brands={brands}
          onQuickSave={async (d) => {
            if (!d.name) return
            const created = await createBrand.mutateAsync({
              name: d.name,
              slug: d.slug || d.name.toLowerCase().replace(/\s+/g, '-'),
              status: 'active',
            })
            return created?.id
          }}
          onUpdate={async (id, d) => {
            await updateBrand.mutateAsync({ id, data: d })
          }}
          onUploadLogo={async (brandId, file) => {
            await uploadLogo.mutateAsync({ brandId, file })
          }}
          onDelete={async (id) => {
            await deleteBrand.mutateAsync(id)
          }}
          onToggleStatus={async (id) => {
            const b = brands.find((x: { id: string; status: string }) => x.id === id)
            if (b) await updateBrand.mutateAsync({ id, data: { status: b.status === 'active' ? 'inactive' : 'active' } })
          }}
        />
      )}
      {(activeTab === 'models' || activeTab === 'colors' || activeTab === 'fuelTypes' || activeTab === 'transmissions') && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center text-slate-500">Đang tải...</div>
          ) : (
            <table className="w-full min-w-[400px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tên</th>
                  {showSlug && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Slug</th>}
                  {showHex && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Mã màu</th>}
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Số xe</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row: Record<string, unknown>) => (
                  <tr key={String(row.id)} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{String(row.name)}</td>
                    {showSlug && <td className="px-4 py-3 text-slate-600">{String(row.slug ?? '-')}</td>}
                    {showHex && (
                      <td className="px-4 py-3">
                        <span className="inline-block h-6 w-6 rounded border border-slate-200" style={{ backgroundColor: String(row.hex ?? '#ccc') }} />
                      </td>
                    )}
                    <td className="px-4 py-3 text-slate-600">{Number(row.vehicleCount ?? 0)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${row.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>
                        <span className={`h-2 w-2 rounded-full ${row.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`} />
                        {row.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(row)}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-[#1A3C6E]/10 hover:text-[#1A3C6E]"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(String(row.id))}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-600/10 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-[#1A3C6E] p-4 text-white">
          <BarChart3 className="h-10 w-10 shrink-0 opacity-80" />
          <div>
            <p className="text-xs font-semibold uppercase opacity-80">Tổng hãng xe</p>
            <p className="text-2xl font-bold">{totalBrands}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <Database className="h-10 w-10 shrink-0 text-slate-400" />
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Mục dữ liệu</p>
            <p className="text-2xl font-bold text-slate-900">{totalItems.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <RefreshCw className="h-10 w-10 shrink-0 text-slate-400" />
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Cập nhật lần cuối</p>
            <p className="text-lg font-semibold text-slate-900">12 phút trước</p>
          </div>
        </div>
      </div>
      {showModal && (
        <CatalogItemModal
          tab={activeTab}
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditItem(null) }}
          onSubmit={handleSubmit}
          editItem={editItem}
          brands={brands.map((b: { id: string; name: string }) => ({ id: b.id, name: b.name }))}
        />
      )}
    </div>
  )
}
