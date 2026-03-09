import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Button } from '@/components'
import { showroomApi } from '@/api/showroomApi'
import { Star, MessageSquare } from 'lucide-react'

export function ReviewsPage() {
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const { data: reviews = [] } = useQuery({
    queryKey: ['showroom-reviews'],
    queryFn: () => showroomApi.getReviews(),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Đánh giá từ khách hàng</h1>

      <div className="space-y-4">
        {reviews.map((r) => (
          <Card key={r.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.customerName}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mt-2">{r.comment}</p>
                <p className="text-sm text-gray-400 mt-1">{r.date}</p>
                {r.reply && (
                  <div className="mt-4 pl-4 border-l-2 border-[#FF6600]">
                    <p className="text-sm font-medium text-gray-700">Phản hồi:</p>
                    <p className="text-gray-600">{r.reply}</p>
                  </div>
                )}
              </div>
              {!r.reply && (
                <Button variant="outline" size="sm" onClick={() => setReplyingId(r.id)}>
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Phản hồi
                </Button>
              )}
            </div>
            {replyingId === r.id && (
              <div className="mt-4 pt-4 border-t flex gap-2">
                <input
                  type="text"
                  placeholder="Viết phản hồi..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <Button variant="primary" size="sm">Gửi</Button>
                <Button variant="outline" size="sm" onClick={() => { setReplyingId(null); setReplyText('') }}>Hủy</Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <Card className="p-8 text-center text-gray-500">Chưa có đánh giá</Card>
      )}
    </div>
  )
}
