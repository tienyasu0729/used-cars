/**
 * Tier 3.1 — panel kiểm thử API (chỉ DEV)
 */
import { useState, useCallback, useMemo } from 'react'

function buildApiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  if (base.startsWith('http')) {
    return `${base}${p}`
  }
  return `${base}${p}`
}

type CaseResult = {
  id: string
  pass: boolean
  warn?: boolean
  detail: string
  ms: number
}

async function rawFetch(
  method: string,
  path: string,
  opts?: { headers?: Record<string, string>; body?: unknown }
): Promise<{ status: number; json: Record<string, unknown> | null; text: string }> {
  const url = path.startsWith('http') ? path : buildApiUrl(path)
  const headers: Record<string, string> = { ...opts?.headers }
  if (opts?.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(url, {
    method,
    headers,
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  const text = await res.text()
  let json: Record<string, unknown> | null = null
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : null
  } catch {
    json = null
  }
  return { status: res.status, json, text }
}

export function Tier31TestPanel() {
  const [jwt, setJwt] = useState('')
  const [guestId, setGuestId] = useState('test-panel-guest-001')
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<CaseResult[]>([])
  const [summary, setSummary] = useState('')

  const authHeader = useMemo(() => (jwt.trim() ? { Authorization: `Bearer ${jwt.trim()}` } : {}), [jwt])

  const pushResult = useCallback((r: CaseResult) => {
    setResults((prev) => [...prev, r])
  }, [])

  const runAll = useCallback(async () => {
    setRunning(true)
    setResults([])
    const tStart = performance.now()
    let pass = 0
    let fail = 0
    let warn = 0

    const run = async (id: string, fn: () => Promise<CaseResult>) => {
      const r = await fn()
      pushResult(r)
      if (r.pass) {
        pass++
        if (r.warn) warn++
      } else {
        fail++
      }
    }

    const vehicleId = 1

    await run('TC-3.1-001', async () => {
      const t0 = performance.now()
      const { status, json } = await rawFetch('POST', '/users/me/saved-vehicles', {
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: { vehicleId },
      })
      const ok =
        (status === 201 || status === 200) &&
        json?.success === true &&
        typeof (json?.data as Record<string, unknown> | undefined)?.message === 'string'
      return {
        id: 'TC-3.1-001',
        pass: ok,
        detail: `status=${status} success=${String(json?.success)}`,
        ms: Math.round(performance.now() - t0),
      }
    })

    await run('TC-3.1-002', async () => {
      const t0 = performance.now()
      const { status, json } = await rawFetch('POST', '/users/me/saved-vehicles', {
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: { vehicleId },
      })
      const errCode = (json?.errorCode as string) || (json?.code as string)
      const ok = status === 400 && errCode === 'VEHICLE_ALREADY_SAVED'
      return { id: 'TC-3.1-002', pass: ok, detail: `status=${status} errorCode=${errCode}`, ms: Math.round(performance.now() - t0) }
    })

    await run('TC-3.1-003', async () => {
      const t0 = performance.now()
      const { status, json } = await rawFetch('GET', '/users/me/saved-vehicles', { headers: { ...authHeader } })
      const data = json?.data
      const ok = status === 200 && json?.success === true && Array.isArray(data)
      const hasV1 =
        ok &&
        (data as unknown[]).some((row: unknown) => {
          if (!row || typeof row !== 'object') return false
          const o = row as Record<string, unknown>
          return Number(o.vehicleId ?? o.vehicle_id) === vehicleId
        })
      return {
        id: 'TC-3.1-003',
        pass: ok && hasV1,
        detail: `status=${status} array=${Array.isArray(data)} hasVehicle1=${hasV1}`,
        ms: Math.round(performance.now() - t0),
      }
    })

    await run('TC-3.1-004', async () => {
      const t0 = performance.now()
      const del = await rawFetch('DELETE', `/users/me/saved-vehicles/${vehicleId}`, { headers: { ...authHeader } })
      const get = await rawFetch('GET', '/users/me/saved-vehicles', { headers: { ...authHeader } })
      const data = get.json?.data
      const still =
        Array.isArray(data) &&
        (data as unknown[]).some((row: unknown) => {
          if (!row || typeof row !== 'object') return false
          const o = row as Record<string, unknown>
          return Number(o.vehicleId ?? o.vehicle_id) === vehicleId
        })
      const ok = del.status === 200 && get.status === 200 && !still
      return {
        id: 'TC-3.1-004',
        pass: ok,
        detail: `DELETE=${del.status} stillInList=${still}`,
        ms: Math.round(performance.now() - t0),
      }
    })

    await run('TC-3.1-005', async () => {
      const t0 = performance.now()
      const { status, json } = await rawFetch('DELETE', `/users/me/saved-vehicles/${vehicleId}`, {
        headers: { ...authHeader },
      })
      const errCode = (json?.errorCode as string) || ''
      const ok = status === 400 && errCode === 'VEHICLE_NOT_SAVED'
      return { id: 'TC-3.1-005', pass: ok, detail: `status=${status} errorCode=${errCode}`, ms: Math.round(performance.now() - t0) }
    })

    await run('TC-3.1-006', async () => {
      const t0 = performance.now()
      const { status, json } = await rawFetch('GET', '/users/me/saved-vehicles', {})
      const errCode = (json?.errorCode as string) || ''
      const ok = status === 401 && errCode === 'UNAUTHORIZED'
      return { id: 'TC-3.1-006', pass: ok, detail: `status=${status} errorCode=${errCode}`, ms: Math.round(performance.now() - t0) }
    })

    await run('TC-3.1-007', async () => {
      const t0 = performance.now()
      const { status, json } = await rawFetch('POST', `/vehicles/${vehicleId}/view`, {
        headers: { 'X-Guest-Id': guestId },
      })
      const ok = status === 200 && json?.success === true
      return { id: 'TC-3.1-007', pass: ok, detail: `status=${status}`, ms: Math.round(performance.now() - t0) }
    })

    await run('TC-3.1-008', async () => {
      const t0 = performance.now()
      const { status } = await rawFetch('POST', `/vehicles/${vehicleId}/view`, {})
      const ok = status === 200
      return { id: 'TC-3.1-008', pass: ok, detail: `status=${status} (skip guest)`, ms: Math.round(performance.now() - t0) }
    })

    await run('TC-3.1-009', async () => {
      const t0 = performance.now()
      const { status, json } = await rawFetch('GET', '/vehicles/recently-viewed', {
        headers: { 'X-Guest-Id': guestId },
      })
      const data = json?.data
      const empty = Array.isArray(data) && data.length === 0
      const ok = status === 200 && Array.isArray(data)
      return {
        id: 'TC-3.1-009',
        pass: ok,
        warn: empty,
        detail: `status=${status} len=${Array.isArray(data) ? data.length : 'n/a'}`,
        ms: Math.round(performance.now() - t0),
      }
    })

    await run('TC-3.1-010', async () => {
      const t0 = performance.now()
      const { status, json } = await rawFetch('POST', `/vehicles/${vehicleId}/view`, {
        headers: { ...authHeader, 'X-Guest-Id': guestId },
      })
      const ok = status === 200 && json?.success === true
      return { id: 'TC-3.1-010', pass: ok, detail: `status=${status}`, ms: Math.round(performance.now() - t0) }
    })

    await run('TC-3.1-011', async () => {
      const t0 = performance.now()
      // Chờ 500ms cho async DB insert (khi cache Redis off)
      await new Promise(r => setTimeout(r, 500))
      const { status, json } = await rawFetch('GET', '/vehicles/recently-viewed', {
        headers: { ...authHeader, 'X-Guest-Id': guestId },
      })
      const data = json?.data as unknown[] | undefined
      const has =
        Array.isArray(data) &&
        data.some((row: unknown) => {
          if (!row || typeof row !== 'object') return false
          const o = row as Record<string, unknown>
          return Number(o.vehicleId ?? o.vehicle_id) === vehicleId
        })
      const ok = status === 200 && Array.isArray(data) && has
      return { id: 'TC-3.1-011', pass: ok, detail: `status=${status} has1=${has}`, ms: Math.round(performance.now() - t0) }
    })

    await run('TC-3.1-012', async () => {
      const t0 = performance.now()
      const { status, json } = await rawFetch('POST', '/users/me/merge-view-history', {
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: { guestId },
      })
      const data = json?.data as Record<string, unknown> | undefined
      const mc = data?.mergedCount
      const ok = status === 200 && typeof mc === 'number' && mc >= 0
      return { id: 'TC-3.1-012', pass: ok, detail: `status=${status} mergedCount=${String(mc)}`, ms: Math.round(performance.now() - t0) }
    })

    const totalMs = Math.round(performance.now() - tStart)
    setSummary(`${pass} PASS | ${fail} FAIL | ${warn} WARN | Tổng: ${totalMs}ms`)
    setRunning(false)
  }, [authHeader, guestId, pushResult])

  const runPublicSafe = useCallback(async () => {
    setRunning(true)
    setResults([])
    const tStart = performance.now()
    let pass = 0
    let fail = 0
    let warn = 0
    const vehicleId = 1

    const steps = [
      async (): Promise<CaseResult> => {
        const t0 = performance.now()
        const { status, json } = await rawFetch('POST', `/vehicles/${vehicleId}/view`, {
          headers: { 'X-Guest-Id': guestId },
        })
        const ok = status === 200 && json?.success === true
        return { id: 'TC-3.1-007', pass: ok, detail: `status=${status}`, ms: Math.round(performance.now() - t0) }
      },
      async (): Promise<CaseResult> => {
        const t0 = performance.now()
        const { status } = await rawFetch('POST', `/vehicles/${vehicleId}/view`, {})
        const ok = status === 200
        return { id: 'TC-3.1-008', pass: ok, detail: `status=${status}`, ms: Math.round(performance.now() - t0) }
      },
      async (): Promise<CaseResult> => {
        const t0 = performance.now()
        const { status, json } = await rawFetch('GET', '/vehicles/recently-viewed', {
          headers: { 'X-Guest-Id': guestId },
        })
        const data = json?.data
        const empty = Array.isArray(data) && data.length === 0
        const ok = status === 200 && Array.isArray(data)
        return {
          id: 'TC-3.1-009',
          pass: ok,
          warn: empty,
          detail: `len=${Array.isArray(data) ? data.length : 'n/a'}`,
          ms: Math.round(performance.now() - t0),
        }
      },
    ]

    for (const fn of steps) {
      const r = await fn()
      pushResult(r)
      if (r.pass) {
        pass++
        if (r.warn) warn++
      } else {
        fail++
      }
    }
    setSummary(`${pass} PASS | ${fail} FAIL | ${warn} WARN | Tổng: ${Math.round(performance.now() - tStart)}ms`)
    setRunning(false)
  }, [guestId, pushResult])

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 font-mono text-sm">
      <h1 className="text-xl font-bold text-slate-900">Tier 3.1 API Test</h1>
      <p className="text-slate-600">Base: {import.meta.env.VITE_API_BASE_URL || '/api/v1'}</p>
      <label className="block space-y-1">
        <span className="font-semibold">Customer JWT</span>
        <textarea
          className="h-24 w-full rounded border border-slate-300 p-2"
          value={jwt}
          onChange={(e) => setJwt(e.target.value)}
          placeholder="Bearer token từ /auth/login"
        />
      </label>
      <label className="block space-y-1">
        <span className="font-semibold">X-Guest-Id (test)</span>
        <input
          className="w-full rounded border border-slate-300 p-2"
          value={guestId}
          onChange={(e) => setGuestId(e.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={running}
          className="rounded bg-[#1A3C6E] px-4 py-2 text-white disabled:opacity-50"
          onClick={() => void runAll()}
        >
          Chạy tất cả (001–012)
        </button>
        <button
          type="button"
          disabled={running}
          className="rounded border border-slate-300 px-4 py-2 disabled:opacity-50"
          onClick={() => void runPublicSafe()}
        >
          Chạy Public-safe (007–009)
        </button>
      </div>
      {summary && <div className="rounded bg-slate-100 p-3 font-semibold">{summary}</div>}
      <ul className="space-y-2">
        {results.map((r) => (
          <li
            key={`${r.id}-${r.ms}`}
            className={`rounded border p-2 ${r.pass ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
          >
            <span className="font-bold">{r.id}</span>{' '}
            {r.pass ? (r.warn ? 'PASS (WARN)' : 'PASS') : 'FAIL'} — {r.detail} — {r.ms}ms
          </li>
        ))}
      </ul>
    </div>
  )
}
