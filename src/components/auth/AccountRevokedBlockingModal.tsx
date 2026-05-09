import { useEffect } from 'react'
import { useSessionRevokedStore } from '@/store/sessionRevokedStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui'

/**
 * Không nút X, không đóng khi click nền, không Escape — chỉ "Đồng ý" → logout.
 */
export function AccountRevokedBlockingModal() {
  const open = useSessionRevokedStore((s) => s.open)
  const apiMessage = useSessionRevokedStore((s) => s.apiMessage)
  const confirmAndLogout = useSessionRevokedStore((s) => s.confirmAndLogout)
  const role = useAuthStore((s) => s.user?.role)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const staffLike = role === 'SalesStaff' || role === 'BranchManager'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-revoked-title"
      aria-describedby="session-revoked-desc"
    >
      <div className="absolute inset-0 bg-slate-900/70" aria-hidden />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 id="session-revoked-title" className="text-lg font-semibold text-slate-900">
          Truy cập đã bị chấm dứt
        </h2>
        <div id="session-revoked-desc" className="mt-3 space-y-3 text-sm text-slate-600">
          {staffLike ? (
            <p>
              Tài khoản của bạn đã bị <strong>vô hiệu hóa hoặc khóa</strong> bởi quản trị viên hoặc quản lý chi nhánh.
              Bạn <strong>không còn là nhân viên</strong> có quyền sử dụng khu vực này của hệ thống.
            </p>
          ) : (
            <p>
              Tài khoản của bạn đã bị <strong>khóa hoặc tạm ngưng</strong>. Bạn không thể tiếp tục sử dụng ứng dụng với phiên đăng nhập hiện tại.
            </p>
          )}
          {apiMessage ? (
            <p className="rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-800">{apiMessage}</p>
          ) : null}
          <p className="text-xs text-slate-500">
            Nhấn <strong>Đồng ý</strong> để đăng xuất an toàn. Không thể đóng thông báo này bằng cách khác.
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="primary" type="button" onClick={confirmAndLogout} className="min-w-[140px]">
            Đồng ý
          </Button>
        </div>
      </div>
    </div>
  )
}
