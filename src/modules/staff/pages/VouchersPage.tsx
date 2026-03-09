import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Modal, Input } from '@/components'
import { staffApi, type StaffVoucher } from '@/api/staffApi'
import { Plus, Pencil } from 'lucide-react'

export function VouchersPage() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ code: '', discountPercent: 10, usageLimit: 100, expiryDate: '' })

  const { data: vouchers = [] } = useQuery({
    queryKey: ['staff-vouchers'],
    queryFn: () => staffApi.getVouchers(),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Quản lý Voucher</h1>

      <div className="mb-6">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo voucher
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">Mã</th>
              <th className="text-left py-3 px-4">Giảm %</th>
              <th className="text-left py-3 px-4">Giới hạn dùng</th>
              <th className="text-left py-3 px-4">Hết hạn</th>
              <th className="text-left py-3 px-4">Trạng thái</th>
              <th className="text-left py-3 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v: StaffVoucher) => (
              <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-mono font-medium">{v.code}</td>
                <td className="py-3 px-4">{v.discountPercent}%</td>
                <td className="py-3 px-4">{v.usageLimit}</td>
                <td className="py-3 px-4">{v.expiryDate}</td>
                <td className="py-3 px-4">
                  <span className={v.status === 'active' ? 'text-green-600' : 'text-gray-500'}>
                    {v.status === 'active' ? 'Hoạt động' : 'Tắt'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="ml-2">
                    Tắt
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Tạo voucher" size="md">
        <div className="space-y-4">
          <Input label="Mã voucher" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <Input label="Giảm %" type="number" value={form.discountPercent} onChange={(e) => setForm((f) => ({ ...f, discountPercent: +e.target.value }))} />
          <Input label="Giới hạn dùng" type="number" value={form.usageLimit} onChange={(e) => setForm((f) => ({ ...f, usageLimit: +e.target.value }))} />
          <Input label="Hết hạn" type="date" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="primary">Tạo</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
