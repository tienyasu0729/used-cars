import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Info, Image, MapPin, Calendar, CloudUpload, Check } from 'lucide-react'
import { useCreateBranch } from '@/hooks/useAdminMutations'
import { useUsers } from '@/hooks/useUsers'
import { Button } from '@/components/ui'
import { useToastStore } from '@/store/toastStore'

interface FormData {
  name: string
  address: string
  phone: string
  email: string
  workingHours: string
  district: string
  description: string
  latitude: string
  longitude: string
  managerUserId: string
  monFri: boolean
  saturday: boolean
  sunday: boolean
  holidays: boolean
}

const DISTRICTS = ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Liên Chiểu', 'Ngũ Hành Sơn', 'Cẩm Lệ', 'Hòa Vang']

function apiErr(e: unknown, fallback: string) {
  const ax = e as { response?: { data?: { message?: string } } }
  return ax.response?.data?.message || fallback
}

export function AdminAddBranchPage() {
  const navigate = useNavigate()
  const toast = useToastStore()
  const createBranch = useCreateBranch()
  const { data: branchManagers = [] } = useUsers({ role: 'BranchManager', status: 'active', search: '' })

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      workingHours: '',
      district: '',
      description: '',
      latitude: '',
      longitude: '',
      managerUserId: '',
      monFri: true,
      saturday: true,
      sunday: false,
      holidays: false,
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await createBranch.mutateAsync({
        name: data.name,
        address: data.address,
        phone: data.phone.trim() || undefined,
        managerId: data.managerUserId.trim() ? Number(data.managerUserId) : undefined,
      })
      toast.addToast('success', 'Đã tạo chi nhánh.')
      navigate('/admin/branches')
    } catch (e) {
      toast.addToast('error', apiErr(e, 'Không tạo được chi nhánh.'))
    }
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/admin/dashboard" className="hover:text-[#1A3C6E]">Admin</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/admin/branches" className="hover:text-[#1A3C6E]">Chi nhánh</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-700">Chi nhánh mới</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Thêm Chi Nhánh Mới</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/branches')}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit} loading={form.formState.isSubmitting}>
            Tạo Chi Nhánh
          </Button>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Tạo hồ sơ chi nhánh</h3>
        <p className="mt-1 text-sm text-slate-500">
          Gửi lên API: tên, địa chỉ, điện thoại, và tùy chọn <strong>managerId</strong> (user quản lý đã tồn tại). Các trường khác chỉ ghi chú trên form.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-slate-500" />
              <h4 className="font-semibold text-slate-900">Thông tin gửi API</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tên chi nhánh *</label>
                <input {...form.register('name', { required: true })} placeholder="vd. BanXeOTo Đà Nẵng - Hải Châu Center" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Địa chỉ chi tiết *</label>
                <input {...form.register('address', { required: true })} placeholder="Số nhà, Tên đường..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</label>
                <input {...form.register('phone')} placeholder="+84 236 XXX XXXX" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Quản lý (user ID — tùy chọn)</label>
                <select {...form.register('managerUserId')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E]">
                  <option value="">— Không gán —</option>
                  {branchManagers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} (#{u.id})</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">Danh sách user vai trò BranchManager đang hoạt động.</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-slate-500" />
              <h4 className="font-semibold text-slate-900">Ghi chú (không gửi API)</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input {...form.register('email')} type="email" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Giờ làm việc</label>
                <input {...form.register('workingHours')} placeholder="vd. 08:00 - 18:00" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Quận/Huyện</label>
                <select {...form.register('district')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="">Chọn quận/huyện</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Mô tả</label>
                <textarea {...form.register('description')} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Image className="h-5 w-5 text-slate-500" />
              <h4 className="font-semibold text-slate-900">Thư viện ảnh chi nhánh</h4>
            </div>
            <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 py-12 text-center">
              <CloudUpload className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600">Chưa có API upload ảnh chi nhánh trong Sprint này.</p>
              <Button variant="outline" size="sm" className="mt-4" type="button" disabled>Chọn ảnh</Button>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-slate-500" />
              <h4 className="font-semibold text-slate-900">Tọa độ GPS (ghi chú)</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Vĩ độ</label>
                <input {...form.register('latitude')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Kinh độ</label>
                <input {...form.register('longitude')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="flex h-32 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
                Xem trước bản đồ
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-500" />
              <h4 className="font-semibold text-slate-900">Ngày làm việc</h4>
            </div>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" {...form.register('monFri')} className="rounded" />
                <span className="text-sm text-slate-700">Thứ Hai - Thứ Sáu</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" {...form.register('saturday')} className="rounded" />
                <span className="text-sm text-slate-700">Thứ Bảy</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" {...form.register('sunday')} className="rounded" />
                <span className="text-sm text-slate-700">Chủ Nhật</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" {...form.register('holidays')} className="rounded" />
                <span className="text-sm text-slate-700">Ngày lễ</span>
              </label>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="mb-4 font-semibold text-slate-900">Trạng thái chi nhánh</h4>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="font-medium text-slate-700">Kích hoạt khi tạo</span>
              <Check className="h-4 w-4 text-green-500" />
            </div>
            <p className="mt-2 text-xs text-slate-500">Backend đặt status active mặc định.</p>
          </div>
        </div>
      </form>
    </div>
  )
}
