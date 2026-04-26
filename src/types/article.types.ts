export interface ArticleCategory {
  id: number
  name: string
  slug: string
  description: string | null
  sortOrder: number
  active: boolean
}

export interface ArticleListItem {
  id: number
  title: string
  slug: string
  summary: string | null
  thumbnailUrl: string | null
  authorName: string | null
  categoryName: string | null
  categorySlug: string | null
  status: string
  publishedAt: string | null
  createdAt: string
  viewCount: number
}

export interface ArticleDetail {
  id: number
  title: string
  slug: string
  summary: string | null
  content: string
  thumbnailUrl: string | null
  authorName: string | null
  authorId: number | null
  categoryName: string | null
  categorySlug: string | null
  categoryId: number | null
  status: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  viewCount: number
}

export interface CreateArticleRequest {
  title: string
  slug?: string
  summary?: string
  content: string
  thumbnailUrl?: string
  categoryId?: number | null
  status?: string
}

export interface UpdateArticleRequest {
  title?: string
  slug?: string
  summary?: string
  content?: string
  thumbnailUrl?: string
  categoryId?: number | null
  status?: string
}

export interface CreateCategoryRequest {
  name: string
  slug?: string
  description?: string
  sortOrder?: number
  active?: boolean
}
