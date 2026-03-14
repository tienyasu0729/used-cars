import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import {
  Info,
  FileText,
  Tag,
  ImagePlus,
  Upload,
  Rocket,
  Bold,
  Italic,
  List,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  Info as InfoCircle,
  CheckCircle,
} from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { useBranchStaff } from '@/hooks/useBranchStaff'

const schema = z.object({
  brand: z.string().min(1, 'Bắt buộc'),
  model: z.string().min(1, 'Bắt buộc'),
  year: z.number().min(2000).max(new Date().getFullYear()),
  price: z.number().min(0),
  mileage: z.number().min(0),
  fuelType: z.string().min(1),
  transmission: z.string().min(1),
  bodyStyle: z.string().min(1),
  seats: z.number().min(1),
  plateNumber: z.string().optional(),
  exteriorColor: z.string().optional(),
  status: z.string().min(1),
  assignedStaffId: z.string().min(1, 'Bắt buộc'),
  showNegotiablePrice: z.boolean(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const selectClass =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]'

export function ManagerAddVehiclePage() {
  const navigate = useNavigate()
  const { data: staff } = useBranchStaff()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      year: 2023,
      mileage: 0,
      price: 0,
      fuelType: 'xang',
      transmission: 'at',
      bodyStyle: 'sedan',
      seats: 5,
      plateNumber: '43A-123.45',
      status: 'available',
      assignedStaffId: 's1',
      showNegotiablePrice: false,
    },
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
    navigate('/manager/vehicles')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <nav className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/manager/dashboard" className="hover:text-[#1A3C6E]">Quản lý</Link>
        <span>/</span>
        <Link to="/manager/vehicles" className="hover:text-[#1A3C6E]">Xe đang bán</Link>
        <span>/</span>
        <span className="font-medium text-[#1A3C6E]">Thêm xe mới</span>
      </nav>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Thêm Xe Mới</h1>
        <p className="mt-1 text-slate-600">
          Nhập thông tin chi tiết cho phương tiện mới tại thị trường Đà Nẵng
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#1A3C6E]/10">
                  <Info className="h-4 w-4 text-[#1A3C6E]" />
                </span>
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Hãng xe</label>
                  <Input {...register('brand')} placeholder="VD: Toyota" />
                  {errors.brand && <p className="text-xs text-red-500">{errors.brand.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Dòng xe</label>
                  <Input {...register('model')} placeholder="VD: Camry" />
                  {errors.model && <p className="text-xs text-red-500">{errors.model.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Năm sản xuất</label>
                  <Input type="number" {...register('year', { valueAsNumber: true })} placeholder="2023" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Biển số</label>
                  <Input {...register('plateNumber')} placeholder="43A-123.45" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Số Km đã đi</label>
                  <Input type="number" {...register('mileage', { valueAsNumber: true })} placeholder="VD: 15000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Màu sắc</label>
                  <select {...register('exteriorColor')} className={selectClass}>
                    <option value="Trắng">Trắng</option>
                    <option value="Đen">Đen</option>
                    <option value="Xám">Xám</option>
                    <option value="Đỏ">Đỏ</option>
                    <option value="Xanh dương">Xanh dương</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nhiên liệu</label>
                  <select {...register('fuelType')} className={selectClass}>
                    <option value="xang">Xăng</option>
                    <option value="diesel">Dầu (Diesel)</option>
                    <option value="electric">Điện</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Hộp số</label>
                  <select {...register('transmission')} className={selectClass}>
                    <option value="at">Số tự động (AT)</option>
                    <option value="mt">Số sàn (MT)</option>
                    <option value="cvt">Vô cấp (CVT)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Kiểu dáng</label>
                  <select {...register('bodyStyle')} className={selectClass}>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV / Crossover</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="mpv">MPV</option>
                    <option value="pickup">Bán tải</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Số chỗ ngồi</label>
                  <Input type="number" {...register('seats', { valueAsNumber: true })} placeholder="5" />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <FileText className="h-5 w-5 text-[#1A3C6E]" />
                Mô tả chi tiết
              </h3>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-2">
                  <button type="button" className="rounded p-1 hover:bg-slate-200">
                    <Bold className="h-5 w-5" />
                  </button>
                  <button type="button" className="rounded p-1 hover:bg-slate-200">
                    <Italic className="h-5 w-5" />
                  </button>
                  <button type="button" className="rounded p-1 hover:bg-slate-200">
                    <List className="h-5 w-5" />
                  </button>
                  <button type="button" className="rounded p-1 hover:bg-slate-200">
                    <Link2 className="h-5 w-5" />
                  </button>
                  <span className="mx-1 h-6 w-px bg-slate-300" />
                  <button type="button" className="rounded p-1 hover:bg-slate-200">
                    <AlignLeft className="h-5 w-5" />
                  </button>
                  <button type="button" className="rounded p-1 hover:bg-slate-200">
                    <AlignCenter className="h-5 w-5" />
                  </button>
                  <button type="button" className="rounded p-1 hover:bg-slate-200">
                    <AlignRight className="h-5 w-5" />
                  </button>
                </div>
                <textarea
                  {...register('description')}
                  rows={8}
                  placeholder="Mô tả tình trạng xe, lịch sử bảo dưỡng, trang bị thêm..."
                  className="w-full border-none bg-white p-4 focus:ring-0"
                />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <ImagePlus className="h-5 w-5 text-[#1A3C6E]" />
                Hình ảnh phương tiện
              </h3>
              <div className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 transition-colors hover:bg-slate-100">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-[#1A3C6E]">
                  <Upload className="h-8 w-8" />
                </div>
                <p className="font-bold text-slate-900">Kéo thả hình ảnh hoặc Click để chọn</p>
                <p className="mt-1 text-sm text-slate-500">Hỗ trợ định dạng JPG, PNG. Tối đa 15 ảnh.</p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-lg border border-slate-200 bg-slate-100"
                  >
                    <ImageIcon className="h-8 w-8 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <Tag className="h-5 w-5 text-[#1A3C6E]" />
                Niêm yết & Trạng thái
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Giá bán (VNĐ)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="0"
                      className="pr-12 font-bold text-[#1A3C6E]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      VNĐ
                    </span>
                  </div>
                  {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Trạng thái xe</label>
                  <select {...register('status')} className={selectClass}>
                    <option value="available">Sẵn có (Tại showroom)</option>
                    <option value="transporting">Đang vận chuyển</option>
                    <option value="reserved">Đã đặt cọc</option>
                    <option value="sold">Đã bán</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nhân viên phụ trách</label>
                  <select {...register('assignedStaffId')} className={selectClass}>
                    {(staff ?? []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      {...register('showNegotiablePrice')}
                      className="rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]"
                    />
                    <span className="text-sm font-medium text-slate-600">Hiển thị giá thương lượng</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#1A3C6E]/10 bg-[#1A3C6E]/5 p-6">
              <h4 className="mb-2 flex items-center gap-2 font-bold text-[#1A3C6E]">
                <InfoCircle className="h-4 w-4" />
                Ghi chú quan trọng
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-[#1A3C6E]" />
                  Kiểm tra kỹ biển số xe trước khi đăng
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-[#1A3C6E]" />
                  Hình ảnh cần rõ nét, không dính logo bên thứ 3
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-end gap-4 pb-12 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            className="w-full border border-slate-200 px-8 py-3 font-bold text-slate-600 hover:bg-slate-100 sm:w-auto"
            onClick={() => navigate('/manager/vehicles')}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto px-8 py-3 font-bold"
          >
            Lưu Nháp
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto px-10 py-3 font-bold shadow-lg shadow-[#1A3C6E]/20"
          >
            <Rocket className="h-5 w-5" />
            Đăng Xe Ngay
          </Button>
        </div>
      </form>
    </div>
  )
}
