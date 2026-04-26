import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useArticleDetail } from '@/hooks/useArticles'
import { Spinner } from '@/components/ui'

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: article, isLoading, isError } = useArticleDetail(slug)

  useDocumentTitle(article?.title ?? 'Bài viết')

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Bài viết không tồn tại</h2>
        <p className="mt-2 text-gray-500">Bài viết bạn tìm có thể đã bị xóa hoặc chưa được xuất bản.</p>
        <Link to="/news" className="mt-4 inline-block text-[#1A3C6E] hover:underline">
          Quay lại danh sách tin tức
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-6">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#1A3C6E]">Trang chủ</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/news" className="hover:text-[#1A3C6E]">Tin tức</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-gray-900">{article.title}</span>
      </nav>

      {article.thumbnailUrl && (
        <img
          src={article.thumbnailUrl}
          alt={article.title}
          className="mb-6 w-full rounded-xl object-cover"
          style={{ maxHeight: 420 }}
        />
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {article.categoryName && (
          <Link
            to={`/news?category=${article.categorySlug}`}
            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#1A3C6E] hover:bg-blue-100"
          >
            {article.categoryName}
          </Link>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {article.authorName && <span>{article.authorName}</span>}
          {article.publishedAt && (
            <>
              <span className="text-gray-300">·</span>
              <time>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</time>
            </>
          )}
          <span className="text-gray-300">·</span>
          <span>{article.viewCount} lượt xem</span>
        </div>
      </div>

      <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900">{article.title}</h1>

      {article.summary && (
        <p className="mb-6 text-lg text-gray-600 leading-relaxed">{article.summary}</p>
      )}

      <div
        className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-a:text-[#1A3C6E]"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <div className="mt-10 border-t border-gray-200 pt-6">
        <Link to="/news" className="text-sm font-medium text-[#1A3C6E] hover:underline">
          ← Quay lại danh sách tin tức
        </Link>
      </div>
    </div>
  )
}
