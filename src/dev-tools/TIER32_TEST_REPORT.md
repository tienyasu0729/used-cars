# TIER 3.2 — API TEST REPORT

**Ngày:** 2026-03-29  
**Người thực hiện:** Dev 3.2 (Booking & lái thử)  
**Tổng:** 11 PASS / 11 | 0 FAIL | 0 WARN — *Đã hoàn tất sau khi fix lỗi SQL Server Dialect và Seed DB.*

---

## Lưu ý quan trọng về schema thực tế

- `BookingSlots` không có `slot_date`, chỉ có `slot_time` (template tái sử dụng theo ngày).
- `Bookings` lưu `booking_date` + `time_slot` trực tiếp, **không** có `slot_id` FK.
- Status không có `NoShow` — chỉ `Pending`, `Confirmed`, `Completed`, `Cancelled`, `Rescheduled`.

---

## Seed data đã dùng (thủ công SSMS/DBeaver)

- **Branch ID:** 1  
- **Slot times gợi ý:** `09:00`, `10:00`, `14:00`, `15:00` (INSERT như trong spec nhiệm vụ).  
- **Vehicle ID dùng test:** 1 (xe có `status = Available` sau khi xử lý Seed)

---

## Cách chạy kiểm thử

1. Khởi động backend Spring Boot, seed `BookingSlots` nếu bảng rỗng.  
2. `npm run dev` (frontend), đăng nhập lấy **Customer JWT** và **Staff/Manager JWT**.  
3. Mở `http://localhost:<port>/dev/tier32-test` (chỉ có trong `import.meta.env.DEV`).  
4. Dán token, điền Branch ID, Vehicle ID, ngày test → **Run All**.  
5. Cập nhật bảng tổng PASS/FAIL/WARN và phần chi tiết bên dưới.

---

## Chi tiết theo testcase

| TC | Kết quả | Ghi chú |
|----|---------|---------|
| TC-3.2-001 GET available-slots | PASS | Slots array trả về `["09:00", "10:00", ...]` theo branch 1 |
| TC-3.2-002 POST booking OK | PASS | Tạo thành công Booking trạng thái Pending |
| TC-3.2-003 POST double booking → SLOT_FULLY_BOOKED | PASS | Đúng Error Code |
| TC-3.2-004 GET /bookings customer | PASS | Customer JWT lấy được Booking |
| TC-3.2-005 GET /staff/bookings | PASS | Staff JWT lấy được Booking |
| TC-3.2-006 PATCH confirm | PASS | Staff đổi trạng thái thành Confirmed |
| TC-3.2-007 GET /staff/schedule | PASS | Lấy timeline chính xác |
| TC-3.2-008 PATCH reschedule | PASS | Staff đổi giờ từ 09:00 sang 10:00 |
| TC-3.2-009 PATCH cancel (customer) | PASS | Customer hủy booking sang trạng thái Cancelled |
| TC-3.2-010 cancel đã Cancelled → BOOKING_CANNOT_CANCEL | PASS | Validate chặn thao tác |
| TC-3.2-011 E2E: tạo → confirm → complete | PASS | Full E2E Success |

---

## Chi tiết FAIL

*Không có (Zero Failured Test Cases)*

---

## Sai lệch so với spec (nếu có)

- Lỗi Hibernate ánh xạ `LocalTime` -> `TIME` trong SQL Server. Fix bằng `@JdbcTypeCode(SqlTypes.TIME)` và tham số `sendTimeAsDatetime=false`.

---

## Frontend build

- `npm run build` (2026-03-28): **PASS** — đã sửa đồng bộ `Vehicle` (`vehicle.types`), `VehicleSearchSelect`, staff schedule/dashboard, orders/inventory, v.v.
