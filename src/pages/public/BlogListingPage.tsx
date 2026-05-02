import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePublishedArticles, useArticleCategories } from '@/hooks/useArticles'
import { Pagination, Spinner } from '@/components/ui'

export function BlogListingPage() {
  useDocumentTitle('Tin tức & Bài viết')

  const [searchParams, setSearchParams] = useSearchParams()
  const initialKeyword = searchParams.get('keyword') ?? ''
  const initialCategory = searchParams.get('category') ?? undefined
  const initialPage = Math.max(0, Number(searchParams.get('page') ?? '1') - 1)

  const [searchInput, setSearchInput] = useState(initialKeyword)

  const { data: categories } = useArticleCategories()
  const { data, isLoading } = usePublishedArticles({
    keyword: initialKeyword || undefined,
    category: initialCategory,
    page: initialPage,
    size: 12,
  })

  const articles = useMemo(() => data?.items ?? [], [data])
  const meta = data?.meta

  const featuredArticles = useMemo(
    () => articles.filter((article) => article.featured),
    [articles],
  )
  const heroArticle = featuredArticles[0] ?? articles[0]
  const spotlightArticles = (featuredArticles[0] ? featuredArticles.slice(1, 3) : articles.slice(1, 3)).filter(
    (article) => article.id !== heroArticle?.id,
  )
  const regularArticles = articles.filter((article) => article.id !== heroArticle?.id && !spotlightArticles.some((spot) => spot.id === article.id))

  const updateParams = (next: { keyword?: string; category?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams)
    if (next.keyword !== undefined) {
      if (next.keyword) params.set('keyword', next.keyword)
      else params.delete('keyword')
    }
    if (next.category !== undefined) {
      if (next.category) params.set('category', next.category)
      else params.delete('category')
    }
    if (next.page !== undefined) {
      if (next.page > 1) params.set('page', String(next.page))
      else params.delete('page')
    }
    setSearchParams(params)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ keyword: searchInput.trim(), page: 1 })
  }

  return (
    <div className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_24%,#fff7ed_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <section className="mb-8 overflow-hidden rounded-[28px] border border-slate-200 bg-[#0f2748] px-6 py-8 text-white shadow-[0_30px_80px_-40px_rgba(15,39,72,0.8)] lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.3fr,0.7fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-300">Tạp chí xe cũ</p>
              <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                Tin tức, kinh nghiệm và xu hướng dành cho người mua xe đã qua sử dụng
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                Từ đánh giá động cơ, so sánh hãng xe, đến mẹo lái thử và bảo dưỡng thực tế tại showroom.
              </p>
              <form onSubmit={handleSearch} className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Tìm bài viết, mẫu xe, chủ đề..."
                    className="w-full rounded-2xl border border-white/10 bg-white px-10 py-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-orange-300"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#E8612A] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500"
                >
                  Tìm kiếm
                </button>
              </form>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Chủ đề tin tức</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => updateParams({ category: '', page: 1 })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    !initialCategory ? 'bg-white text-[#0f2748]' : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  Tất cả
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParams({ category: cat.slug, page: 1 })}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      initialCategory === cat.slug ? 'bg-white text-[#0f2748]' : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : articles.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center text-slate-500">
            {initialKeyword ? `Không tìm thấy bài viết cho "${initialKeyword}"` : 'Chưa có bài viết nào.'}
          </div>
        ) : (
          <div className="space-y-8">
            {heroArticle ? (
              <section className="grid gap-6 lg:grid-cols-[1.4fr,0.6fr]">
                <Link
                  to={`/news/${heroArticle.slug}`}
                  className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    {heroArticle.thumbnailUrl ? (
                      <img src={heroArticle.thumbnailUrl} alt={heroArticle.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : null}
                  </div>
                  <div className="space-y-3 p-6">
                    <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                      Bài nổi bật
                    </span>
                    <h2 className="text-2xl font-black leading-tight text-slate-900">{heroArticle.title}</h2>
                    {heroArticle.summary ? <p className="line-clamp-3 text-sm leading-7 text-slate-600">{heroArticle.summary}</p> : null}
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      {heroArticle.categoryName ? <span>{heroArticle.categoryName}</span> : null}
                      {heroArticle.publishedAt ? <time>{new Date(heroArticle.publishedAt).toLocaleDateString('vi-VN')}</time> : null}
                      <span>{heroArticle.viewCount} lượt xem</span>
                    </div>
                  </div>
                </Link>

                <div className="space-y-4">
                  {spotlightArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/news/${article.slug}`}
                      className="group flex gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                        {article.thumbnailUrl ? (
                          <img src={article.thumbnailUrl} alt={article.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Nổi bật</span>
                        <h3 className="mt-2 line-clamp-2 text-base font-bold text-slate-900 group-hover:text-[#1A3C6E]">{article.title}</h3>
                        {article.summary ? <p className="mt-2 line-clamp-2 text-sm text-slate-500">{article.summary}</p> : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="grid gap-6 lg:grid-cols-[260px,1fr]">
              <aside className="h-fit rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">Mục lục tin tức</p>
                <div className="mt-4 space-y-2">
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParams({ category: cat.slug, page: 1 })}
                      className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${
                        initialCategory === cat.slug
                          ? 'bg-[#1A3C6E] text-white'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </aside>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {regularArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/news/${article.slug}`}
                    className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                      {article.thumbnailUrl ? (
                        <img src={article.thumbnailUrl} alt={article.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : null}
                    </div>
                    <div className="p-5">
                      {article.categoryName ? (
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1A3C6E]">
                          {article.categoryName}
                        </span>
                      ) : null}
                      <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-[#1A3C6E]">{article.title}</h3>
                      {article.summary ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{article.summary}</p> : null}
                      <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                        {article.publishedAt ? <time>{new Date(article.publishedAt).toLocaleDateString('vi-VN')}</time> : null}
                        <span>{article.viewCount} lượt xem</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {meta && meta.totalPages > 1 ? (
              <div className="mt-8">
                <Pagination
                  page={meta.page + 1}
                  totalPages={meta.totalPages}
                  total={meta.totalElements}
                  pageSize={meta.size}
                  onPageChange={(p) => updateParams({ page: p })}
                  label="bài viết"
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
