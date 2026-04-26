import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useBranches } from '@/hooks/useBranches'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { createConsultation } from '@/services/consultation.service'
import { useToastStore } from '@/store/toastStore'

export function ContactPage() {
  useDocumentTitle('Liên hệ')
  const { data: branches } = useBranches()
  const [searchParams] = useSearchParams()
  const vehicleIdParam = searchParams.get('vehicleId')
  const vehicleIdNum = vehicleIdParam ? parseInt(vehicleIdParam, 10) : NaN
  const toast = useToastStore()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const msgParts = [form.subject.trim(), form.message.trim()].filter(Boolean)
    const message = msgParts.join('\n\n').trim()
    if (!form.name.trim() || !form.phone.trim() || !message) {
      toast.addToast('error', 'Vui lòng điền họ tên, SĐT và nội dung.')
      return
    }
    setSubmitting(true)
    try {
      await createConsultation({
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        vehicleId: Number.isFinite(vehicleIdNum) ? vehicleIdNum : undefined,
        message,
        priority: 'medium',
      })
      toast.addToast(
        'success',
        'Phiếu tư vấn gửi thành công, chúng tôi sẽ liên hệ sớm!',
      )
      setForm({ name: '', phone: '', subject: '', message: '' })
    } catch (err: unknown) {
      const m = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Gửi thất bại.'
      toast.addToast('error', m)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
      <h1 className="text-2xl font-semibold text-gray-900">Liên Hệ / Tư Vấn</h1>
      <p className="mt-2 text-gray-500">Gửi yêu cầu tư vấn, chúng tôi sẽ phản hồi trong 24h</p>
      {Number.isFinite(vehicleIdNum) && (
        <p className="mt-2 text-sm text-[#1A3C6E]">
          Bạn đang gửi tư vấn từ trang chi tiết xe. Phiếu sẽ kèm thông tin xe đó để showroom tiếp nhận và chuyển tới chi nhánh phù hợp.
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">Gửi Yêu Cầu</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Họ tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Số điện thoại (10 số, bắt đầu 0)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <Input
              label="Chủ đề (tùy chọn)"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <div>
              <label className="mb-1 block text-sm font-medium">Nội dung</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]"
              />
            </div>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Đang gửi…' : 'Gửi Yêu Cầu'}
            </Button>
          </form>
        </div>

        <div>
          <h2 className="mb-4 font-semibold">Thông Tin Chi Nhánh</h2>
          <div className="space-y-4">
            {branches?.map((b) => (
              <div key={b.id} className="rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium">{b.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{b.address}</p>
                <p className="text-sm">{b.phone}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 h-64 overflow-hidden rounded-xl bg-gray-200">
            <iframe
              title="Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.9242408000003!2d108.2022!3d16.0544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDAzJzE1LjgiTiAxMDjCsDEyJzA3LjkiRQ!5e0!3m2!1svi!2s!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
