import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Trash2, Upload } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminHomeBanners,
  createAdminHomeBanner,
  deleteAdminHomeBanner,
  uploadHomeBannerImage,
} from '@/services/homeBanners.service'
import { Button } from '@/components/ui'
import { useToastStore } from '@/store/toastStore'

export function AdminHomeBannersPage() {
  const toast = useToastStore()
  const qc = useQueryClient()
  const { data: banners = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-home-banners'],
    queryFn: fetchAdminHomeBanners,
    staleTime: 30_000,
  })
  const [uploading, setUploading] = useState(false)

  const createMut = useMutation({
    mutationFn: createAdminHomeBanner,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-home-banners'] }),
  })

  const deleteMut = useMutation({
    mutationFn: deleteAdminHomeBanner,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-home-banners'] }),
  })

  const onPickFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return
      setUploading(true)
      try {
        for (let i = 0; i < files.length; i++) {
          const f = files[i]
          if (!f.type.startsWith('image/')) continue
          const { secureUrl, publicId } = await uploadHomeBannerImage(f)
          await createMut.mutateAsync({ imageUrl: secureUrl, cloudinaryPublicId: publicId })
        }
        toast.addToast('success', 'Đã thêm banner.')
        refetch()
      } catch (e) {
        toast.addToast('error', (e as Error)?.message || 'Upload thất bại.')
      } finally {
        setUploading(false)
      }
    },
    [createMut, refetch, toast],
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/admin/dashboard" className="hover:text-[#1A3C6E]">Admin</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">Banner trang chủ</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Banner trang chủ</h2>
        <p className="mt-1 text-slate-500">Upload Cloudinary — hiển thị công khai, nhiều ảnh sẽ slideshow.</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 py-10 hover:bg-slate-50">
          <Upload className="h-8 w-8 text-[#1A3C6E]" />
          <span className="text-sm font-medium text-slate-700">Chọn một hoặc nhiều ảnh</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading || createMut.isPending}
            onChange={(e) => {
              onPickFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </label>
        {(uploading || createMut.isPending) && <p className="mt-2 text-center text-sm text-slate-500">Đang xử lý…</p>}
      </div>
      {isLoading ? (
        <div className="py-12 text-center text-slate-500">Đang tải…</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {banners.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-[21/9] bg-slate-100">
                <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between p-3">
                <span className="text-xs text-slate-500">#{b.sortOrder}</span>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('Xóa banner này?')) return
                    try {
                      await deleteMut.mutateAsync(b.id)
                      toast.addToast('success', 'Đã xóa.')
                    } catch {
                      toast.addToast('error', 'Không xóa được.')
                    }
                  }}
                  className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && banners.length === 0 && (
        <p className="text-center text-sm text-slate-500">Chưa có banner — upload ảnh phía trên.</p>
      )}
      <Button variant="outline" size="sm" onClick={() => refetch()}>Tải lại danh sách</Button>
    </div>
  )
}
