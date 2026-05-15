import { Info, AlertCircle, FileText } from 'lucide-react'

export function DepositInfoCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="flex gap-3 rounded-lg bg-blue-50 p-4">
        <Info className="h-5 w-5 shrink-0 text-[#1A3C6E]" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Quy định đặt cọc</p>
          <p className="text-xs text-slate-600">Số tiền tối thiểu là 10% giá xe cho mỗi lần đặt cọc.</p>
        </div>
      </div>
      <div className="flex gap-3 rounded-lg bg-amber-50 p-4">
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Thời hạn giữ chỗ</p>
          <p className="text-xs text-slate-600">Mặc định là 07 ngày kể từ ngày đặt cọc thành công.</p>
        </div>
      </div>
      <div className="flex gap-3 rounded-lg bg-blue-50 p-4">
        <FileText className="h-5 w-5 shrink-0 text-[#1A3C6E]" />
        <div>
          <p className="text-sm font-semibold text-slate-900">In phiếu thu</p>
          <p className="text-xs text-slate-600">Hệ thống tự động tạo file PDF sau khi lưu thành công.</p>
        </div>
      </div>
    </div>
  )
}
