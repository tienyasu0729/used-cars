import { useQuery } from '@tanstack/react-query'
import { Card, Button, Input } from '@/components'
import { staffApi } from '@/api/staffApi'

export function SeoPage() {
  const { data: pages = [] } = useQuery({
    queryKey: ['staff-seo'],
    queryFn: () => staffApi.getSeoPages(),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">SEO Metadata</h1>

      <div className="space-y-6">
        {pages.map((page) => (
          <Card key={page.id} className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{page.pageUrl}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Meta Title" defaultValue={page.metaTitle} />
              <Input label="Keywords" defaultValue={page.keywords} />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[80px]"
                defaultValue={page.metaDescription}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="primary">Cập nhật SEO</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
