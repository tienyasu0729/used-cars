import { MessageSquare } from 'lucide-react'

/** Mẫu kích hoạt thông báo — chờ API cấu hình; không dùng dữ liệu giả. */
export function ConfigNotificationTab() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center">
      <MessageSquare className="h-10 w-10 text-slate-400" aria-hidden />
      <p className="text-sm font-semibold text-slate-800">Chưa có mẫu email / SMS từ API</p>
      <p className="max-w-md text-sm text-slate-600">
        Khi quản trị bật cấu hình thông báo trên hệ thống, danh sách trình kích hoạt và nội dung mẫu sẽ hiển thị tại
        đây.
      </p>
    </div>
  )
}
