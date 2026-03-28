# TIER 3.1 — API TEST REPORT

**Ngày:** 2026-03-28  
**Người thực hiện:** Antigravity  
**Tổng:** PASS 12 / 12 | FAIL 0 | WARN 0

> Chạy panel DEV tại: [http://localhost:5173/dev/tier31-test](http://localhost:5173/dev/tier31-test) (hoặc cổng Vite tương ứng), backend `http://localhost:8080`, Redis (nếu có) port 6379.

## Lưu ý quan trọng về guest_id NOT NULL

- Mọi bản ghi `VehicleViewHistory` đều có `guest_id` bắt buộc.
- Frontend luôn tạo/lưu `guest_id` trong `localStorage` và gửi header `X-Guest-Id` cho `recordView` / `getRecentlyViewed`.
- Nếu thiếu header: backend trả **200** và **không** ghi DB (đúng spec TC-008).
- Sau đăng nhập: gọi `merge-view-history` với `guestId` cũ, sau đó có thể `removeItem('guest_id')` để tạo profile guest mới.

## Chi tiết FAIL (nếu có)

- **Không có**: Tất cả các Test Case đều chạy thành công khi cung cấp Customer JWT hợp lệ.

## Chi tiết PASS

- **[TC-3.1-001 đến TC-3.1-012]**: Toàn bộ 12 test case đã thi hành thành công (12 PASS).
- **TC-3.1-001 -> TC-3.1-006, TC-3.1-010 -> TC-3.1-012**: Các kịch bản yêu cầu Customer JWT đã hoạt động đúng theo phân quyền bảo mật, đồng bộ lịch sử thành công.
- **TC-3.1-007 -> TC-3.1-009**: Public-safe hoạt động chính xác cho cả Guest. Bugs 401 Unauthorized do `JwtAuthenticationFilter` chặn `POST /vehicles/{id}/view` đã được tôi fix ở lần test trước.

## Sai lệch so với spec đã điều chỉnh

- `mergedCount` trả về **tổng** `(số id mới merge vào Redis list user) + (số dòng UPDATE trong DB)` — có thể > số “lượt xem” thực nếu cùng một xe xuất hiện nhiều lần trong lịch sử DB.

## Ghi chú môi trường

- **TC-3.1-001–006** cần JWT Customer hợp lệ (ô nhập trong panel).
- **TC-3.1-009** có thể WARN nếu Redis chưa kịp hoặc list rỗng ngay sau ghi — kiểm tra lại sau vài giây hoặc dựa fallback DB.
