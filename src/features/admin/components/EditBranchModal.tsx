import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Loader2 } from 'lucide-react'
import { Modal, Input, Button } from '@/components/ui'
import { BranchMap } from '@/components/map/BranchMap'
import { geocodeAddress } from '@/services/managerSettings.service'
import type { AdminBranch } from '@/types/admin.types'

const schema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  address: z.string().min(1, 'Bắt buộc'),
  phone: z.string().max(20).optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
})

type FormData = z.infer<typeof schema>

export interface EditBranchFormResult extends FormData {
  lat?: number
  lng?: number
}

interface EditBranchModalProps {
  branch: AdminBranch | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, data: EditBranchFormResult) => Promise<void>
}

export function EditBranchModal({ branch, isOpen, onClose, onSave }: EditBranchModalProps) {
  const [gpsLat, setGpsLat] = useState(0)
  const [gpsLng, setGpsLng] = useState(0)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeMsg, setGeocodeMsg] = useState('')

  // Reset tọa độ khi mở modal cho branch khác
  useEffect(() => {
    if (branch) {
      setGpsLat(branch.lat || 0)
      setGpsLng(branch.lng || 0)
      setGeocodeMsg('')
    }
  }, [branch])

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: branch
      ? {
          name: branch.name,
          address: branch.address,
          phone: branch.phone ?? '',
          status: branch.status,
        }
      : undefined,
  })

  const onSubmit = form.handleSubmit(async (data) => {
    if (!branch) return
    await onSave(branch.id, {
      ...data,
      lat: gpsLat || undefined,
      lng: gpsLng || undefined,
    })
    onClose()
  })

  // Gọi Goong Geocoding API để lấy tọa độ từ địa chỉ
  const handleGeocode = async () => {
    const address = form.getValues('address')?.trim()
    if (!address) {
      setGeocodeMsg('Vui lòng nhập địa chỉ trước.')
      return
    }
    setIsGeocoding(true)
    setGeocodeMsg('')
    try {
      const coords = await geocodeAddress(address)
      setGpsLat(coords.lat)
      setGpsLng(coords.lng)
      setGeocodeMsg(`Tọa độ: ${coords.lat.toFixed(7)}, ${coords.lng.toFixed(7)}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không lấy được tọa độ.'
      setGeocodeMsg(msg)
    } finally {
      setIsGeocoding(false)
    }
  }

  if (!branch) return null

  const hasCoords = gpsLat !== 0 && gpsLng !== 0
  const mapBranches = hasCoords
    ? [{ id: branch.id, name: branch.name, address: branch.address, phone: branch.phone, lat: gpsLat, lng: gpsLng }]
    : []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sửa chi nhánh"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant="primary" type="button" onClick={() => onSubmit()} loading={form.formState.isSubmitting}>
            Lưu
          </Button>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Tên" {...form.register('name')} error={form.formState.errors.name?.message} required />
        <Input label="Địa chỉ" {...form.register('address')} error={form.formState.errors.address?.message} required />
        <Input label="Điện thoại" {...form.register('phone')} error={form.formState.errors.phone?.message} />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Trạng thái</label>
          <select {...form.register('status')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm đóng</option>
          </select>
        </div>

        {/* Phần lấy tọa độ GPS */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Vị Trí GPS</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              {hasCoords ? `${gpsLat.toFixed(7)}, ${gpsLng.toFixed(7)}` : 'Chưa có tọa độ'}
            </span>
          </div>
          <button
            type="button"
            disabled={isGeocoding}
            onClick={handleGeocode}
            className="flex items-center gap-2 rounded-lg border border-[#1A3C6E] px-3 py-1.5 text-sm font-medium text-[#1A3C6E] transition-colors hover:bg-[#1A3C6E]/5 disabled:opacity-50"
          >
            {isGeocoding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lấy tọa độ…
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                Lấy tọa độ từ địa chỉ
              </>
            )}
          </button>
          {geocodeMsg && (
            <p className={`text-xs ${geocodeMsg.startsWith('Tọa độ') ? 'text-green-600' : 'text-red-500'}`}>
              {geocodeMsg}
            </p>
          )}
          {hasCoords && (
            <div className="h-[180px] overflow-hidden rounded-lg border border-slate-200">
              <BranchMap branches={mapBranches} zoom={15} />
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500">Quản lý chi nhánh gán qua hồ sơ user (BranchManager), không sửa tại đây.</p>
      </form>
    </Modal>
  )
}
