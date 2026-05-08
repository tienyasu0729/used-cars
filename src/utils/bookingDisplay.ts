/** Hiển thị ngày + giờ lịch hẹn (bookingDate yyyy-MM-dd, timeSlot HH:mm). */
export function formatBookingDateTimeVi(bookingDate: string, timeSlot: string): string {
  const parts = bookingDate.split('-').map((p) => Number(p))
  if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) {
    return `${bookingDate} — ${timeSlot}`
  }
  const [y, m, d] = parts
  const dt = new Date(y, m - 1, d)
  if (Number.isNaN(dt.getTime())) return `${bookingDate} — ${timeSlot}`
  const dateLine = dt.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return `${dateLine} — ${timeSlot}`
}

/** Hai dòng: ngày dài + giờ (cho layout dạng thẻ). */
export function formatBookingDateTimeLines(bookingDate: string, timeSlot: string): { dateLine: string; timeLine: string } {
  const parts = bookingDate.split('-').map((p) => Number(p))
  if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) {
    return { dateLine: bookingDate, timeLine: timeSlot }
  }
  const [y, m, d] = parts
  const dt = new Date(y, m - 1, d)
  if (Number.isNaN(dt.getTime())) {
    return { dateLine: bookingDate, timeLine: timeSlot }
  }
  const dateLine = dt.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return { dateLine, timeLine: timeSlot }
}
