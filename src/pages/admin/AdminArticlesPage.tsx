import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Plus, Eye, EyeOff, Pencil, Trash2, Upload, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useAdminArticles,
  useAdminCategories,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useToggleArticleVisibility,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useArticles'
import { articleService, uploadArticleThumbnailImage } from '@/services/article.service'
import { fetchMediaUploadEnabled } from '@/services/managerMedia.service'
import { useToastStore } from '@/store/toastStore'
import { Button, Badge, Pagination, Spinner, Modal, ConfirmDialog } from '@/components/ui'
import type { ArticleListItem, ArticleCategory, CreateArticleRequest, UpdateArticleRequest, CreateCategoryRequest } from '@/types/article.types'

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> = {
  published: { label: 'Đã xuất bản', variant: 'success' },
  draft: { label: 'Nháp', variant: 'default' },
  hidden: { label: 'Ẩn', variant: 'warning' },
}

export function AdminArticlesPage({ scope = 'admin' }: { scope?: 'admin' | 'manager' }) {
  const isManager = scope === 'manager'
  useDocumentTitle(isManager ? 'Bài viết của tôi' : 'Quản lý bài viết')

  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>()
  const [page, setPage] = useState(0)
  const [tab, setTab] = useState<'articles' | 'categories'>('articles')

  const { data, isLoading } = useAdminArticles({ keyword: keyword || undefined, status: statusFilter || undefined, categoryId: categoryFilter, page, size: 20 })
  const { data: categories } = useAdminCategories()

  const [showArticleModal, setShowArticleModal] = useState(false)
  const [editingArticle, setEditingArticle] = useState<ArticleListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const [showCatModal, setShowCatModal] = useState(false)
  const [editingCat, setEditingCat] = useState<ArticleCategory | null>(null)
  const [deleteCatTarget, setDeleteCatTarget] = useState<number | null>(null)

  const createArticle = useCreateArticle()
  const updateArticle = useUpdateArticle()
  const deleteArticle = useDeleteArticle()
  const toggleVisibility = useToggleArticleVisibility()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isManager ? 'Bài viết của tôi' : 'Quản lý bài viết'}
          </h1>
          {isManager && (
            <p className="mt-1 text-sm text-slate-500">Chỉ hiển thị các bài do bạn tạo. Danh mục do quản trị cấu hình.</p>
          )}
        </div>
        {!isManager && (
          <div className="flex gap-2">
            <Button
              variant={tab === 'articles' ? 'primary' : 'outline'}
              onClick={() => setTab('articles')}
            >Bài viết</Button>
            <Button
              variant={tab === 'categories' ? 'primary' : 'outline'}
              onClick={() => setTab('categories')}
            >Danh mục</Button>
          </div>
        )}
      </div>

      {(isManager || tab === 'articles') ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(0) }}
                placeholder="Tìm kiếm..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Nháp</option>
              <option value="hidden">Ẩn</option>
            </select>
            <select
              value={categoryFilter ?? ''}
              onChange={(e) => { setCategoryFilter(e.target.value ? Number(e.target.value) : undefined); setPage(0) }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Tất cả danh mục</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Button variant="primary" onClick={() => { setEditingArticle(null); setShowArticleModal(true) }}>
              <Plus className="mr-1 h-4 w-4" /> Thêm mới
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">Tiêu đề</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Danh mục</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Nổi bật</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Lượt xem</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Ngày tạo</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.items.map((a) => {
                    const s = STATUS_MAP[a.status] ?? { label: a.status, variant: 'default' as const }
                    return (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="max-w-xs truncate px-4 py-3 font-medium text-gray-900">{a.title}</td>
                        <td className="px-4 py-3 text-gray-500">{a.categoryName ?? '—'}</td>
                        <td className="px-4 py-3"><Badge variant={s.variant}>{s.label}</Badge></td>
                        <td className="px-4 py-3">
                          {a.featured ? <Badge variant="warning">Nổi bật</Badge> : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{a.viewCount}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(a.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditingArticle(a); setShowArticleModal(true) }}
                              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              title="Sửa"
                            ><Pencil className="h-4 w-4" /></button>
                            <button
                              onClick={() => toggleVisibility.mutate(a.id)}
                              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              title={a.status === 'published' ? 'Ẩn' : 'Hiện'}
                            >{a.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                            <button
                              onClick={() => setDeleteTarget(a.id)}
                              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                              title="Xóa"
                            ><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {data?.meta && data.meta.totalPages > 1 && (
            <Pagination
              page={data.meta.page + 1}
              totalPages={data.meta.totalPages}
              total={data.meta.totalElements}
              pageSize={data.meta.size}
              onPageChange={(p) => setPage(p - 1)}
              label="bài viết"
            />
          )}
        </>
      ) : !isManager ? (
        <CategoriesTab
          categories={categories ?? []}
          onAdd={() => { setEditingCat(null); setShowCatModal(true) }}
          onEdit={(c) => { setEditingCat(c); setShowCatModal(true) }}
          onDelete={(id) => setDeleteCatTarget(id)}
        />
      ) : null}

      {showArticleModal && (
        <ArticleFormModal
          key={editingArticle?.id ?? 'new'}
          article={editingArticle}
          categories={categories ?? []}
          onClose={() => setShowArticleModal(false)}
          onSubmit={async (data) => {
            if (editingArticle) {
              await updateArticle.mutateAsync({ id: editingArticle.id, body: data as UpdateArticleRequest })
            } else {
              await createArticle.mutateAsync(data as CreateArticleRequest)
            }
            setShowArticleModal(false)
          }}
          pending={createArticle.isPending || updateArticle.isPending}
        />
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này?"
        onConfirm={async () => {
          if (deleteTarget) await deleteArticle.mutateAsync(deleteTarget)
          setDeleteTarget(null)
        }}
        onClose={() => setDeleteTarget(null)}
      />

      {showCatModal && (
        <CategoryFormModal
          category={editingCat}
          onClose={() => setShowCatModal(false)}
          onSubmit={async (data) => {
            if (editingCat) {
              await updateCategory.mutateAsync({ id: editingCat.id, body: data })
            } else {
              await createCategory.mutateAsync(data)
            }
            setShowCatModal(false)
          }}
          pending={createCategory.isPending || updateCategory.isPending}
        />
      )}

      <ConfirmDialog
        isOpen={deleteCatTarget !== null}
        title="Xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này?"
        onConfirm={async () => {
          if (deleteCatTarget) await deleteCategory.mutateAsync(deleteCatTarget)
          setDeleteCatTarget(null)
        }}
        onClose={() => setDeleteCatTarget(null)}
      />
    </div>
  )
}

function CategoriesTab({
  categories, onAdd, onEdit, onDelete,
}: {
  categories: ArticleCategory[]
  onAdd: () => void
  onEdit: (c: ArticleCategory) => void
  onDelete: (id: number) => void
}) {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" onClick={onAdd}><Plus className="mr-1 h-4 w-4" /> Thêm danh mục</Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Tên</th>
              <th className="px-4 py-3 font-medium text-gray-600">Slug</th>
              <th className="px-4 py-3 font-medium text-gray-600">Thứ tự</th>
              <th className="px-4 py-3 font-medium text-gray-600">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                <td className="px-4 py-3 text-gray-500">{c.sortOrder}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.active ? 'success' : 'warning'}>{c.active ? 'Hoạt động' : 'Tắt'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(c)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(c.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400">Chưa có danh mục nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ArticleFormModal({
  article, categories, onClose, onSubmit, pending,
}: {
  article: ArticleListItem | null
  categories: ArticleCategory[]
  onClose: () => void
  onSubmit: (data: CreateArticleRequest | UpdateArticleRequest) => Promise<void>
  pending: boolean
}) {
  const toast = useToastStore()
  const [title, setTitle] = useState(article?.title ?? '')
  const [summary, setSummary] = useState(article?.summary ?? '')
  const [content, setContent] = useState('')
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState(article?.thumbnailUrl ?? '')
  const [pendingThumbnailFile, setPendingThumbnailFile] = useState<File | null>(null)
  const [localPreviewObjectUrl, setLocalPreviewObjectUrl] = useState<string | null>(null)
  const [uploadingOnSave, setUploadingOnSave] = useState(false)
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState(article?.status ?? 'draft')
  const [featured, setFeatured] = useState(article?.featured ?? false)
  const [cloudinaryReady, setCloudinaryReady] = useState(false)
  const detailAppliedRef = useRef<number | null>(null)

  const { data: articleDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['admin', 'articles', 'modal', article?.id],
    queryFn: () => articleService.getAdminArticleById(article!.id),
    enabled: !!article?.id,
  })

  useEffect(() => {
    void fetchMediaUploadEnabled().then(setCloudinaryReady)
  }, [])

  useEffect(() => {
    return () => {
      if (localPreviewObjectUrl) {
        URL.revokeObjectURL(localPreviewObjectUrl)
      }
    }
  }, [localPreviewObjectUrl])

  const clearLocalThumbnail = useCallback(() => {
    setLocalPreviewObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setPendingThumbnailFile(null)
  }, [])

  useEffect(() => {
    if (!articleDetail?.id) return
    if (detailAppliedRef.current === articleDetail.id) return
    detailAppliedRef.current = articleDetail.id
    setTitle(articleDetail.title)
    setSummary(articleDetail.summary ?? '')
    setContent(articleDetail.content)
    setThumbnailUrlInput(articleDetail.thumbnailUrl ?? '')
    clearLocalThumbnail()
    setCategoryId(articleDetail.categoryId ?? undefined)
    setStatus(articleDetail.status)
    setFeatured(articleDetail.featured)
  }, [articleDetail, clearLocalThumbnail])

  const onPickThumbnail = useCallback(
    (files: FileList | null) => {
      const f = files?.[0]
      if (!f || !f.type.startsWith('image/')) return
      setLocalPreviewObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(f)
      })
      setPendingThumbnailFile(f)
      setThumbnailUrlInput('')
    },
    [],
  )

  const removeThumbnail = useCallback(() => {
    clearLocalThumbnail()
    setThumbnailUrlInput('')
  }, [clearLocalThumbnail])

  const previewSrc = localPreviewObjectUrl || thumbnailUrlInput.trim()

  const handleSave = async () => {
    setUploadingOnSave(true)
    try {
      let finalThumb = thumbnailUrlInput.trim()
      if (pendingThumbnailFile) {
        if (!cloudinaryReady) {
          toast.addToast('error', 'Chưa bật Cloudinary trên máy chủ — bỏ ảnh đã chọn hoặc dán URL.')
          return
        }
        finalThumb = await uploadArticleThumbnailImage(pendingThumbnailFile)
      }
      await onSubmit({
        title,
        summary,
        content,
        thumbnailUrl: finalThumb || undefined,
        categoryId,
        status,
        featured,
      })
    } catch (e) {
      toast.addToast('error', (e as Error)?.message || 'Lưu hoặc tải ảnh thất bại.')
    } finally {
      setUploadingOnSave(false)
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={article ? 'Sửa bài viết' : 'Thêm bài viết mới'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button
            variant="primary"
            loading={pending || uploadingOnSave || (Boolean(article?.id) && loadingDetail)}
            onClick={() => void handleSave()}
          >Lưu</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {Boolean(article?.id) && loadingDetail && (
          <p className="text-sm text-gray-500">Đang tải nội dung bài viết…</p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tiêu đề *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả ngắn</label>
          <input value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nội dung *</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Ảnh đại diện</label>
          <p className="mb-2 text-xs text-gray-500">
            Chọn ảnh từ máy — ảnh chỉ được tải lên Cloudinary khi bạn nhấn <strong>Lưu</strong>. Hoặc dán URL ảnh công khai (HTTPS).
          </p>
          {cloudinaryReady && (
            <label className="mb-3 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 py-4 hover:bg-gray-50">
              <Upload className="h-6 w-6 text-[#1A3C6E]" />
              <span className="text-xs font-medium text-gray-600">Chọn ảnh từ máy</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={pending || uploadingOnSave}
                onChange={(e) => {
                  onPickThumbnail(e.target.files)
                  e.target.value = ''
                }}
              />
            </label>
          )}
          {!cloudinaryReady && (
            <p className="mb-2 rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
              Máy chủ chưa bật Cloudinary — chỉ có thể dán URL ảnh bên dưới.
            </p>
          )}
          {previewSrc && (
            <div className="relative mb-2 inline-block max-w-full rounded-lg border border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gray-900/70 text-white shadow hover:bg-gray-900"
                title="Xóa ảnh"
                aria-label="Xóa ảnh"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="max-h-40 overflow-hidden px-2 py-2">
                <img src={previewSrc} alt="" className="mx-auto max-h-40 w-auto object-contain" onError={() => { /* invalid url */ }} />
              </div>
            </div>
          )}
          <label className="mb-1 block text-xs text-gray-500">Hoặc dán URL ảnh</label>
          <input
            value={thumbnailUrlInput}
            onChange={(e) => {
              setThumbnailUrlInput(e.target.value)
              if (pendingThumbnailFile || localPreviewObjectUrl) {
                clearLocalThumbnail()
              }
            }}
            placeholder="https://…"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Danh mục</label>
            <select value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <option value="">Không có</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <option value="draft">Nháp</option>
              <option value="published">Xuất bản</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded border-gray-300 text-[#1A3C6E]"
          />
          Đánh dấu bài viết nổi bật
        </label>
      </div>
    </Modal>
  )
}

function CategoryFormModal({
  category, onClose, onSubmit, pending,
}: {
  category: ArticleCategory | null
  onClose: () => void
  onSubmit: (data: CreateCategoryRequest) => Promise<void>
  pending: boolean
}) {
  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [description, setDescription] = useState(category?.description ?? '')
  const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? 0)
  const [active, setActive] = useState(category?.active ?? true)

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={category ? 'Sửa danh mục' : 'Thêm danh mục mới'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant="primary" loading={pending} onClick={() => onSubmit({ name, slug, description, sortOrder, active })}>Lưu</Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tên danh mục *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Slug (tự động nếu để trống)</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Thứ tự</label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="rounded" />
              Hoạt động
            </label>
          </div>
        </div>
      </div>
    </Modal>
  )
}
