import { MessageCircle } from 'lucide-react'

/** Hộp thư tư vấn — hiển thị khi tính năng được kích hoạt. */
export function StaffConsultationsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center">
      <MessageCircle className="mx-auto h-12 w-12 text-slate-400" aria-hidden />
      <h1 className="text-xl font-bold text-slate-900">Tư vấn &amp; hộp thư</h1>
      <p className="text-sm text-slate-600">
        Chưa có danh sách yêu cầu tư vấn trên hệ thống. Trang sẽ hiển thị khi tính năng được kích hoạt.
      </p>
      <p className="text-xs text-slate-500">
        Các số liệu tổng hợp trên trang tổng quan (nếu có) luôn lấy từ dữ liệu thật của hệ thống.
      </p>
    </div>
  )
}
