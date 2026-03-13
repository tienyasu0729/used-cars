import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'

const quickLinks = [
  { to: '/vehicles', label: 'Mua xe' },
  { to: '/branches', label: 'Chi nhánh' },
  { to: '/compare', label: 'So sánh xe' },
  { to: '/about', label: 'Về chúng tôi' },
  { to: '/contact', label: 'Liên hệ' },
]

export function PublicFooter() {
  const [email, setEmail] = useState('')

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setEmail('')
    }
  }

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4">
              <BrandLogo variant="light" linkTo="/" logoHeight={36} />
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Chuyên mua bán, trao đổi các dòng xe ô tô đã qua sử dụng uy tín hàng đầu tại Đà Nẵng.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-[#1A3C6E]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900">Thông tin liên hệ</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#1A3C6E]" />
                Hải Châu, Đà Nẵng
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#1A3C6E]" />
                1900 6868
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#1A3C6E]" />
                contact@scudn.vn
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-slate-900">Đăng ký nhận tin</h4>
            <p className="mb-3 text-sm text-slate-500">
              Nhận thông tin xe mới và ưu đãi qua email.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]/20"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-bold text-white hover:bg-[#152d52]"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-100 pt-8 text-center text-xs text-slate-400">
          © 2024 SCUDN. Bảo lưu mọi quyền.
        </div>
      </div>
    </footer>
  )
}
