import { create } from 'zustand'

export type CompareEntry = { id: number; title: string }

const SESSION_KEY = 'compare_vehicle_ids'

function dedupeEntries(entries: CompareEntry[]): CompareEntry[] {
  const seen = new Set<number>()
  const out: CompareEntry[] = []
  for (const e of entries) {
    if (seen.has(e.id)) continue
    seen.add(e.id)
    out.push(e)
  }
  return out
}

function normalizeLoaded(raw: unknown): CompareEntry[] {
  if (!Array.isArray(raw)) return []
  if (raw.length === 0) return []
  const first = raw[0] as unknown
  if (typeof first === 'number') {
    const entries = (raw as number[]).map((id) => ({ id, title: `Xe #${id}` }))
    return dedupeEntries(entries)
  }
  const filtered = (raw as CompareEntry[]).filter((x) => x && typeof x.id === 'number')
  return dedupeEntries(filtered)
}

function loadEntries(): CompareEntry[] {
  try {
    const s = sessionStorage.getItem(SESSION_KEY)
    if (!s) return []
    const parsed = JSON.parse(s) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return []
    const rawLen = parsed.length
    const entries = normalizeLoaded(parsed)
    if (entries.length !== rawLen) {
      persistEntries(entries)
    }
    return entries
  } catch {
    return []
  }
}

function persistEntries(entries: CompareEntry[]) {
  if (entries.length === 0) sessionStorage.removeItem(SESSION_KEY)
  else sessionStorage.setItem(SESSION_KEY, JSON.stringify(entries))
}

interface CompareState {
  entries: CompareEntry[]
  addEntry: (e: CompareEntry) => 'added' | 'exists' | 'full'
  removeEntry: (id: number) => void
  clear: () => void
}

export const useCompareStore = create<CompareState>((set, get) => ({
  entries: loadEntries(),
  addEntry: (e) => {
    const list = get().entries
    if (list.some((x) => x.id === e.id)) return 'exists'
    if (list.length >= 3) return 'full'
    const next = [...list, e]
    persistEntries(next)
    set({ entries: next })
    return 'added'
  },
  removeEntry: (id) => {
    const next = get().entries.filter((x) => x.id !== id)
    persistEntries(next)
    set({ entries: next })
  },
  clear: () => {
    sessionStorage.removeItem(SESSION_KEY)
    set({ entries: [] })
  },
}))
