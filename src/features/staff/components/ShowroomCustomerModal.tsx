import { useState } from 'react'
import { Modal, Button } from '@/components/ui'

export interface ShowroomCustomerData {
  fullName: string
  email: string
  phone: string
  address: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: ShowroomCustomerData) => void
}

const EMPTY: ShowroomCustomerData = { fullName: '', email: '', phone: '', address: '' }

export function ShowroomCustomerModal({ isOpen, onClose, onConfirm }: Props) {
  const [form, setForm] = useState<ShowroomCustomerData>({ ...EMPTY })
  const [errors, setErrors] = useState<Partial<Record<keyof ShowroomCustomerData, string>>>({})

  const set = (field: keyof ShowroomCustomerData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof ShowroomCustomerData, string>> = {}
    if (!form.fullName.trim()) e.fullName = 'Họ tên không được bỏ trống'
    if (!form.email.trim()) e.email = 'Email không được bỏ trống'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Email không hợp lệ'
    if (!form.phone.trim()) e.phone = 'SĐT không được bỏ trống'
    if (!form.address.trim()) e.address = 'Địa chỉ không được bỏ trống'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onConfirm({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    })
    setForm({ ...EMPTY })
    setErrors({})
  }

  const handleClose = () => {
    setForm({ ...EMPTY })
    setErrors({})
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Thêm khách hàng mới"
      footer={
        <>
          <Button type="button" variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Xác nhận
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Họ tên" value={form.fullName} onChange={(v) => set('fullName', v)} error={errors.fullName} placeholder="Nguyễn Văn A" />
        <Field label="Email" value={form.email} onChange={(v) => set('email', v)} error={errors.email} placeholder="email@example.com" type="email" />
        <Field label="Số điện thoại" value={form.phone} onChange={(v) => set('phone', v)} error={errors.phone} placeholder="0901234567" type="tel" />
        <Field label="Địa chỉ" value={form.address} onChange={(v) => set('address', v)} error={errors.address} placeholder="123 Đường ABC, Quận X, TP. Đà Nẵng" />
      </div>
    </Modal>
  )
}

function Field({ label, value, onChange, error, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2 text-sm ${error ? 'border-red-400' : 'border-slate-200'}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
