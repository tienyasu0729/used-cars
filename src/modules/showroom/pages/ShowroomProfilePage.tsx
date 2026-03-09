import { useState, useEffect } from 'react'
import { Button, Card, Input } from '@/components'
import { showroomApi } from '@/api/showroomApi'
import { showroomsApi } from '@/api/showroomsApi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function ShowroomProfilePage() {
  const queryClient = useQueryClient()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const { data: showroom } = useQuery({
    queryKey: ['showroom-profile'],
    queryFn: () => showroomApi.getProfile(),
  })

  const [form, setForm] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
    description: '',
    lat: '',
    lng: '',
  })

  useEffect(() => {
    if (showroom) {
      setForm({
        name: showroom.name,
        address: showroom.address,
        email: showroom.email,
        phone: showroom.phone,
        description: (showroom as { description?: string }).description ?? '',
        lat: (showroom as { lat?: number }).lat?.toString() ?? '',
        lng: (showroom as { lng?: number }).lng?.toString() ?? '',
      })
    }
  }, [showroom])

  const updateMutation = useMutation({
    mutationFn: () =>
      showroomsApi.updateShowroom(showroom!.id, {
        ...form,
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lng: form.lng ? parseFloat(form.lng) : undefined,
      }),
    onSuccess: () => {
      setSuccess(true)
      setError(false)
      queryClient.invalidateQueries({ queryKey: ['showroom-profile'] })
    },
    onError: () => {
      setError(true)
      setSuccess(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (showroom) updateMutation.mutate()
  }

  if (!showroom) return null

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Hồ sơ Showroom</h1>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
          <span className="text-green-500">✓</span> Cập nhật thành công!
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
          <span className="text-red-500">!</span> Lỗi. Vui lòng thử lại.
        </div>
      )}

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Logo & Ảnh bìa</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center text-gray-500 text-xs">Logo</div>
              <div>
                <Button variant="outline" size="sm" type="button">Upload Logo</Button>
                <p className="text-xs text-gray-500 mt-1">JPG/PNG. Max 2MB</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa</label>
            <div className="aspect-[3/1] bg-gray-200 rounded-lg flex items-center justify-center">
              <Button variant="outline" size="sm" type="button">Upload Ảnh bìa</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Vị trí (Đà Nẵng)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Vĩ độ (Latitude)" value={form.lat} onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))} placeholder="16.0544" />
          <Input label="Kinh độ (Longitude)" value={form.lng} onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))} placeholder="108.2022" />
        </div>
        <p className="text-sm text-gray-500 mt-2">Pin vị trí trên bản đồ (Google Maps API)</p>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <Input label="Tên showroom" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Địa chỉ" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Số điện thoại" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6600] outline-none" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" variant="primary" disabled={updateMutation.isPending}>Lưu thay đổi</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
