// Tiện ích xuất file Excel (.xlsx) dùng chung cho toàn bộ trang — hỗ trợ tiếng Việt.
import * as XLSX from 'xlsx'

/**
 * Tải file Excel xuống máy người dùng (client-side).
 * @param filename  Tên file (VD: "danh-sach-xe-2026-04-15.xlsx")
 * @param headers   Mảng tên cột (VD: ["Mã xe", "Tên xe", "Giá"])
 * @param rows      Mảng 2 chiều, mỗi dòng là mảng string tương ứng các cột
 * @param sheetName Tên sheet (mặc định "Dữ liệu")
 */
export function downloadExcel(
  filename: string,
  headers: string[],
  rows: string[][],
  sheetName = 'Dữ liệu',
): void {
  const data = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
}

/**
 * Tải file Excel có nhiều sheet.
 * @param filename  Tên file
 * @param sheets    Mảng { name, headers, rows } cho từng sheet
 */
export function downloadExcelMultiSheet(
  filename: string,
  sheets: { name: string; headers: string[]; rows: string[][] }[],
): void {
  const wb = XLSX.utils.book_new()
  for (const s of sheets) {
    const data = [s.headers, ...s.rows]
    const ws = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, s.name)
  }
  XLSX.writeFile(wb, filename)
}

/**
 * Tải file blob từ API (dùng cho server-side Excel export).
 * @param blob      Blob trả về từ API
 * @param filename  Tên file tải về
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Trả chuỗi ngày hiện tại dạng YYYY-MM-DD để dùng làm tên file. */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}
