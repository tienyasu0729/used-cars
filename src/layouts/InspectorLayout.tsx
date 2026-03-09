import { Outlet, Link, useLocation } from 'react-router-dom'
import { ClipboardList, Play, Award, User } from 'lucide-react'
import { Logo } from '@/components'

const inspectorMenu = [
  { label: 'Nhiệm vụ', path: '/inspector/tasks', icon: ClipboardList },
  { label: 'Đang check', path: '/inspector/active', icon: Play },
  { label: 'Đã chứng nhận', path: '/inspector/certified', icon: Award },
  { label: 'Cá nhân', path: '/inspector/profile', icon: User },
]

export function InspectorLayout() {
  const location = useLocation()
  const isActive = (path: string) => location.pathname.startsWith(path) || (path === '/inspector/tasks' && location.pathname === '/inspector')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
        <Logo size="sm" />
        <span className="font-bold text-gray-800 ml-2">SCUDN Inspector</span>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-pb">
        <div className="grid grid-cols-4 h-16">
          {inspectorMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 text-xs ${
                isActive(item.path) ? 'text-[#FF6600] font-medium' : 'text-gray-500'
              }`}
            >
              <item.icon className="w-6 h-6" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
