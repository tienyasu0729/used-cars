import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Button, Input } from '@/components'
import { staffApi } from '@/api/staffApi'

export function VerificationPage() {
  const [notes, setNotes] = useState('')

  const { data: verifications = [] } = useQuery({
    queryKey: ['staff-refund-verifications'],
    queryFn: () => staffApi.getRefundVerifications(),
  })

  const item = verifications[0]
  if (!item) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Xác minh hoàn cọc</h1>
        <Card className="p-8 text-center text-gray-500">Không có yêu cầu cần xác minh</Card>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Xác minh hoàn cọc</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Ảnh khách hàng gửi</h3>
          <div className="grid grid-cols-2 gap-4">
            {item.customerPhotos.map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400 text-sm">Ảnh {i + 1}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Báo cáo kiểm tra 142 điểm</h3>
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
            {item.inspectionReport}
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <Input
          label="Ghi chú xác minh"
          placeholder="Nhập ghi chú gửi Super Admin..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="mt-4">
          <Button variant="primary">Gửi báo cáo xác minh</Button>
        </div>
      </Card>
    </div>
  )
}
