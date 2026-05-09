/** Chuyển ISO yyyy-mm-dd → hiển thị dd/mm/yyyy */
export function isoDateToDdMmYyyy(iso: string | undefined | null): string {
  if (!iso?.trim()) return ''
  const [y, m, d] = iso.trim().split('-')
  if (!y || !m || !d || y.length !== 4) return ''
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
}

/** Parse dd/mm/yyyy → ISO yyyy-mm-dd; null nếu sai định dạng hoặc ngày không tồn tại */
export function ddMmYyyyToIso(input: string | undefined | null): string | null {
  if (!input?.trim()) return null
  const m = input.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const dd = Number(m[1])
  const mm = Number(m[2])
  const yy = Number(m[3])
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null
  const dt = new Date(yy, mm - 1, dd)
  if (dt.getFullYear() !== yy || dt.getMonth() !== mm - 1 || dt.getDate() !== dd) return null
  return `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
}

export function isValidDdMmYyyyOrEmpty(s: string | undefined): boolean {
  if (s == null || s.trim() === '') return true
  return ddMmYyyyToIso(s) != null
}
