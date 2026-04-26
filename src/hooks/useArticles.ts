import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { articleService } from '@/services/article.service'
import type { CreateArticleRequest, CreateCategoryRequest, UpdateArticleRequest } from '@/types/article.types'

export function usePublishedArticles(params: { keyword?: string; category?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['articles', 'published', params],
    queryFn: () => articleService.getPublishedArticles(params),
    staleTime: 30_000,
  })
}

export function useArticleDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ['articles', 'detail', slug],
    queryFn: () => articleService.getArticleBySlug(slug!),
    enabled: !!slug,
    staleTime: 60_000,
  })
}

export function useArticleCategories() {
  return useQuery({
    queryKey: ['articles', 'categories'],
    queryFn: () => articleService.getPublicCategories(),
    staleTime: 300_000,
  })
}

export function useAdminArticles(params: { keyword?: string; status?: string; categoryId?: number; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['admin', 'articles', params],
    queryFn: () => articleService.getAdminArticles(params),
    staleTime: 15_000,
  })
}

export function useAdminArticleDetail(id: number | undefined) {
  return useQuery({
    queryKey: ['admin', 'articles', 'detail', id],
    queryFn: () => articleService.getAdminArticleById(id!),
    enabled: !!id,
  })
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'articles', 'categories'],
    queryFn: () => articleService.getAdminCategories(),
    staleTime: 60_000,
  })
}

export function useCreateArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateArticleRequest) => articleService.createArticle(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] })
      qc.invalidateQueries({ queryKey: ['articles'] })
    },
  })
}

export function useUpdateArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateArticleRequest }) => articleService.updateArticle(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] })
      qc.invalidateQueries({ queryKey: ['articles'] })
    },
  })
}

export function useDeleteArticle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => articleService.deleteArticle(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] })
      qc.invalidateQueries({ queryKey: ['articles'] })
    },
  })
}

export function useToggleArticleVisibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => articleService.toggleVisibility(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] })
      qc.invalidateQueries({ queryKey: ['articles'] })
    },
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCategoryRequest) => articleService.createCategory(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'articles', 'categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CreateCategoryRequest }) => articleService.updateCategory(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'articles', 'categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => articleService.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'articles', 'categories'] }),
  })
}
