import { useState, useRef } from 'react'
import { Button, Input } from '@/components'
import { Loader2 } from 'lucide-react'
import { customerApi } from '@/api/customerApi'

export function RefundRequestPage() {
  const [transactionId, setTransactionId] = useState('')
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await customerApi.requestRefund({ transactionId, reason })
      if (result.success) {
        setSubmitted(true)
        setTransactionId('')
        setReason('')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Yêu cầu hoàn tiền</h1>
        <p className="text-green-600 font-medium">Đã gửi yêu cầu thành công. Chúng tôi sẽ xử lý trong 3-5 ngày làm việc.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Yêu cầu hoàn tiền</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <Input
          label="Mã giao dịch"
          placeholder="VD: TXN-001"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lý do</label>
          <textarea
            placeholder="Mô tả lý do yêu cầu hoàn tiền..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bằng chứng (ảnh/video)</label>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            Chọn file
          </Button>
        </div>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
          Gửi yêu cầu
        </Button>
      </form>
    </div>
  )
}
