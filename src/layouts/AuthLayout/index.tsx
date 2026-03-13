import { Outlet } from 'react-router-dom'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { BrandLogo } from '@/components/common/BrandLogo'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <ScrollToTop />
      <div className="hidden w-1/2 bg-[#1A3C6E] lg:flex lg:flex-col lg:justify-center lg:p-12">
        <div>
          <BrandLogo variant="dark" logoHeight={48} />
          <p className="mt-4 text-white/80">Chợ xe ô tô uy tín tại Đà Nẵng</p>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2">
        <Outlet />
      </div>
    </div>
  )
}
