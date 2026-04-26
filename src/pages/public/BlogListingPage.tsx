import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePublishedArticles, useArticleCategories } from '@/hooks/useArticles'
import { Pagination, Spinner } from '@/components/ui'

export function BlogListingPage() {
  useDocumentTitle('Tin tức & Bài viết')

  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [page, setPage] = useState(0)

  const { data: categories } = useArticleCategories()
  const { data, isLoading } = usePublishedArticles({
    keyword: keyword || undefined,
    category: selectedCategory,
    page,
    size: 12,
  })

  const articles = data?.items ?? []
  const meta = data?.meta

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setKeyword(searchInput)
    setPage(0)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tin tức & Bài viết</h1>
        <p className="mt-2 text-gray-500">Cập nhật tin tức mới nhất về xe ô tô đã qua sử dụng</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setSelectedCategory(undefined); setPage(0) }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              !selectedCategory ? 'bg-[#1A3C6E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.slug); setPage(0) }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                selectedCategory === cat.slug ? 'bg-[#1A3C6E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : articles.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          {keyword ? `Không tìm thấy bài viết cho "${keyword}"` : 'Chưa có bài viết nào.'}
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg"
              >
                <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                  {article.thumbnailUrl ? (
                    <img
                      src={article.thumbnailUrl}
                      alt={article.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {article.categoryName && (
                    <span className="mb-2 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#1A3C6E]">
                      {article.categoryName}
                    </span>
                  )}
                  <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-[#1A3C6E]">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-500">{article.summary}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {article.authorName && <span>{article.authorName}</span>}
                    {article.publishedAt && (
                      <time>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</time>
                    )}
                    <span>{article.viewCount} lượt xem</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                page={meta.page + 1}
                totalPages={meta.totalPages}
                total={meta.totalElements}
                pageSize={meta.size}
                onPageChange={(p) => setPage(p - 1)}
                label="bài viết"
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
