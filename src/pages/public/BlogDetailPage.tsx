import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ArrowLeft } from 'lucide-react'
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

  const categoryLink = article.categorySlug ? `/news?category=${article.categorySlug}` : '/news'

  return (
    <div className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_28%,#f8fafc_100%)]">
      <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500">
          <Link to="/" className="hover:text-[#1A3C6E]">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/news" className="hover:text-[#1A3C6E]">Tin tức</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-gray-900">{article.title}</span>
        </nav>

        <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          {article.thumbnailUrl ? (
            <div className="aspect-[16/7] overflow-hidden bg-slate-100">
              <img src={article.thumbnailUrl} alt={article.title} className="h-full w-full object-cover" />
            </div>
          ) : null}

          <div className="px-6 py-8 lg:px-10">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {article.categoryName ? (
                <Link
                  to={categoryLink}
                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1A3C6E] hover:bg-blue-100"
                >
                  {article.categoryName}
                </Link>
              ) : null}
              {article.featured ? (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                  Bài nổi bật
                </span>
              ) : null}
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {article.authorName ? <span>{article.authorName}</span> : null}
                {article.publishedAt ? <time>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</time> : null}
                <span>{article.viewCount} lượt xem</span>
              </div>
            </div>

            <h1 className="text-3xl font-black leading-tight text-slate-900 lg:text-4xl">{article.title}</h1>
            {article.summary ? (
              <p className="mt-4 text-lg leading-8 text-slate-600">{article.summary}</p>
            ) : null}

            <div
              className="prose prose-slate mt-8 max-w-none prose-headings:text-slate-900 prose-a:text-[#1A3C6E]"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="mt-10 border-t border-slate-200 pt-6">
              <Link to={categoryLink} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A3C6E] hover:underline">
                <ArrowLeft className="h-4 w-4" />
                {article.categoryName ? `Quay lại chủ đề ${article.categoryName}` : 'Quay lại danh sách tin tức'}
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
