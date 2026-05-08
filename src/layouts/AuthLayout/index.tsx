import { Outlet } from 'react-router-dom'
import { Car, Calendar, MapPin } from 'lucide-react'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { BrandLogo } from '@/components/common/BrandLogo'
import loginHero from '@/assets/login.jpg'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <ScrollToTop />

      <div className="flex min-h-screen">
        <aside className="relative hidden w-[52%] overflow-hidden lg:flex">
          <img src={loginHero} alt="Bờ biển Đà Nẵng" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,23,43,0.28),rgba(8,23,43,0.82))]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <div className="max-w-xl">
              <BrandLogo variant="dark" logoHeight={52} />
              <div className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                Nền tảng mua bán xe minh bạch tại Đà Nẵng
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight text-white xl:text-5xl">
                Chọn xe phù hợp.
                <br />
                Chốt giao dịch dễ hơn.
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <p className="mt-5 text-3xl font-bold text-white">500+</p>
                <p className="mt-1 text-sm text-white/75">Xe đã bán</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <p className="mt-5 text-3xl font-bold text-white">5</p>
                <p className="mt-1 text-sm text-white/75">Chi nhánh</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <p className="mt-5 text-3xl font-bold text-white">10+</p>
                <p className="mt-1 text-sm text-white/75">Năm hoạt động</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex w-full items-center justify-center px-4 py-8 sm:px-6 lg:w-[48%] lg:px-10">
          <div className="w-full max-w-xl">
            <div className="relative overflow-hidden rounded-[28px] bg-slate-900 lg:hidden">
              <img src={loginHero} alt="Bờ biển Đà Nẵng" className="h-56 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/55 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <BrandLogo variant="dark" logoHeight={40} />
                <p className="mt-3 max-w-xs text-sm leading-6 text-white/85">
                  Mua bán xe uy tín tại Đà Nẵng. Đăng nhập nhanh để tiếp tục giao dịch.
                </p>
              </div>
            </div>

            <div className="mt-6 lg:mt-0">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
