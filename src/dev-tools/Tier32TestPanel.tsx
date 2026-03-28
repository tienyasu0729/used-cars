import { useMemo, useState } from 'react'

const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'

type CaseResult = {
  id: string
  pass: boolean
  warn?: string
  message: string
  ms: number
}

function tomorrowYmd(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function dayAfterTomorrowYmd(): string {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  return d.toISOString().slice(0, 10)
}

async function api(
  method: string,
  path: string,
  opts: { token?: string; body?: unknown; params?: Record<string, string> } = {}
) {
  let urlPath = path.startsWith('http') ? path : `${base.replace(/\/$/, '')}${path}`
  if (opts.params) {
    const q = new URLSearchParams(opts.params).toString()
    urlPath += `${urlPath.includes('?') ? '&' : '?'}${q}`
  }
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (opts.body != null) {
    headers['Content-Type'] = 'application/json'
  }
  if (opts.token) {
    headers.Authorization = `Bearer ${opts.token}`
  }
  const res = await fetch(urlPath, {
    method,
    headers,
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
  })
  let json: unknown
  try {
    json = await res.json()
  } catch {
    json = null
  }
  return { status: res.status, json }
}

export function Tier32TestPanel() {
  const [customerToken, setCustomerToken] = useState('')
  const [customerToken2, setCustomerToken2] = useState('')
  const [staffToken, setStaffToken] = useState('')
  const [branchId, setBranchId] = useState('1')
  const [vehicleId, setVehicleId] = useState('1')
  const [testDate, setTestDate] = useState(tomorrowYmd())
  const [log, setLog] = useState<CaseResult[]>([])
  const [running, setRunning] = useState(false)

  const defaultDate = useMemo(() => tomorrowYmd(), [])

  const runAll = async () => {
    const results: CaseResult[] = []
    setRunning(true)
    const t0 = performance.now()
    let bookingId: number | null = null
    let firstSlotTime = '09:00'
    const run = async (id: string, fn: () => Promise<CaseResult>): Promise<void> => {
      const start = performance.now()
      try {
        const r = await fn()
        results.push({ ...r, ms: Math.round(performance.now() - start) })
      } catch (e) {
        results.push({
          id,
          pass: false,
          message: e instanceof Error ? e.message : String(e),
          ms: Math.round(performance.now() - start),
        })
      }
    }

    await run('TC-3.2-001', async () => {
      const { status, json } = await api('GET', '/bookings/available-slots', {
        params: { branchId, date: testDate },
      })
      const body = json as { data?: unknown[] }
      const ok = status === 200 && Array.isArray(body?.data)
      let warn: string | undefined
      if (ok && body.data!.length === 0) {
        warn = 'Danh sách slot rỗng — có thể cần seed BookingSlots (SQL thủ công).'
      }
      if (ok && body.data!.length > 0) {
        const first = body.data![0] as { slotTime?: string }
        if (first?.slotTime) firstSlotTime = first.slotTime.slice(0, 5)
      }
      return {
        id: 'TC-3.2-001',
        pass: ok,
        warn,
        message: `status ${status}, slots=${Array.isArray(body?.data) ? body!.data!.length : 'n/a'}`,
        ms: 0,
      }
    })

    await run('TC-3.2-002', async () => {
      const { status, json } = await api('POST', '/bookings', {
        token: customerToken,
        body: {
          vehicleId: Number(vehicleId),
          branchId: Number(branchId),
          bookingDate: testDate,
          timeSlot: firstSlotTime,
          note: '[TEST] Booking từ test panel',
        },
      })
      const body = json as { data?: { id?: number; status?: string; bookingDate?: string; timeSlot?: string } }
      const d = body?.data
      const timeOk = d?.timeSlot ? d.timeSlot.slice(0, 5) === firstSlotTime : false
      const ok =
        status === 201 &&
        typeof d?.id === 'number' &&
        d?.status === 'Pending' &&
        d?.bookingDate === testDate &&
        timeOk
      if (d?.id != null) bookingId = d.id
      return {
        id: 'TC-3.2-002',
        pass: !!ok,
        message: `status ${status} id=${d?.id} status=${d?.status} time=${d?.timeSlot}`,
        ms: 0,
      }
    })

    await run('TC-3.2-003', async () => {
      const tok = customerToken2.trim() || customerToken
      const { status, json } = await api('POST', '/bookings', {
        token: tok,
        body: {
          vehicleId: Number(vehicleId),
          branchId: Number(branchId),
          bookingDate: testDate,
          timeSlot: firstSlotTime,
          note: '[TEST] double book',
        },
      })
      const body = json as { errorCode?: string }
      const ok = status === 400 && body?.errorCode === 'SLOT_FULLY_BOOKED'
      return { id: 'TC-3.2-003', pass: ok, message: `status ${status} errorCode=${body?.errorCode}`, ms: 0 }
    })

    await run('TC-3.2-004', async () => {
      const { status, json } = await api('GET', '/bookings', { token: customerToken })
      const body = json as { data?: { id?: number; status?: string }[] }
      const list = body?.data ?? []
      const found = bookingId != null && list.some((b) => b.id === bookingId && b.status === 'Pending')
      return { id: 'TC-3.2-004', pass: status === 200 && found, message: `status ${status} found=${found}`, ms: 0 }
    })

    await run('TC-3.2-005', async () => {
      const { status, json } = await api('GET', '/staff/bookings', {
        token: staffToken,
        params: { branchId, page: '0', size: '50' },
      })
      const body = json as { data?: { id?: number }[] }
      const list = body?.data ?? []
      const found = bookingId != null && list.some((b) => b.id === bookingId)
      return { id: 'TC-3.2-005', pass: status === 200 && found, message: `status ${status} found=${found}`, ms: 0 }
    })

    await run('TC-3.2-006', async () => {
      if (bookingId == null) {
        return { id: 'TC-3.2-006', pass: false, message: 'Thiếu bookingId', ms: 0 }
      }
      const { status, json } = await api('PATCH', `/bookings/${bookingId}/confirm`, {
        token: staffToken,
        body: { note: 'Xác nhận từ test panel' },
      })
      const body = json as { data?: { status?: string } }
      const ok = status === 200 && body?.data?.status === 'Confirmed'
      return { id: 'TC-3.2-006', pass: ok, message: `status ${status} status=${body?.data?.status}`, ms: 0 }
    })

    await run('TC-3.2-007', async () => {
      const { status, json } = await api('GET', '/staff/schedule', {
        token: staffToken,
        params: { branchId, date: testDate },
      })
      const body = json as { data?: { timeSlot?: string; bookings?: { id?: number }[] }[] }
      const arr = body?.data ?? []
      const ok = status === 200 && Array.isArray(arr)
      let found = false
      if (bookingId != null) {
        for (const g of arr) {
          if (g.bookings?.some((b) => b.id === bookingId)) found = true
        }
      }
      return {
        id: 'TC-3.2-007',
        pass: ok && found,
        message: `status ${status} groups=${arr.length} bookingInTimeline=${found}`,
        ms: 0,
      }
    })

    await run('TC-3.2-008', async () => {
      if (bookingId == null) {
        return { id: 'TC-3.2-008', pass: false, message: 'Thiếu bookingId', ms: 0 }
      }
      const newDate = dayAfterTomorrowYmd()
      const { status, json } = await api('PATCH', `/bookings/${bookingId}/reschedule`, {
        token: staffToken,
        body: {
          newBookingDate: newDate,
          newTimeSlot: '10:00',
          note: 'Test đổi lịch',
        },
      })
      const body = json as { data?: { status?: string; timeSlot?: string } }
      const st = body?.data?.status
      const timeOk = body?.data?.timeSlot?.slice(0, 5) === '10:00'
      const ok = status === 200 && (st === 'Rescheduled' || st === 'Confirmed') && timeOk
      let warn: string | undefined
      if (status === 400) {
        warn = 'Có thể thiếu slot 10:00 hoặc slot đầy — SKIP theo spec.'
      }
      return {
        id: 'TC-3.2-008',
        pass: !!ok,
        warn,
        message: `status ${status} status=${st} timeSlot=${body?.data?.timeSlot}`,
        ms: 0,
      }
    })

    await run('TC-3.2-009', async () => {
      if (bookingId == null) {
        return { id: 'TC-3.2-009', pass: false, message: 'Thiếu bookingId', ms: 0 }
      }
      const { status, json } = await api('PATCH', `/bookings/${bookingId}/cancel`, {
        token: customerToken,
      })
      const body = json as { data?: { status?: string } }
      const ok1 = status === 200 && body?.data?.status === 'Cancelled'
      const d2 = await api('GET', `/bookings/${bookingId}`, { token: customerToken })
      const j2 = d2.json as { data?: { status?: string } }
      const ok2 = d2.status === 200 && j2?.data?.status === 'Cancelled'
      return {
        id: 'TC-3.2-009',
        pass: ok1 && ok2,
        message: `cancel ${status} get ${d2.status} status=${j2?.data?.status}`,
        ms: 0,
      }
    })

    await run('TC-3.2-010', async () => {
      if (bookingId == null) {
        return { id: 'TC-3.2-010', pass: false, message: 'Thiếu bookingId', ms: 0 }
      }
      const { status, json } = await api('PATCH', `/bookings/${bookingId}/cancel`, {
        token: customerToken,
      })
      const body = json as { errorCode?: string }
      const ok = status === 400 && body?.errorCode === 'BOOKING_CANNOT_CANCEL'
      return { id: 'TC-3.2-010', pass: ok, message: `status ${status} errorCode=${body?.errorCode}`, ms: 0 }
    })

    await run('TC-3.2-011', async () => {
      const altSlot = firstSlotTime === '09:00' ? '14:00' : '09:00'
      const { status, json } = await api('POST', '/bookings', {
        token: customerToken,
        body: {
          vehicleId: Number(vehicleId),
          branchId: Number(branchId),
          bookingDate: defaultDate,
          timeSlot: altSlot,
          note: '[TEST] E2E complete',
        },
      })
      const body = json as { data?: { id?: number } }
      if (status !== 201 || body?.data?.id == null) {
        return {
          id: 'TC-3.2-011',
          pass: false,
          message: `POST fail status ${status} (kiểm tra slot ${altSlot} có tồn tại)`,
          ms: 0,
        }
      }
      const bookingB = body.data.id
      await api('PATCH', `/bookings/${bookingB}/confirm`, {
        token: staffToken,
        body: { note: 'e2e' },
      })
      const done = await api('PATCH', `/bookings/${bookingB}/complete`, { token: staffToken })
      const dj = done.json as { data?: { status?: string } }
      const ok = done.status === 200 && dj?.data?.status === 'Completed'
      return {
        id: 'TC-3.2-011',
        pass: ok,
        message: `complete status ${done.status} status=${dj?.data?.status}`,
        ms: 0,
      }
    })

    const totalMs = Math.round(performance.now() - t0)
    const cases = results.filter((l) => l.id.startsWith('TC-'))
    const pass = cases.filter((c) => c.pass).length
    const fail = cases.filter((c) => !c.pass).length
    const warn = cases.filter((c) => c.warn).length
    const sumMs = cases.reduce((s, c) => s + c.ms, 0)
    results.push({
      id: 'SUMMARY',
      pass: fail === 0,
      message: `${pass} PASS | ${fail} FAIL | ${warn} WARN | Tổng: ${sumMs}ms (wall ${totalMs}ms)`,
      ms: totalMs,
    })
    setLog(results)
    setRunning(false)
  }

  const summary = useMemo(() => {
    const cases = log.filter((l) => l.id.startsWith('TC-'))
    const pass = cases.filter((c) => c.pass).length
    const fail = cases.filter((c) => !c.pass).length
    const warn = cases.filter((c) => c.warn).length
    const ms = cases.reduce((s, c) => s + c.ms, 0)
    return { pass, fail, warn, ms, total: cases.length }
  }, [log])

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 font-mono text-sm">
      <h1 className="text-xl font-bold text-slate-900">Tier 3.2 — API test panel</h1>
      <p className="text-slate-600">Chỉ hiển thị khi dev. Base: {base}</p>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="block">
          Customer JWT
          <textarea
            className="mt-1 w-full rounded border p-2 text-xs"
            rows={2}
            value={customerToken}
            onChange={(e) => setCustomerToken(e.target.value)}
          />
        </label>
        <label className="block">
          Customer JWT (khách 2 — double book, tuỳ chọn)
          <textarea
            className="mt-1 w-full rounded border p-2 text-xs"
            rows={2}
            value={customerToken2}
            onChange={(e) => setCustomerToken2(e.target.value)}
          />
        </label>
        <label className="block">
          Staff / Manager JWT
          <textarea
            className="mt-1 w-full rounded border p-2 text-xs"
            rows={2}
            value={staffToken}
            onChange={(e) => setStaffToken(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <label>
            Branch ID
            <input
              className="ml-2 w-20 rounded border px-2 py-1"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
            />
          </label>
          <label>
            Vehicle ID (Available)
            <input
              className="ml-2 w-24 rounded border px-2 py-1"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            />
          </label>
          <label>
            Test date
            <input
              type="date"
              className="ml-2 rounded border px-2 py-1"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={running}
          onClick={() => void runAll()}
          className="rounded-lg bg-[#1A3C6E] px-4 py-2 font-bold text-white disabled:opacity-50"
        >
          Run All
        </button>
      </div>

      {log.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 font-bold">
            {summary.pass} PASS | {summary.fail} FAIL | {summary.warn} WARN | Tổng: {summary.ms}ms
          </p>
          <ul className="space-y-1 text-xs">
            {log.map((r, i) => (
              <li key={`${r.id}-${i}`} className={r.pass ? 'text-green-800' : 'text-red-800'}>
                [{r.id}] {r.pass ? '✓' : '✗'} {r.message}
                {r.warn ? ` 🟡 ${r.warn}` : ''} ({r.ms}ms)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
