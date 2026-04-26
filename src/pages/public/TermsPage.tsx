import { Link } from 'react-router-dom'

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Điều khoản sử dụng</h1>
      <p className="mt-4 text-slate-600">
        Nội dung điều khoản sử dụng sẽ được cập nhật tại đây.
      </p>
      <Link to="/" className="mt-8 inline-block text-[#1A3C6E] font-medium hover:underline">
        ← Về trang chủ
      </Link>
    </div>
  )
}
