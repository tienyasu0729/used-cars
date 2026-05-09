import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Modal } from '@/components/ui'
import { paymentApi } from '@/services/paymentApi'
import { useStaffOrderPayments } from '@/hooks/useStaffOrderPayments'
import { useToastStore } from '@/store/toastStore'
import { formatPrice } from '@/utils/format'
import type { UserRole } from '@/types/auth.types'
import type { OrderPaymentStaffRow } from '@/services/paymentApi'

function parseApiErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const d = (err as { response?: { data?: { message?: string } } }).response?.data
    if (d?.message && typeof d.message === 'string') return d.message
  }
  return 'Không thực hiện được.'
}

function staffOrderNumericId(raw: string): number | null {
  const s = raw.trim()
  if (/^\d+$/.test(s)) return Number(s)
  const m = /^ORD-(\d+)$/i.exec(s)
  return m ? Number(m[1]) : null
}

function canRefundRole(role: UserRole | undefined) {
  return role === 'Admin' || role === 'BranchManager'
}

function canVnpayQuery(p: OrderPaymentStaffRow) {
  return p.paymentMethod.toLowerCase() === 'vnpay' && p.vnpPayCreateDate != null && p.vnpPayCreateDate !== ''
}

function canVnpayRefund(p: OrderPaymentStaffRow, role: UserRole | undefined) {
  return (
    canRefundRole(role) &&
    p.paymentMethod.toLowerCase() === 'vnpay' &&
    p.status === 'Completed' &&
    canVnpayQuery(p) &&
    (p.vnpLastRefundRequestId == null || p.vnpLastRefundRequestId === '')
  )
}

type Props = {
  orderIdRaw: string
  staffRole: UserRole | undefined
}

export function StaffOrderPaymentsPanel({ orderIdRaw, staffRole }: Props) {
  const numericId = staffOrderNumericId(orderIdRaw)
  const toast = useToastStore()
  const qc = useQueryClient()
  const { data, isLoading, isError, error, refetch } = useStaffOrderPayments(numericId)
  const [busyQuery, setBusyQuery] = useState<number | null>(null)
  const [busyRefund, setBusyRefund] = useState<number | null>(null)
  const [queryPreview, setQueryPreview] = useState<string | null>(null)
  const [refundPayId, setRefundPayId] = useState<number | null>(null)
  const [refundNote, setRefundNote] = useState('')

  if (numericId == null) {
    return (
      <p className="text-xs text-amber-700">
        Không đọc được mã đơn số từ &quot;{orderIdRaw}&quot; — cần id đơn khớp backend để xem thanh toán.
      </p>
    )
  }

  const errText = isError ? parseApiErrorMessage(error) : null

  const runQuery = async (orderPaymentId: number) => {
    setBusyQuery(orderPaymentId)
    try {
      const j = await paymentApi.vnpayQuery(orderPaymentId)
      setQueryPreview(JSON.stringify(j, null, 2))
      toast.addToast('success', 'Đã truy vấn VNPay.')
    } catch (e) {
      toast.addToast('error', parseApiErrorMessage(e))
    } finally {
      setBusyQuery(null)
    }
  }

  const runRefund = async () => {
    if (refundPayId == null) return
    setBusyRefund(refundPayId)
    try {
      await paymentApi.vnpayRefund(refundPayId, refundNote)
      toast.addToast('success', 'VNPay đã xác nhận hoàn tiền.')
      setRefundPayId(null)
      setRefundNote('')
      await qc.invalidateQueries({ queryKey: ['staff-order-payments', numericId] })
    } catch (e) {
      toast.addToast('error', parseApiErrorMessage(e))
    } finally {
      setBusyRefund(null)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-bold uppercase text-slate-500">Giao dịch thanh toán (hệ thống)</h3>
      {isLoading && <p className="text-sm text-slate-500">Đang tải…</p>}
      {errText && (
        <p className="text-sm text-red-600">
          {errText}{' '}
          <button type="button" className="underline" onClick={() => refetch()}>
            Thử lại
          </button>
        </p>
      )}
      {!isLoading && !errText && (data?.length ?? 0) === 0 && (
        <p className="text-sm text-slate-600">Chưa có bản ghi thanh toán cho đơn này.</p>
      )}
      {!isLoading && !errText && (data?.length ?? 0) > 0 && (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Cổng</th>
                  <th className="py-2 pr-2">Trạng thái</th>
                  <th className="py-2 pr-2 text-right">Số tiền</th>
                  <th className="py-2 text-right">VNPay</th>
                </tr>
              </thead>
              <tbody>
                {data!.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2 font-mono text-xs">{p.id}</td>
                    <td className="py-2 pr-2">{p.paymentMethod}</td>
                    <td className="py-2 pr-2">{p.status}</td>
                    <td className="py-2 pr-2 text-right font-medium">{formatPrice(p.amount)}</td>
                    <td className="py-2 text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        {canVnpayQuery(p) && (
                          <Button
                            type="button"
                            variant="outline"
                            className="px-2 py-1 text-xs"
                            loading={busyQuery === p.id}
                            onClick={() => runQuery(p.id)}
                          >
                            Truy vấn
                          </Button>
                        )}
                        {canVnpayRefund(p, staffRole) && (
                          <Button
                            type="button"
                            variant="outline"
                            className="border-amber-200 px-2 py-1 text-xs text-amber-900"
                            onClick={() => {
                              setRefundPayId(p.id)
                              setRefundNote('')
                            }}
                          >
                            Hoàn tiền
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {queryPreview && (
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-600">Kết quả truy vấn (đã bỏ chữ ký)</p>
              <pre className="max-h-40 overflow-auto rounded border border-slate-200 bg-slate-50 p-2 text-xs">{queryPreview}</pre>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={refundPayId != null}
        onClose={() => {
          setRefundPayId(null)
          setRefundNote('')
        }}
        title="Hoàn tiền VNPay (toàn phần)"
        footer={
          <>
            <Button variant="outline" onClick={() => setRefundPayId(null)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              className="bg-amber-700 hover:bg-amber-800"
              loading={busyRefund != null}
              onClick={() => void runRefund()}
            >
              Xác nhận hoàn
            </Button>
          </>
        }
      >
        <p className="mb-2 text-sm text-slate-600">
          Gửi yêu cầu hoàn toàn phần tới VNPay cho thanh toán #{refundPayId}. Thao tác cần quyền quản lý / admin.
        </p>
        <label className="mb-1 block text-xs font-medium text-slate-600">Ghi chú gửi VNPay (tùy chọn)</label>
        <textarea
          value={refundNote}
          onChange={(e) => setRefundNote(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </Modal>
    </div>
  )
}
