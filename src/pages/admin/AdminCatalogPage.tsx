import { useMemo, useState } from 'react'
import { Building2, Car, Fuel, RefreshCw, Settings2 } from 'lucide-react'
import { Pagination } from '@/components/ui'
import {
  useAdminCatalogBrands,
  useAdminCatalogModels,
  useAdminCatalogFuelTypes,
  useAdminCatalogTransmissions,
} from '@/hooks/useAdminCatalog'
import {
  useCreateCatalogBrand,
  useCreateCatalogModel,
  useCreateFuelType,
  useCreateTransmission,
  useUpdateCatalogBrand,
  useUpdateCatalogFuelType,
  useUpdateCatalogModel,
  useUpdateCatalogTransmission,
} from '@/hooks/useAdminMutations'
import type {
  AdminCatalogBrandRow,
  AdminCatalogModelRow,
  AdminCatalogTypedOption,
} from '@/services/adminCatalog.service'
import { Button, Modal } from '@/components/ui'
import { useToastStore } from '@/store/toastStore'

const TABS = [
  { key: 'brands' as const, label: 'Hãng Xe', icon: Building2 },
  { key: 'models' as const, label: 'Dòng Xe', icon: Car },
  { key: 'fuelTypes' as const, label: 'Nhiên Liệu', icon: Fuel },
  { key: 'transmissions' as const, label: 'Hộp Số', icon: Settings2 },
]

type TabKey = (typeof TABS)[number]['key']
type TypedCatalogKind = 'fuel' | 'trans'
export function AdminCatalogPage() {
  const toast = useToastStore()
  const [tab, setTab] = useState<TabKey>('brands')
  const [qBrand, setQBrand] = useState('')
  const [pageBrand, setPageBrand] = useState(0)
  const [qModel, setQModel] = useState('')
  const [pageModel, setPageModel] = useState(0)
  const [pageSize, setPageSize] = useState(12)
  const [filterCat, setFilterCat] = useState<number | undefined>(undefined)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandStatus, setNewBrandStatus] = useState<'active' | 'inactive'>('active')
  const [newModelName, setNewModelName] = useState('')
  const [newModelCat, setNewModelCat] = useState('')
  const [newModelStatus, setNewModelStatus] = useState<'active' | 'inactive'>('active')
  const [newFuelName, setNewFuelName] = useState('')
  const [newTransName, setNewTransName] = useState('')
  const [editBrand, setEditBrand] = useState<AdminCatalogBrandRow | null>(null)
  const [editModel, setEditModel] = useState<AdminCatalogModelRow | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftStatus, setDraftStatus] = useState<'active' | 'inactive'>('active')
  const [editTyped, setEditTyped] = useState<{ kind: TypedCatalogKind; row: AdminCatalogTypedOption } | null>(null)
  const [typedDraftName, setTypedDraftName] = useState('')
  const [typedDraftStatus, setTypedDraftStatus] = useState<'active' | 'inactive'>('active')

  const brandsQ = useAdminCatalogBrands(qBrand, pageBrand, pageSize)
  const brandOptionsQ = useAdminCatalogBrands('', 0, 400)
  const modelsQ = useAdminCatalogModels(qModel, filterCat, pageModel, pageSize)
  const fuelsQ = useAdminCatalogFuelTypes()
  const transQ = useAdminCatalogTransmissions()

  const createBrand = useCreateCatalogBrand()
  const updateBrand = useUpdateCatalogBrand()
  const createModel = useCreateCatalogModel()
  const updateModel = useUpdateCatalogModel()
  const createFuel = useCreateFuelType()
  const createTrans = useCreateTransmission()
  const updateFuelType = useUpdateCatalogFuelType()
  const updateTransmission = useUpdateCatalogTransmission()

  const brandRows = brandsQ.data?.content ?? []
  const brandMeta = brandsQ.data?.meta
  const modelRows = modelsQ.data?.content ?? []
  const modelMeta = modelsQ.data?.meta
  const fuelRows = fuelsQ.data ?? []
  const transRows = transQ.data ?? []
  const brandOptions = brandOptionsQ.data?.content ?? []

  const loading =
    (tab === 'brands' && brandsQ.isLoading)
    || (tab === 'models' && (modelsQ.isLoading || brandOptionsQ.isLoading))
    || (tab === 'fuelTypes' && fuelsQ.isLoading)
    || (tab === 'transmissions' && transQ.isLoading)

  const openEditBrand = (b: AdminCatalogBrandRow) => {
    setEditBrand(b)
    setDraftName(b.name)
    setDraftStatus(b.status === 'inactive' ? 'inactive' : 'active')
  }

  const openEditModel = (m: AdminCatalogModelRow) => {
    setEditModel(m)
    setDraftName(m.name)
    setDraftStatus(m.status === 'inactive' ? 'inactive' : 'active')
  }

  const saveBrand = async () => {
    if (!editBrand) return
    try {
      await updateBrand.mutateAsync({
        id: Number(editBrand.id),
        body: { name: draftName.trim(), status: draftStatus },
      })
      toast.addToast('success', 'Đã cập nhật hãng.')
      setEditBrand(null)
    } catch (e) {
      toast.addToast('error', (e as Error)?.message || 'Không lưu được.')
    }
  }

  const saveModel = async () => {
    if (!editModel) return
    try {
      await updateModel.mutateAsync({
        id: Number(editModel.id),
        name: draftName.trim(),
        status: draftStatus,
      })
      toast.addToast('success', 'Đã cập nhật dòng xe.')
      setEditModel(null)
    } catch (e) {
      toast.addToast('error', (e as Error)?.message || 'Không lưu được.')
    }
  }

  const openEditTyped = (kind: TypedCatalogKind, row: AdminCatalogTypedOption) => {
    setEditTyped({ kind, row })
    setTypedDraftName(row.name)
    setTypedDraftStatus(row.status?.toLowerCase() === 'inactive' ? 'inactive' : 'active')
  }

  const saveTyped = async () => {
    if (!editTyped) return
    const body = { name: typedDraftName.trim(), status: typedDraftStatus }
    if (!body.name) return
    try {
      if (editTyped.kind === 'fuel') {
        await updateFuelType.mutateAsync({ id: editTyped.row.id, body })
      } else {
        await updateTransmission.mutateAsync({ id: editTyped.row.id, body })
      }
      toast.addToast('success', 'Đã cập nhật.')
      setEditTyped(null)
    } catch (e) {
      toast.addToast('error', (e as Error)?.message || 'Không lưu được.')
    }
  }

  const toggleTypedStatus = async (kind: TypedCatalogKind, row: AdminCatalogTypedOption) => {
    const active = row.status?.toLowerCase() === 'active'
    const next = active ? 'inactive' : 'active'
    try {
      if (kind === 'fuel') {
        await updateFuelType.mutateAsync({ id: row.id, body: { name: row.name, status: next } })
      } else {
        await updateTransmission.mutateAsync({ id: row.id, body: { name: row.name, status: next } })
      }
      toast.addToast('success', next === 'active' ? 'Đã hiện.' : 'Đã ẩn.')
    } catch (e) {
      toast.addToast('error', (e as Error)?.message || 'Không cập nhật được.')
    }
  }

  const toggleBrandStatus = async (b: AdminCatalogBrandRow) => {
    const next = b.status === 'active' ? 'inactive' : 'active'
    try {
      await updateBrand.mutateAsync({
        id: Number(b.id),
        body: { name: b.name, status: next },
      })
      toast.addToast('success', next === 'active' ? 'Đã hiện hãng.' : 'Đã ẩn hãng.')
    } catch (e) {
      toast.addToast('error', (e as Error)?.message || 'Không cập nhật được.')
    }
  }

  const toggleModelStatus = async (m: AdminCatalogModelRow) => {
    const active = (m.status ?? '').toLowerCase() === 'active'
    const next = active ? 'inactive' : 'active'
    try {
      await updateModel.mutateAsync({
        id: Number(m.id),
        name: m.name,
        status: next,
      })
      toast.addToast('success', next === 'active' ? 'Đã hiện dòng xe.' : 'Đã ẩn dòng xe.')
    } catch (e) {
      toast.addToast('error', (e as Error)?.message || 'Không cập nhật được.')
    }
  }

  const submitNewBrand = async () => {
    const n = newBrandName.trim()
    if (!n) return
    try {
      await createBrand.mutateAsync({ name: n, status: newBrandStatus })
      await Promise.all([brandsQ.refetch(), brandOptionsQ.refetch()])
      toast.addToast('success', 'Đã tạo hãng.')
      setNewBrandName('')
      setPageBrand(0)
    } catch (e) {
      toast.addToast('error', (e as Error)?.message || 'Không tạo được.')
    }
  }

  const submitNewModel = async () => {
    const n = newModelName.trim()
    const cid = Number(newModelCat)
    if (!n || !cid) return
    try {
      await createModel.mutateAsync({ categoryId: cid, name: n, status: newModelStatus })
      await modelsQ.refetch()
      toast.addToast('success', 'Đã tạo dòng xe.')
      setNewModelName('')
      setPageModel(0)
    } catch (e) {
      toast.addToast('error', (e as Error)?.message || 'Không tạo được.')
    }
  }

  const submitFuel = async () => {
    const n = newFuelName.trim()
    if (!n) return
    try {
      await createFuel.mutateAsync(n)
      await fuelsQ.refetch()
      toast.addToast('success', 'Đã thêm nhiên liệu.')
      setNewFuelName('')
    } catch (e) {
      toast.addToast('error', (e as Error)?.message || 'Không thêm được.')
    }
  }

  const submitTrans = async () => {
    const n = newTransName.trim()
    if (!n) return
    try {
      await createTrans.mutateAsync(n)
      await transQ.refetch()
      toast.addToast('success', 'Đã thêm hộp số.')
      setNewTransName('')
    } catch (e) {
      toast.addToast('error', (e as Error)?.message || 'Không thêm được.')
    }
  }

  const errMsg = useMemo(() => {
    if (tab === 'brands' && brandsQ.isError) return (brandsQ.error as Error)?.message
    if (tab === 'models' && modelsQ.isError) return (modelsQ.error as Error)?.message
    if (tab === 'fuelTypes' && fuelsQ.isError) return (fuelsQ.error as Error)?.message
    if (tab === 'transmissions' && transQ.isError) return (transQ.error as Error)?.message
    return null
  }, [tab, brandsQ.isError, brandsQ.error, modelsQ.isError, modelsQ.error, fuelsQ.isError, fuelsQ.error, transQ.isError, transQ.error])

  const canSubmitBrand = newBrandName.trim().length > 0 && !createBrand.isPending
  const canSubmitModel = newModelName.trim().length > 0 && Number(newModelCat) > 0 && !createModel.isPending
  const canSubmitFuel = newFuelName.trim().length > 0 && !createFuel.isPending
  const canSubmitTrans = newTransName.trim().length > 0 && !createTrans.isPending

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Danh Mục Xe</h2>
          <p className="mt-1 text-sm text-slate-500">Hãng, dòng xe, nhiên liệu và hộp số — dữ liệu từ API.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            brandsQ.refetch()
            brandOptionsQ.refetch()
            modelsQ.refetch()
            fuelsQ.refetch()
            transQ.refetch()
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Tải lại
        </Button>
      </div>
      {errMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errMsg}</div>
      )}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'border-[#1A3C6E] text-[#1A3C6E]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'brands' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Tìm hãng</label>
              <input
                value={qBrand}
                onChange={(e) => { setQBrand(e.target.value); setPageBrand(0) }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Tên hãng…"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Tên hãng mới</label>
              <input
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <select
              value={newBrandStatus}
              onChange={(e) => setNewBrandStatus(e.target.value as 'active' | 'inactive')}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Ẩn</option>
            </select>
            <Button
              variant="primary"
              onClick={() => void submitNewBrand()}
              loading={createBrand.isPending}
              disabled={!canSubmitBrand}
            >
              Tạo hãng
            </Button>
          </div>
        </div>
      )}

      {tab === 'models' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Tìm dòng xe</label>
              <input
                value={qModel}
                onChange={(e) => { setQModel(e.target.value); setPageModel(0) }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="min-w-[160px]">
              <label className="mb-1 block text-xs font-medium text-slate-600">Hãng</label>
              <select
                value={filterCat ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  setFilterCat(v ? Number(v) : undefined)
                  setPageModel(0)
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Tất cả</option>
                {brandOptions.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="min-w-[140px]">
              <label className="mb-1 block text-xs font-medium text-slate-600">Hãng</label>
              <select
                value={newModelCat}
                onChange={(e) => setNewModelCat(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Chọn…</option>
                {brandOptions.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Tên dòng mới</label>
              <input
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <select
              value={newModelStatus}
              onChange={(e) => setNewModelStatus(e.target.value as 'active' | 'inactive')}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Ẩn</option>
            </select>
            <Button
              variant="primary"
              onClick={() => void submitNewModel()}
              loading={createModel.isPending}
              disabled={!canSubmitModel}
            >
              Tạo dòng
            </Button>
          </div>
        </div>
      )}

      {(tab === 'fuelTypes' || tab === 'transmissions') && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              {tab === 'fuelTypes' ? 'Tên loại nhiên liệu' : 'Tên loại hộp số'}
            </label>
            <input
              value={tab === 'fuelTypes' ? newFuelName : newTransName}
              onChange={(e) => (tab === 'fuelTypes' ? setNewFuelName(e.target.value) : setNewTransName(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => void (tab === 'fuelTypes' ? submitFuel() : submitTrans())}
            loading={tab === 'fuelTypes' ? createFuel.isPending : createTrans.isPending}
            disabled={tab === 'fuelTypes' ? !canSubmitFuel : !canSubmitTrans}
          >
            Thêm
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-slate-500">Đang tải...</div>
        ) : (
          <table className="w-full min-w-[400px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {tab === 'brands' && (
                  <>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tên</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Slug</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Số xe</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
                  </>
                )}
                {tab === 'models' && (
                  <>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Dòng xe</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Hãng (id)</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Số xe</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
                  </>
                )}
                {(tab === 'fuelTypes' || tab === 'transmissions') && (
                  <>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tên</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Số xe khớp</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tab === 'brands' && brandRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-3 text-slate-600">{row.slug}</td>
                  <td className="px-4 py-3 text-slate-600">{row.vehicleCount}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-600">
                    {row.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button type="button" onClick={() => openEditBrand(row)} className="text-sm text-[#1A3C6E] hover:underline">Sửa</button>
                    <button type="button" onClick={() => toggleBrandStatus(row)} className="text-sm text-slate-600 hover:underline">
                      {row.status === 'active' ? 'Ẩn' : 'Hiện'}
                    </button>
                  </td>
                </tr>
              ))}
              {tab === 'models' && modelRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-3 text-slate-600">{row.brandId}</td>
                  <td className="px-4 py-3 text-slate-600">{row.vehicleCount}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {(row.status ?? '').toLowerCase() === 'active' ? 'Hoạt động' : 'Ẩn'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button type="button" onClick={() => openEditModel(row)} className="text-sm text-[#1A3C6E] hover:underline">Sửa</button>
                    <button
                      type="button"
                      disabled={updateModel.isPending}
                      onClick={() => void toggleModelStatus(row)}
                      className="text-sm text-slate-600 hover:underline disabled:opacity-50"
                    >
                      {(row.status ?? '').toLowerCase() === 'active' ? 'Ẩn' : 'Hiện'}
                    </button>
                  </td>
                </tr>
              ))}
              {tab === 'fuelTypes' && fuelRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-600">
                    {row.status?.toLowerCase() === 'active' ? 'Hoạt động' : 'Ẩn'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.vehicleCount}</td>
                  <td className="space-x-2 px-4 py-3 text-right">
                    <button type="button" onClick={() => openEditTyped('fuel', row)} className="text-sm text-[#1A3C6E] hover:underline">
                      Sửa
                    </button>
                    <button
                      type="button"
                      disabled={updateFuelType.isPending || updateTransmission.isPending}
                      onClick={() => void toggleTypedStatus('fuel', row)}
                      className="text-sm text-slate-600 hover:underline disabled:opacity-50"
                    >
                      {row.status?.toLowerCase() === 'active' ? 'Ẩn' : 'Hiện'}
                    </button>
                  </td>
                </tr>
              ))}
              {tab === 'transmissions' && transRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-600">
                    {row.status?.toLowerCase() === 'active' ? 'Hoạt động' : 'Ẩn'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.vehicleCount}</td>
                  <td className="space-x-2 px-4 py-3 text-right">
                    <button type="button" onClick={() => openEditTyped('trans', row)} className="text-sm text-[#1A3C6E] hover:underline">
                      Sửa
                    </button>
                    <button
                      type="button"
                      disabled={updateFuelType.isPending || updateTransmission.isPending}
                      onClick={() => void toggleTypedStatus('trans', row)}
                      className="text-sm text-slate-600 hover:underline disabled:opacity-50"
                    >
                      {row.status?.toLowerCase() === 'active' ? 'Ẩn' : 'Hiện'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && tab === 'brands' && brandRows.length === 0 && (
          <div className="py-12 text-center text-slate-500">Không có hãng</div>
        )}
        {!loading && tab === 'models' && modelRows.length === 0 && (
          <div className="py-12 text-center text-slate-500">Không có dòng xe</div>
        )}
        {!loading && tab === 'fuelTypes' && fuelRows.length === 0 && (
          <div className="py-12 text-center text-slate-500">Chưa có loại nhiên liệu trong hệ thống</div>
        )}
        {!loading && tab === 'transmissions' && transRows.length === 0 && (
          <div className="py-12 text-center text-slate-500">Chưa có loại hộp số trong hệ thống</div>
        )}
      </div>

      {tab === 'brands' && (
        <Pagination
          page={pageBrand + 1}
          totalPages={Math.max(1, brandMeta?.totalPages ?? 1)}
          total={(brandMeta?.totalElements as number) ?? brandRows.length}
          pageSize={pageSize}
          onPageChange={(p) => setPageBrand(p - 1)}
          onPageSizeChange={(s) => { setPageSize(s); setPageBrand(0) }}
          label="hãng xe"
        />
      )}
      {tab === 'models' && (
        <Pagination
          page={pageModel + 1}
          totalPages={Math.max(1, modelMeta?.totalPages ?? 1)}
          total={(modelMeta?.totalElements as number) ?? modelRows.length}
          pageSize={pageSize}
          onPageChange={(p) => setPageModel(p - 1)}
          onPageSizeChange={(s) => { setPageSize(s); setPageModel(0) }}
          label="dòng xe"
        />
      )}

      <Modal
        isOpen={!!editBrand}
        onClose={() => setEditBrand(null)}
        title="Sửa hãng xe"
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditBrand(null)}>Hủy</Button>
            <Button variant="primary" onClick={saveBrand} loading={updateBrand.isPending}>Lưu</Button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tên</label>
            <input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
            <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value as 'active' | 'inactive')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="active">Hoạt động</option>
              <option value="inactive">Ẩn</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!editTyped}
        onClose={() => setEditTyped(null)}
        title={editTyped?.kind === 'fuel' ? 'Sửa loại nhiên liệu' : 'Sửa loại hộp số'}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditTyped(null)}>Hủy</Button>
            <Button
              variant="primary"
              onClick={() => void saveTyped()}
              loading={editTyped?.kind === 'fuel' ? updateFuelType.isPending : updateTransmission.isPending}
            >
              Lưu
            </Button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tên</label>
            <input
              value={typedDraftName}
              onChange={(e) => setTypedDraftName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
            <select
              value={typedDraftStatus}
              onChange={(e) => setTypedDraftStatus(e.target.value as 'active' | 'inactive')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="active">Hiển thị (hoạt động)</option>
              <option value="inactive">Ẩn</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!editModel}
        onClose={() => setEditModel(null)}
        title="Sửa dòng xe"
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditModel(null)}>Hủy</Button>
            <Button variant="primary" onClick={saveModel} loading={updateModel.isPending}>Lưu</Button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tên dòng xe</label>
            <input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
            <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value as 'active' | 'inactive')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="active">Hoạt động</option>
              <option value="inactive">Ẩn</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
