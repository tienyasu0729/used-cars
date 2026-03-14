import { useState, useRef } from 'react'
import { CloudUpload, Pencil, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui'
import type { CatalogBrand } from '@/mock/mockAdminData'

interface CatalogBrandsBlockProps {
  brands: CatalogBrand[]
  onQuickSave: (data: { name: string; slug: string; logoFile?: File }) => Promise<string | void>
  onUpdate: (id: string, data: { name: string; slug: string; status: string }) => void
  onUploadLogo?: (brandId: string, file: File) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onToggleStatus?: (id: string) => void
}

export function CatalogBrandsBlock({ brands, onQuickSave, onUpdate, onUploadLogo, onDelete, onToggleStatus }: CatalogBrandsBlockProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [page, setPage] = useState(1)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadBrandIdRef = useRef<string | null>(null)
  const perPage = 10

  const totalPages = Math.ceil(brands.length / perPage)
  const paginated = brands.slice((page - 1) * perPage, page * perPage)

  const startEdit = (row: CatalogBrand) => {
    setEditingId(row.id)
    setEditName(row.name)
    setEditSlug(row.slug)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, { name: editName, slug: editSlug, status: 'active' })
      setEditingId(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !/^image\/(svg\+xml|png|jpeg|jpg)$/i.test(file.type)) return
    const brandId = uploadBrandIdRef.current
    if (brandId && onUploadLogo) {
      onUploadLogo(brandId, file).finally(() => { uploadBrandIdRef.current = null; e.target.value = '' })
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const triggerUploadForBrand = (brandId: string) => {
    if (!onUploadLogo) return
    uploadBrandIdRef.current = brandId
    fileInputRef.current?.click()
  }

  const handleQuickSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const id = await onQuickSave({
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
        logoFile: logoFile ?? undefined,
      })
      if (id && logoFile && onUploadLogo) {
        await onUploadLogo(id, logoFile)
      }
      setName('')
      setSlug('')
      setLogoFile(null)
      if (logoPreview) URL.revokeObjectURL(logoPreview)
      setLogoPreview(null)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!onDelete || !window.confirm('Bạn có chắc muốn xóa hãng xe này?')) return
    await onDelete(id)
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/svg+xml,image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Logo</span>
          <button
            type="button"
            onClick={() => { uploadBrandIdRef.current = null; fileInputRef.current?.click() }}
            className="flex h-12 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white hover:border-[#1A3C6E] hover:bg-slate-50"
          >
            {logoPreview ? (
              <img src={logoPreview} alt="" className="h-10 w-16 object-contain" />
            ) : (
              <CloudUpload className="h-6 w-6 text-slate-400" />
            )}
          </button>
          <span className="text-xs text-slate-500">Upload SVG/PNG</span>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Name</label>
          <input
            type="text"
            placeholder="Enter brand name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Slug</label>
          <input
            type="text"
            placeholder="auto-generated-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={handleQuickSave} disabled={saving}>
          Quick Save
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Logo</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Slug</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Vehicles</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => triggerUploadForBrand(row.id)}
                    className={`flex h-8 w-12 items-center justify-center rounded bg-slate-100 ${onUploadLogo ? 'cursor-pointer hover:bg-slate-200' : 'cursor-default'}`}
                  >
                    {row.logoUrl ? (
                      <img src={row.logoUrl} alt="" className="h-8 w-12 object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  {editingId === row.id ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="font-medium text-slate-900">{row.name}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === row.id ? (
                    <input
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-slate-600">{row.slug}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{row.vehicleCount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${row.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>
                    <span className={`h-2 w-2 rounded-full ${row.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`} />
                    {row.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {editingId === row.id ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="primary" size="sm" onClick={saveEdit}>
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1">
                      {onToggleStatus && (
                        <button
                          onClick={() => onToggleStatus(row.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          title="Đổi trạng thái"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(row)}
                        className="rounded p-1.5 text-slate-400 hover:bg-[#1A3C6E]/10 hover:text-[#1A3C6E]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-600/10 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, brands.length)} of {brands.length} brands</p>
        <div className="flex gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`rounded px-3 py-1.5 text-sm font-medium ${page === p ? 'bg-[#1A3C6E] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  )
}
