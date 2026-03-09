import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button, Card } from '@/components'
import { customerApi } from '@/api/customerApi'

export function SosRescuePage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRequest = async () => {
    setLoading(true)
    setSuccess(false)
    const result = await customerApi.requestRescue()
    setLoading(false)
    setSuccess(result.success)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Cứu hộ khẩn cấp</h1>

        <Card className="p-6 mb-6">
          <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
            <span className="text-gray-500 text-sm">Bản đồ - Vị trí hiện tại</span>
          </div>
          <p className="text-sm text-gray-600">Vị trí của bạn sẽ được gửi khi yêu cầu cứu hộ</p>
        </Card>

        <Button
          variant="danger"
          size="lg"
          className="w-full py-12 text-xl"
          onClick={handleRequest}
          disabled={loading}
        >
          <AlertTriangle className="w-8 h-8 mr-2 inline" />
          {loading ? 'Đang gửi...' : 'Yêu cầu cứu hộ khẩn cấp'}
        </Button>

        {success && (
          <p className="mt-4 text-center text-green-600 font-medium">Đã gửi yêu cầu thành công!</p>
        )}

        <p className="mt-6 text-sm text-gray-500 text-center">
          Đội cứu hộ sẽ liên hệ trong 15-30 phút
        </p>
      </div>
    </div>
  )
}
