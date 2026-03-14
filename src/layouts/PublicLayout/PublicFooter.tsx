import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'

const quickLinks = [
  { to: '/vehicles', label: 'Mua xe' },
  { to: '/branches', label: 'Chi nhánh' },
  { to: '/compare', label: 'So sánh xe' },
  { to: '/about', label: 'Về chúng tôi' },
  { to: '/contact', label: 'Liên hệ' },
]

export function PublicFooter() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#1A3C6E] py-16 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <div>
            <div className="mb-6">
              <BrandLogo variant="dark" linkTo="/" logoHeight={36} />
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Hệ thống mua bán xe ô tô uy tín hàng đầu miền Trung, chuyên cung cấp các dòng xe lướt, xe đã qua kiểm định chất lượng cao.
            </p>
          </div>
          <div>
            <h5 className="mb-6 font-bold text-white">Liên kết nhanh</h5>
            <ul className="space-y-4 text-sm">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="mb-6 font-bold text-white">Thông tin liên hệ</h5>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-[#E8612A]" />
                123 Nguyễn Hữu Thọ, Đà Nẵng
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-[#E8612A]" />
                0905 XXX XXX
              </li>
              <li className="flex gap-3">
                <Mail className="h-5 w-5 shrink-0 text-[#E8612A]" />
                info@banxeotodanang.com
              </li>
              <li className="flex gap-3">
                <Clock className="h-5 w-5 shrink-0 text-[#E8612A]" />
                Thứ 2 - CN: 08:00 - 20:00
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2025 BanXeOTo Da Nang. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-white">Điều khoản sử dụng</Link>
            <Link to="/privacy" className="hover:text-white">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
