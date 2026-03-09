import { useState } from 'react'
import { Button, Card, Input } from '@/components'
import { showroomApi } from '@/api/showroomApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { formatVnd } from '@/utils/formatters'

const STEPS = ['Basic Info', 'Specifications', 'Media', 'Pricing & Publish'] as const

export function AddCarPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    brand: '',
    model: '',
    year: 2024,
    price: 850_000_000,
    engine: '',
    transmission: 'automatic' as 'manual' | 'automatic',
    fuelType: 'petrol' as 'petrol' | 'diesel' | 'electric' | 'hybrid',
    odo: 0,
    color: '',
    vin: '',
    condition: 'excellent' as 'excellent' | 'good' | 'fair',
    promoPrice: '',
  })

  const createMutation = useMutation({
    mutationFn: () =>
      showroomApi.addCarListing({
        name: form.brand + ' ' + form.model,
        model: String(form.model),
        brand: form.brand,
        year: form.year,
        price: form.price,
        odo: form.odo,
        fuelType: form.fuelType,
        transmission: form.transmission,
        color: form.color,
        images: [],
        showroomId: 'sr-001',
        status: 'available',
        condition: form.condition,
        vin: form.vin || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showroom-inventory'] })
      navigate('/showroom/inventory')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 4) setStep((s) => s + 1)
    else createMutation.mutate()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Thêm xe mới</h1>
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i + 1 <= step ? 'bg-[#FF6600] text-white' : 'bg-gray-200 text-gray-500'}`}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span className={`ml-2 text-sm ${i + 1 === step ? 'font-medium text-gray-900' : 'text-gray-500'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`w-12 h-0.5 mx-2 ${i + 1 < step ? 'bg-[#FF6600]' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              <h2 className="font-semibold text-gray-900">Thông tin cơ bản</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Hãng xe" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} placeholder="Toyota" />
                <Input label="Model" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} placeholder="Camry" />
                <Input label="Năm" type="number" value={String(form.year)} onChange={(e) => setForm((f) => ({ ...f, year: +e.target.value || 2024 }))} />
                <Input label="Giá (VND)" type="number" value={String(form.price)} onChange={(e) => setForm((f) => ({ ...f, price: +e.target.value.replace(/\D/g, '') || 0 }))} />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="font-semibold text-gray-900">Thông số kỹ thuật</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Động cơ" value={form.engine} onChange={(e) => setForm((f) => ({ ...f, engine: e.target.value }))} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hộp số</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={form.transmission} onChange={(e) => setForm((f) => ({ ...f, transmission: e.target.value as 'manual' | 'automatic' }))}>
                    <option value="automatic">Tự động</option>
                    <option value="manual">Số sàn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhiên liệu</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={form.fuelType} onChange={(e) => setForm((f) => ({ ...f, fuelType: e.target.value as typeof form.fuelType }))}>
                    <option value="petrol">Xăng</option>
                    <option value="diesel">Dầu</option>
                    <option value="electric">Điện</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <Input label="Số km (ODO)" type="number" value={String(form.odo)} onChange={(e) => setForm((f) => ({ ...f, odo: +e.target.value || 0 }))} />
                <Input label="Màu xe" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
                <Input label="VIN" value={form.vin} onChange={(e) => setForm((f) => ({ ...f, vin: e.target.value }))} />
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="font-semibold text-gray-900">Ảnh & Video</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-2">Kéo thả ảnh hoặc nhấn để tải lên</p>
                <Button variant="outline" type="button">Upload ảnh</Button>
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <h2 className="font-semibold text-gray-900">Xem trước & Xuất bản</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{form.brand} {form.model} {form.year}</p>
                <p className="text-[#FF6600] font-bold">{formatVnd(form.price)}</p>
                <p className="text-sm text-gray-500">{form.odo} km • {form.transmission} • {form.fuelType}</p>
              </div>
              <Input label="Giá khuyến mãi (tùy chọn)" value={form.promoPrice} onChange={(e) => setForm((f) => ({ ...f, promoPrice: e.target.value }))} placeholder="Để trống nếu không có" />
            </>
          )}
          <div className="flex gap-2 pt-4">
            {step > 1 && <Button variant="outline" type="button" onClick={() => setStep((s) => s - 1)}>Quay lại</Button>}
            <Button variant="primary" type="submit" disabled={createMutation.isPending}>
              {step < 4 ? 'Tiếp theo' : 'Xuất bản'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
