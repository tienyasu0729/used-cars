import axiosInstance from '@/utils/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import type {
  ArticleCategory,
  ArticleDetail,
  ArticleListItem,
  CreateArticleRequest,
  CreateCategoryRequest,
  UpdateArticleRequest,
} from '@/types/article.types'
import type { CloudinarySignedUpload } from '@/services/managerMedia.service'

interface PageMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

function unwrapMeta(raw: unknown): PageMeta {
  const m = raw as Record<string, number>
  return {
    page: m?.page ?? 0,
    size: m?.size ?? 12,
    totalElements: m?.totalElements ?? 0,
    totalPages: m?.totalPages ?? 0,
  }
}

export const articleService = {
  async getPublishedArticles(params: { keyword?: string; category?: string; page?: number; size?: number }) {
    const res = (await axiosInstance.get('/articles', { params })) as unknown as ApiResponse<ArticleListItem[]>
    return { items: res.data ?? [], meta: unwrapMeta(res.meta) }
  },

  async getArticleBySlug(slug: string): Promise<ArticleDetail> {
    const res = (await axiosInstance.get(`/articles/${slug}`)) as unknown as ApiResponse<ArticleDetail>
    return res.data
  },

  async getPublicCategories(): Promise<ArticleCategory[]> {
    const res = (await axiosInstance.get('/articles/categories')) as unknown as ApiResponse<ArticleCategory[]>
    return res.data ?? []
  },

  // Admin
  async getAdminArticles(params: { keyword?: string; status?: string; categoryId?: number; page?: number; size?: number }) {
    const res = (await axiosInstance.get('/admin/articles', { params })) as unknown as ApiResponse<ArticleListItem[]>
    return { items: res.data ?? [], meta: unwrapMeta(res.meta) }
  },

  async getAdminArticleById(id: number): Promise<ArticleDetail> {
    const res = (await axiosInstance.get(`/admin/articles/${id}`)) as unknown as ApiResponse<ArticleDetail>
    return res.data
  },

  async createArticle(body: CreateArticleRequest): Promise<ArticleDetail> {
    const res = (await axiosInstance.post('/admin/articles', body)) as unknown as ApiResponse<ArticleDetail>
    return res.data
  },

  async updateArticle(id: number, body: UpdateArticleRequest): Promise<ArticleDetail> {
    const res = (await axiosInstance.put(`/admin/articles/${id}`, body)) as unknown as ApiResponse<ArticleDetail>
    return res.data
  },

  async deleteArticle(id: number): Promise<void> {
    await axiosInstance.delete(`/admin/articles/${id}`)
  },

  async toggleVisibility(id: number): Promise<ArticleDetail> {
    const res = (await axiosInstance.patch(`/admin/articles/${id}/toggle-visibility`)) as unknown as ApiResponse<ArticleDetail>
    return res.data
  },

  // Admin categories
  async getAdminCategories(): Promise<ArticleCategory[]> {
    const res = (await axiosInstance.get('/admin/articles/categories')) as unknown as ApiResponse<ArticleCategory[]>
    return res.data ?? []
  },

  async createCategory(body: CreateCategoryRequest): Promise<ArticleCategory> {
    const res = (await axiosInstance.post('/admin/articles/categories', body)) as unknown as ApiResponse<ArticleCategory>
    return res.data
  },

  async updateCategory(id: number, body: CreateCategoryRequest): Promise<ArticleCategory> {
    const res = (await axiosInstance.put(`/admin/articles/categories/${id}`, body)) as unknown as ApiResponse<ArticleCategory>
    return res.data
  },

  async deleteCategory(id: number): Promise<void> {
    await axiosInstance.delete(`/admin/articles/categories/${id}`)
  },

  /** Ký upload ảnh đại diện bài viết lên Cloudinary (folder used-cars/articles). */
  async fetchArticleThumbnailUploadSignature(): Promise<CloudinarySignedUpload> {
    const res = (await axiosInstance.get('/admin/articles/upload-signature')) as unknown as ApiResponse<CloudinarySignedUpload>
    return res.data
  },
}

/** POST trực tiếp tới Cloudinary (giống banner / media manager). */
async function postFileToCloudinary(file: File, sig: CloudinarySignedUpload): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', sig.apiKey)
  fd.append('timestamp', String(sig.timestamp))
  fd.append('signature', sig.signature)
  fd.append('folder', sig.folder)
  if (sig.publicId) {
    fd.append('public_id', sig.publicId)
  }
  if (sig.overwrite) {
    fd.append('overwrite', 'true')
  }
  const res = await fetch(sig.uploadUrl, {
    method: 'POST',
    body: fd,
  })
  const text = await res.text()
  let json: { secure_url?: string; error?: { message?: string } }
  try {
    json = JSON.parse(text) as typeof json
  } catch {
    throw new Error(`Cloudinary phản hồi không hợp lệ (${res.status})`)
  }
  if (!res.ok) {
    const msg = json.error?.message ?? text.slice(0, 200)
    throw new Error(msg || `Upload thất bại (${res.status})`)
  }
  const url = json.secure_url
  if (!url || typeof url !== 'string') {
    throw new Error('Phản hồi upload không có secure_url')
  }
  return url
}

export async function uploadArticleThumbnailImage(file: File): Promise<string> {
  const sig = await articleService.fetchArticleThumbnailUploadSignature()
  return postFileToCloudinary(file, sig)
}
