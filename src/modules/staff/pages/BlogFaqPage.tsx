import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Button, Input } from '@/components'
import { staffApi, type BlogPost } from '@/api/staffApi'
import { Plus, Pencil, Eye } from 'lucide-react'

export function BlogFaqPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', content: '', category: 'Blog', status: 'draft' as 'draft' | 'published' })

  const { data: posts = [] } = useQuery({
    queryKey: ['staff-blog-posts'],
    queryFn: () => staffApi.getBlogPosts(),
  })

  const selected = posts.find((p: BlogPost) => p.id === selectedId)

  useEffect(() => {
    if (selected) setForm({ title: selected.title, content: selected.content, category: selected.category, status: selected.status })
  }, [selected])

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Blog & FAQ</h1>

      <div className="mb-6">
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Tạo bài viết
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {posts.map((post: BlogPost) => (
            <Card key={post.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                  <p className="text-sm text-gray-500">{post.category} • {post.status}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setSelectedId(post.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {selected && (
          <Card className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Chỉnh sửa</h2>
            <Input label="Tiêu đề" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[200px]"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="Blog">Blog</option>
                <option value="FAQ">FAQ</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'published' }))}
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
              </select>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline">Lưu nháp</Button>
              <Button variant="primary">Xuất bản</Button>
            </div>
          </Card>
        )}
      </div>

      {posts.length === 0 && (
        <Card className="p-8 text-center text-gray-500">Chưa có bài viết. Nhấn Tạo bài viết để thêm.</Card>
      )}
    </div>
  )
}
