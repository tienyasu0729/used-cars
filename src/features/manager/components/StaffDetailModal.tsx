import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Pencil, Trash2, History, ArrowRightLeft, Loader2, RotateCcw } from 'lucide-react'
import type { ManagerStaffMember } from '@/types/managerStaff.types'
import { managerStaffService } from '@/services/managerStaff.service'
import { branchService } from '@/services/branch.service'
import { useToastStore } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { Button, Input, Badge, Modal, ConfirmDialog } from '@/components/ui'

interface StaffDetailModalProps {
  staff: ManagerStaffMember | null
  isOpen: boolean
  onClose: () => void
  allowMutations?: boolean
  /** Cho phép khôi phục nhân viên đã gỡ (quản lý / admin, không đồng cấp). */
  allowRestore?: boolean
}

function parseStaffId(id: string): number | null {
  const n = Number.parseInt(id, 10)
  return Number.isFinite(n) ? n : null
}

function formatIsoDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = iso.slice(0, 10)
  if (d.length !== 10) return iso
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function tomorrowIso(): string {
  const t = new Date()
  t.setDate(t.getDate() + 1)
  return t.toISOString().slice(0, 10)
}

/** Panel có key={staff.id} ở ngoài → mỗi nhân viên mount lại, không cần effect đồng bộ form. */
function StaffDetailPanel({
  staff,
  onClose,
  allowMutations = true,
  allowRestore = false,
}: {
  staff: ManagerStaffMember
  onClose: () => void
  allowMutations?: boolean
  allowRestore?: boolean
}) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const authUser = useAuthStore((s) => s.user)

  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState(staff.name)
  const [editPhone, setEditPhone] = useState(staff.phone === '—' ? '' : staff.phone)
  const [transferOpen, setTransferOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false)
  const [lockInactiveConfirmOpen, setLockInactiveConfirmOpen] = useState(false)
  const [transferBranchId, setTransferBranchId] = useState(
    staff.branchId !== '—' ? staff.branchId : '',
  )
  const [transferStart, setTransferStart] = useState(tomorrowIso())

  const staffNumericId = parseStaffId(staff.id)
  /** ID số từ backend — mới gọi được API quản lý nhân viên. */
  const useApi = staffNumericId != null

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['manager-staff-assignments', staffNumericId],
    queryFn: () => managerStaffService.listAssignments(staffNumericId!),
    enabled: useApi && staffNumericId != null,
  })

  const { data: branches = [] } = useQuery({
    queryKey: ['branches-for-transfer'],
    queryFn: () => branchService.getBranches(),
    enabled: useApi && transferOpen,
  })

  const invalidateStaff = () => {
    void queryClient.invalidateQueries({ queryKey: ['branch-staff'] })
    if (staffNumericId != null) {
      void queryClient.invalidateQueries({ queryKey: ['manager-staff-assignments', staffNumericId] })
    }
  }

  const updateMut = useMutation({
    mutationFn: () =>
      managerStaffService.update(staffNumericId!, {
        name: editName.trim(),
        phone: editPhone.trim() === '' ? null : editPhone.trim(),
      }),
    onSuccess: () => {
      addToast('success', 'Đã cập nhật thông tin nhân viên.')
      setEditOpen(false)
      invalidateStaff()
    },
    onError: (e: unknown) => {
      const m = (e as { message?: string })?.message
      addToast('error', m ?? 'Không cập nhật được.')
    },
  })

  const statusMut = useMutation({
    mutationFn: (status: 'active' | 'inactive') =>
      managerStaffService.updateStatus(staffNumericId!, { status }),
    onSuccess: (_, status) => {
      addToast('success', status === 'active' ? 'Đã kích hoạt tài khoản.' : 'Đã đặt trạng thái không hoạt động.')
      invalidateStaff()
      onClose()
    },
    onError: (e: unknown) => {
      const m = (e as { message?: string })?.message
      addToast('error', m ?? 'Không đổi trạng thái được.')
    },
  })

  const restoreMut = useMutation({
    mutationFn: () =>
      managerStaffService.restore(
        staffNumericId!,
        authUser?.role === 'Admin' && typeof authUser.branchId === 'number'
          ? { branchId: authUser.branchId }
          : undefined,
      ),
    onSuccess: () => {
      addToast('success', 'Đã khôi phục nhân viên vào nhân sự chi nhánh.')
      setRestoreConfirmOpen(false)
      invalidateStaff()
      onClose()
    },
    onError: (e: unknown) => {
      const m = (e as { message?: string })?.message
      addToast('error', m ?? 'Không khôi phục được nhân viên.')
    },
  })

  const deleteMut = useMutation({
    mutationFn: () => managerStaffService.delete(staffNumericId!),
    onSuccess: () => {
      addToast('success', 'Đã gỡ nhân viên. Hồ sơ vẫn nằm trong danh sách với trạng thái đã gỡ.')
      setDeleteConfirmOpen(false)
      invalidateStaff()
      onClose()
    },
    onError: (e: unknown) => {
      const m = (e as { message?: string })?.message
      addToast('error', m ?? 'Không xóa được.')
    },
  })

  const transferMut = useMutation({
    mutationFn: () =>
      managerStaffService.transfer(staffNumericId!, {
        branchId: Number.parseInt(transferBranchId, 10),
        startDate: transferStart,
      }),
    onSuccess: () => {
      addToast('success', 'Đã điều chuyển nhân viên sang chi nhánh mới.')
      setTransferOpen(false)
      invalidateStaff()
    },
    onError: (e: unknown) => {
      const m = (e as { message?: string })?.message
      addToast('error', m ?? 'Không điều chuyển được. Kiểm tra ngày bắt đầu và chi nhánh đích.')
    },
  })

  const canAct = allowMutations && useApi && !staff.accountRemoved
  const busy =
    updateMut.isPending ||
    statusMut.isPending ||
    deleteMut.isPending ||
    transferMut.isPending ||
    restoreMut.isPending

  const handleDeleteClick = () => {
    if (!canAct) return
    setDeleteConfirmOpen(true)
  }

  const handleTransfer = () => {
    const bid = Number.parseInt(transferBranchId, 10)
    if (!Number.isFinite(bid)) {
      addToast('error', 'Chọn chi nhánh đích.')
      return
    }
    transferMut.mutate()
  }

  return (
    <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-2xl sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold">Chi tiết nhân viên</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600">
              {staff.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-900">{staff.name}</h3>
              <p className="text-sm text-[#1A3C6E]">{staff.role}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{staff.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {staff.accountRemoved ? (
                  <Badge variant="danger">Đã gỡ khỏi nhân sự</Badge>
                ) : (
                  <Badge variant={staff.status === 'active' ? 'available' : 'default'}>
                    {staff.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {!useApi && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Không có mã nhân viên hợp lệ từ hệ thống — chỉ xem thông tin. Sửa, xóa hoặc phân công cần tải đủ dữ liệu
              nhân viên từ máy chủ.
            </p>
          )}
          {staff.accountRemoved && useApi && (
            <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">
              Tài khoản đã được gỡ khỏi nhân sự. Bạn vẫn xem được lịch sử phân công.
              {allowRestore
                ? ' Bạn có thể khôi phục để họ đăng nhập lại và làm việc tại chi nhánh.'
                : ' Bạn không thể sửa, điều chuyển hay gỡ lại trong phạm vi quyền hiện tại.'}
            </p>
          )}
        </div>

        {canAct && (
          <div className="space-y-4 border-b border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">Thông tin</h4>
              {!editOpen ? (
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#1A3C6E] hover:underline"
                >
                  <Pencil className="h-4 w-4" />
                  Sửa tên & SĐT
                </button>
              ) : null}
            </div>
            {editOpen ? (
              <div className="space-y-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-600">Họ tên</span>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} disabled={busy} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-slate-600">Số điện thoại</span>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} disabled={busy} />
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="flex-1 bg-[#1A3C6E] text-white"
                    disabled={busy || !editName.trim()}
                    onClick={() => updateMut.mutate()}
                  >
                    {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu'}
                  </Button>
                  <Button type="button" variant="ghost" disabled={busy} onClick={() => setEditOpen(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                SĐT: <span className="font-medium text-slate-900">{staff.phone}</span>
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {staff.status === 'active' ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="border border-slate-200"
                  disabled={busy}
                  onClick={() => setLockInactiveConfirmOpen(true)}
                >
                  Khóa (inactive)
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="border border-slate-200"
                  disabled={busy}
                  onClick={() => statusMut.mutate('active')}
                >
                  Kích hoạt lại
                </Button>
              )}
            </div>
          </div>
        )}

        {useApi && (
          <div className="space-y-3 border-b border-slate-100 p-6">
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              <History className="h-4 w-4" />
              Phân công chi nhánh
            </h4>
            <p className="text-xs leading-relaxed text-slate-500">
              Đây là lịch sử phân công nhân viên theo chi nhánh. Một người có thể có nhiều mốc; bản ghi đang hoạt động là
              chi nhánh hiện tại. Khi điều chuyển, hệ thống sẽ kết thúc phân công cũ và tạo phân công mới.
            </p>
            {assignmentsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có dữ liệu phân công.</p>
            ) : (
              <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
                {assignments.map((a) => (
                  <li
                    key={a.id}
                    className={`rounded-lg border px-3 py-2 ${
                      a.active ? 'border-[#1A3C6E]/30 bg-[#1A3C6E]/5' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-900">{a.branchName || `CN #${a.branchId}`}</span>
                      {a.active ? (
                        <span className="text-[10px] font-bold uppercase text-[#1A3C6E]">Đang làm</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatIsoDate(a.startDate)} → {a.endDate ? formatIsoDate(a.endDate) : '—'}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {canAct && (
              <>
                <button
                  type="button"
                  onClick={() => setTransferOpen(!transferOpen)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  {transferOpen ? 'Đóng form điều chuyển' : 'Điều chuyển sang chi nhánh khác'}
                </button>
                {transferOpen && (
                  <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-slate-600">Chi nhánh đích</span>
                      <select
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        value={transferBranchId}
                        onChange={(e) => setTransferBranchId(e.target.value)}
                        disabled={busy}
                      >
                        <option value="">— Chọn —</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-slate-600">Ngày bắt đầu tại CN mới</span>
                      <Input
                        type="date"
                        value={transferStart}
                        onChange={(e) => setTransferStart(e.target.value)}
                        disabled={busy}
                      />
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Ngày phải trong tương lai và (nếu đang có phân công) sau ngày bắt đầu hiện tại.
                    </p>
                    <Button
                      type="button"
                      className="w-full bg-[#1A3C6E] text-white"
                      disabled={busy || !transferBranchId}
                      onClick={handleTransfer}
                    >
                      {transferMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Xác nhận điều chuyển'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {canAct && (
          <div className="mt-auto flex gap-3 p-6">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 border border-red-200 text-red-600 hover:bg-red-50"
              disabled={busy}
              onClick={handleDeleteClick}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Gỡ khỏi nhân sự
            </Button>
          </div>
        )}

        {staff.accountRemoved && allowRestore && useApi && (
          <div className="mt-auto border-t border-slate-100 p-6">
            <Button
              type="button"
              className="w-full bg-[#1A3C6E] text-white"
              disabled={busy}
              onClick={() => setRestoreConfirmOpen(true)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Khôi phục nhân sự
            </Button>
          </div>
        )}

        <ConfirmDialog
          isOpen={lockInactiveConfirmOpen}
          onClose={() => setLockInactiveConfirmOpen(false)}
          title="Khóa tài khoản?"
          message="Đặt trạng thái tài khoản là không hoạt động? Nhân viên sẽ không đăng nhập được cho đến khi được kích hoạt lại."
          confirmLabel="Khóa tài khoản"
          loading={statusMut.isPending}
          onConfirm={async () => {
            try {
              await statusMut.mutateAsync('inactive')
            } finally {
              setLockInactiveConfirmOpen(false)
            }
          }}
        />

        <Modal
          isOpen={deleteConfirmOpen}
          onClose={() => {
            if (!deleteMut.isPending) setDeleteConfirmOpen(false)
          }}
          title="Gỡ nhân viên khỏi danh sách làm việc?"
          footer={
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" disabled={deleteMut.isPending} onClick={() => setDeleteConfirmOpen(false)}>
                Hủy
              </Button>
              <Button variant="danger" loading={deleteMut.isPending} onClick={() => deleteMut.mutate()}>
                Đồng ý
              </Button>
            </div>
          }
        >
          <p className="text-sm text-slate-600">
            Nhân viên <strong>{staff.name}</strong> sẽ bị gỡ khỏi nhân sự (không xóa hẳn dữ liệu). Họ vẫn hiển thị trong
            bảng với trạng thái &quot;Đã gỡ khỏi nhân sự&quot; và không thể đăng nhập. Tiếp tục?
          </p>
        </Modal>

        <Modal
          isOpen={restoreConfirmOpen}
          onClose={() => {
            if (!restoreMut.isPending) setRestoreConfirmOpen(false)
          }}
          title="Khôi phục nhân viên?"
          footer={
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" disabled={restoreMut.isPending} onClick={() => setRestoreConfirmOpen(false)}>
                Hủy
              </Button>
              <Button className="bg-[#1A3C6E] text-white" loading={restoreMut.isPending} onClick={() => restoreMut.mutate()}>
                Đồng ý
              </Button>
            </div>
          }
        >
          <p className="text-sm text-slate-600">
            Khôi phục <strong>{staff.name}</strong> vào nhân sự chi nhánh: tài khoản có thể đăng nhập lại và phân công làm
            việc được tạo lại nếu cần. Tiếp tục?
          </p>
        </Modal>

        {!allowMutations && useApi && !allowRestore && (
          <div className="p-6 text-center text-sm text-slate-500">
            Bạn không thể chỉnh sửa nhân sự cùng vai trò hệ thống với tài khoản của mình.
          </div>
        )}
    </aside>
  )
}

export function StaffDetailModal({
  staff,
  isOpen,
  onClose,
  allowMutations = true,
  allowRestore = false,
}: StaffDetailModalProps) {
  if (!isOpen || !staff) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} aria-hidden />
      <StaffDetailPanel
        key={staff.id}
        staff={staff}
        onClose={onClose}
        allowMutations={allowMutations}
        allowRestore={allowRestore}
      />
    </>
  )
}
