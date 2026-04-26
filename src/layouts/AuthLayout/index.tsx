import { Outlet } from 'react-router-dom'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { BrandLogo } from '@/components/common/BrandLogo'
import { Car, MapPin, Calendar } from 'lucide-react'

const HERO_IMAGE = 'https://placehold.co/800x500/1a3c6e/white?text=BanXeOTo'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <ScrollToTop />
      <aside className="hidden w-[40%] flex-col justify-between bg-[#1A3C6E] p-8 lg:flex xl:p-12">
        <div>
          <BrandLogo variant="dark" logoHeight={48} />
          <p className="mt-4 text-lg text-white/90">Mua bán xe uy tín tại Đà Nẵng</p>
        </div>
        <div className="relative my-8 flex-1 overflow-hidden rounded-xl">
          <img
            src={HERO_IMAGE}
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
        </div>
        <div className="grid grid-cols-3 gap-6 border-t border-white/20 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-sm text-white/70">Xe đã bán</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">5</p>
              <p className="text-sm text-white/70">Chi nhánh</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">10+</p>
              <p className="text-sm text-white/70">Năm hoạt động</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex w-full flex-col items-center justify-center bg-white p-6 lg:w-[60%]">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
