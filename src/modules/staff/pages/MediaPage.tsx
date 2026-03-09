import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Button } from '@/components'
import { staffApi, type MediaItem } from '@/api/staffApi'
import { Copy, Trash2, Upload } from 'lucide-react'

export function MediaPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data: media = [] } = useQuery({
    queryKey: ['staff-media'],
    queryFn: () => staffApi.getMedia(),
  })

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Media Library</h1>

      <div className="mb-6">
        <Button variant="primary">
          <Upload className="w-4 h-4 mr-2" />
          Upload media
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {media.map((item: MediaItem) => (
          <Card key={item.id} className="overflow-hidden group">
            <div className="aspect-square bg-gray-200 flex items-center justify-center">
              {item.type === 'image' ? (
                <span className="text-gray-400 text-sm">IMG</span>
              ) : (
                <span className="text-gray-400 text-sm">VID</span>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 truncate" title={item.name}>{item.name}</p>
              <div className="flex gap-1 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => copyUrl(item.id, item.url)}
                >
                  {copiedId === item.id ? 'Đã copy' : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {media.length === 0 && (
        <Card className="p-12 text-center text-gray-500">Chưa có media. Nhấn Upload để thêm.</Card>
      )}
    </div>
  )
}
