import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, GripVertical, Pencil, Trash2, Camera, ChevronDown } from 'lucide-react'
import { useCMS } from '@/hooks/useCMS'
import { Button } from '@/components/ui'

const TABS = [
  { key: 'banners', label: 'Banner Trang Chủ' },
  { key: 'articles', label: 'Bài Viết' },
  { key: 'static', label: 'Trang Tĩnh' },
] as const

type TabKey = (typeof TABS)[number]['key']

export function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('banners')
  const [articleStatusFilter, setArticleStatusFilter] = useState('all')
  const [articleFilterOpen, setArticleFilterOpen] = useState(false)
  const articleFilterRef = useRef<HTMLDivElement>(null)
  const { data: cms, isLoading } = useCMS()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (articleFilterRef.current && !articleFilterRef.current.contains(e.target as Node)) {
        setArticleFilterOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const banners = cms?.banners ?? []
  const articles = cms?.articles ?? []

  const filteredArticles = articleStatusFilter === 'all'
    ? articles
    : articles.filter((a: { status: string }) => a.status === articleStatusFilter)

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/admin/dashboard" className="hover:text-[#1A3C6E]">Admin</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-700">CMS Management</span>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">CMS Management</h2>
          <p className="mt-1 text-slate-500">Quản lý banner, tin tức và các trang thông tin tĩnh của hệ thống.</p>
        </div>
        <Button variant="primary">+ Tạo Bài Viết</Button>
      </div>
      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key ? 'border-[#1A3C6E] text-[#1A3C6E]' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-slate-400" />
                <h3 className="font-semibold text-slate-900">Thứ tự hiển thị</h3>
              </div>
              <span className="text-sm text-slate-500">Kéo thả để sắp xếp lại vị trí</span>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-8 text-center text-slate-500">Đang tải...</div>
              ) : (
                banners.map((b: { id: string; title: string; image: string; link: string; status: string }) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4"
                  >
                    <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-slate-400" />
                    <img src={b.image} alt="" className="h-16 w-28 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{b.title}</p>
                      <p className="text-sm text-slate-500">{b.link}</p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${b.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                        {b.status === 'published' ? 'Đang hiển thị' : 'Tạm ẩn'}
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button className="rounded p-2 text-slate-500 hover:bg-[#1A3C6E]/10 hover:text-[#1A3C6E]">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="rounded p-2 text-slate-500 hover:bg-red-600/10 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 py-12">
                <Camera className="h-12 w-12 text-slate-400" />
                <p className="mt-2 font-medium text-slate-600">Thêm Banner Mới</p>
                <p className="mt-1 text-sm text-slate-500">Kích thước khuyến nghị: 1920×600px (.jpg, .png)</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Danh sách bài viết gần đây</h3>
              <div className="relative" ref={articleFilterRef}>
                <button
                  onClick={() => setArticleFilterOpen(!articleFilterOpen)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
                >
                  {articleStatusFilter === 'all' ? 'Tất cả trạng thái' : articleStatusFilter === 'published' ? 'Đã xuất bản' : 'Nháp'}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {articleFilterOpen && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    <button onClick={() => { setArticleStatusFilter('all'); setArticleFilterOpen(false) }} className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50">Tất cả trạng thái</button>
                    <button onClick={() => { setArticleStatusFilter('published'); setArticleFilterOpen(false) }} className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50">Đã xuất bản</button>
                    <button onClick={() => { setArticleStatusFilter('draft'); setArticleFilterOpen(false) }} className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50">Nháp</button>
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tiêu đề bài viết</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Danh mục</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày tạo</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredArticles.map((a: { id: string; title: string; category: string; publishedAt: string; status: string }) => (
                    <tr key={a.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{a.title}</td>
                      <td className="px-4 py-3 text-slate-600">{a.category}</td>
                      <td className="px-4 py-3 text-slate-600">{a.publishedAt}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                          {a.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="rounded p-1.5 text-slate-500 hover:bg-[#1A3C6E]/10 hover:text-[#1A3C6E]">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredArticles.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-500">Chưa có bài viết nào</div>
              )}
            </div>
          </div>
        </div>
      )}
      {activeTab === 'articles' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Bài viết</h3>
            <Button variant="primary" size="sm">+ Tạo bài viết</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tiêu đề</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Danh mục</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày tạo</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((a: { id: string; title: string; category: string; publishedAt: string; status: string }) => (
                  <tr key={a.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{a.title}</td>
                    <td className="px-4 py-3 text-slate-600">{a.category}</td>
                    <td className="px-4 py-3 text-slate-600">{a.publishedAt}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                        {a.status === 'published' ? 'Đã xuất bản' : 'Nháp'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="rounded p-1.5 text-slate-500 hover:bg-[#1A3C6E]/10 hover:text-[#1A3C6E]">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'static' && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500">Trang tĩnh - Đang phát triển</p>
        </div>
      )}
    </div>
  )
}
