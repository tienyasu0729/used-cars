import { create } from 'zustand'

export type CompareEntry = { id: number; title: string }

const SESSION_KEY = 'compare_vehicle_ids'

function normalizeLoaded(raw: unknown): CompareEntry[] {
  if (!Array.isArray(raw)) return []
  if (raw.length === 0) return []
  const first = raw[0] as unknown
  if (typeof first === 'number') {
    return (raw as number[]).map((id) => ({ id, title: `Xe #${id}` }))
  }
  return (raw as CompareEntry[]).filter((x) => x && typeof x.id === 'number')
}

function loadEntries(): CompareEntry[] {
  try {
    const s = sessionStorage.getItem(SESSION_KEY)
    if (!s) return []
    return normalizeLoaded(JSON.parse(s))
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
