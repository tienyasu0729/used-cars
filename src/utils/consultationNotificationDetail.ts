/** Link lưu trong inbox: `consultation-ref:123` — không dùng để điều hướng. */
export function consultationRefIdFromLink(link?: string | null): number | null {
  if (link == null || link === '') return null
  const t = link.trim()
  const prefix = 'consultation-ref:'
  if (!t.startsWith(prefix)) return null
  const n = parseInt(t.slice(prefix.length), 10)
  return Number.isFinite(n) ? n : null
}

/** Bóc nội dung body định dạng từ BE (buildCustomerConsultationProcessingBody) khi không có consultation-ref. */
export function parseLegacyConsultationNotificationBody(body: string): {
  vehicleLine: string | null
  message: string | null
  ticketId: string | null
} | null {
  if (!body.includes('Xe quan tâm:')) return null
  const vehicleMatch = body.match(/Xe quan tâm:\s*([^\n]+)/)
  const msgMatch = body.match(/Nội dung bạn yêu cầu tư vấn:\r?\n([\s\S]*?)(?:\r?\n\r?\nMã phiếu:|$)/)
  const ticketMatch = body.match(/Mã phiếu:\s*#?(\d+)/)
  return {
    vehicleLine: vehicleMatch?.[1]?.trim() ?? null,
    message: msgMatch?.[1]?.trim() ?? null,
    ticketId: ticketMatch?.[1] ?? null,
  }
}

export function consultationStatusLabelVi(status: string): string {
  const s = status.trim().toLowerCase()
  const map: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    resolved: 'Đã xử lý',
  }
  return map[s] ?? status
}
