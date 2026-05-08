# Kế hoạch Triển khai Tính năng Mua Xe Trả Góp
> Phiên bản tổng hợp hoàn chỉnh — bao gồm toàn bộ nội dung plan gốc, phân tích nghiệp vụ, và các cập nhật từ schema thực tế

---

## 🎯 Mục tiêu (Goal)

Xây dựng toàn trình tính năng "Mua xe trả góp" bao gồm:
- Công cụ dự toán trả góp cho khách vãng lai tại trang chi tiết xe
- Quy trình điền hồ sơ eKYC qua Wizard Form 7 bước cho Customer
- Tích hợp API gửi hồ sơ thẩm định tự động sang Hệ thống Ngân hàng
- Nhận kết quả phê duyệt qua Webhook từ Ngân hàng
- Thanh toán cọc thiện chí qua VNPay / ZaloPay
- Giao diện quản lý hồ sơ cho Staff

---

## 🏗 Kiến trúc & Quyết định Kỹ thuật

### Stack công nghệ
- **Frontend:** React (Vite), React Router, React Hook Form + Zod, Axios, TailwindCSS
- **Backend:** Spring Boot 3.x, Spring Security, Spring Data JPA, Hibernate
- **Database:** Microsoft SQL Server — dialect `SQLServerDialect`
- **Storage:** Cloudinary — **2 cấu hình tách biệt hoàn toàn:**
  - Config 1 (hiện có): lưu ảnh xe, avatar người dùng
  - Config 2 (tạo mới): lưu riêng tài liệu hồ sơ (CCCD, hợp đồng, PDF ngân hàng)
- **Payment:** VNPay / ZaloPay (tích hợp qua cổng thanh toán)
- **Notification:** Tận dụng bảng `Notifications` + `NotificationTemplates` có sẵn trong DB

### Các quyết định kỹ thuật đã chốt

| Hạng mục | Quyết định |
|---|---|
| Lưu trữ tài liệu | Cloudinary riêng, folder Documents |
| Bảo mật API Bank | HMAC SHA256 (Payload + Timestamp) với `apiSecret` |
| Bank API URL | `https://credit-service-n2s5.onrender.com/api/loan/apply` |
| Bank API Key | `X-API-Key: fb_3652d9c281d287acced1963b6ee75b49` |
| Bank API Secret | `cac3e64970bf86f8fe94f36ebe438034c463e44448e32bd03314bbcef91ac27d` |
| Giao diện Customer | Multi-step Wizard Form 7 bước, validation từng bước |
| Cọc thiện chí | Tái sử dụng bảng `Deposits` + `Transactions` có sẵn, không tạo bảng mới |
| Naming convention DB | PascalCase — nhất quán với toàn bộ schema hiện có |
| Phân quyền | Tận dụng bảng `Permissions` + `RolePermissions` có sẵn |
| Audit trail | Tận dụng `AuditLogs` + `InstallmentStatusHistory` (tạo mới) |

---

## 🗂 Cấu trúc File cần tạo mới

### Frontend (React)
```
src/
├── api/
│   ├── installmentApi.js            # API calls cho module trả góp
│   └── paymentApi.js                # API calls cho cọc thiện chí
├── components/
│   └── installment/
│       ├── InstallmentCalculatorWidget.jsx   # Widget dự toán tại trang xe
│       ├── WizardProgressBar.jsx             # Thanh tiến độ 7 bước
│       ├── FileUploadZone.jsx                # Drag & drop upload, preview, xóa
│       └── steps/
│           ├── Step1PersonalInfo.jsx         # Bước 1: Thông tin cá nhân
│           ├── Step2Employment.jsx           # Bước 2: Nghề nghiệp & Thu nhập
│           ├── Step3LoanDetails.jsx          # Bước 3: Khoản vay
│           ├── Step4Documents.jsx            # Bước 4: Hồ sơ giấy tờ
│           └── Step5Review.jsx               # Bước 5: Xem lại & Gửi
├── pages/
│   ├── customer/
│   │   ├── InstallmentWizardPage.jsx        # Trang Wizard Form
│   │   └── InstallmentStatusPage.jsx        # Trang theo dõi trạng thái hồ sơ
│   └── staff/
│       └── StaffInstallmentsPage.jsx        # Trang quản lý hồ sơ của Staff
├── hooks/
│   └── useInstallmentDraft.js              # Hook lưu/load DRAFT tự động
└── store/
    └── installmentStore.js                 # State management cho wizard form
```

### Backend (Spring Boot)
```
src/main/java/com/project/
├── controller/
│   ├── InstallmentController.java          # CRUD + action endpoints
│   ├── WebhookController.java              # Nhận kết quả từ Bank
│   └── PaymentController.java             # Tạo URL thanh toán, callback
├── service/
│   ├── InstallmentService.java             # Business logic hồ sơ
│   ├── BankIntegrationService.java         # Gọi API Bank + ký HMAC
│   ├── WebhookService.java                 # Xử lý webhook từ Bank
│   ├── CloudinaryDocumentService.java      # Upload file lên Cloudinary riêng
│   ├── InstallmentPaymentService.java      # Tạo lệnh cọc + callback
│   └── InstallmentNotificationService.java # Gửi thông báo theo trạng thái
├── entity/
│   ├── InstallmentApplication.java
│   ├── InstallmentDocument.java
│   └── InstallmentStatusHistory.java
├── repository/
│   ├── InstallmentApplicationRepository.java
│   ├── InstallmentDocumentRepository.java
│   └── InstallmentStatusHistoryRepository.java
├── dto/
│   ├── request/
│   │   ├── InstallmentApplicationRequest.java
│   │   ├── BankLoanApplyRequest.java
│   │   └── BankWebhookPayload.java
│   └── response/
│       ├── InstallmentApplicationResponse.java
│       └── BankLoanApplyResponse.java
└── config/
    ├── CloudinaryDocumentConfig.java       # Cloudinary instance thứ 2
    └── BankApiConfig.java                  # API Key, Secret, URL
```

---

## 📐 Schema Database

> **Lưu ý:** Toàn bộ schema dùng SQL Server syntax, nhất quán với `init_schema.sql` hiện có.

### Bảng `InstallmentApplications`

```sql
CREATE TABLE InstallmentApplications (
    id                      BIGINT          IDENTITY(1,1) NOT NULL,

    -- FK liên kết hệ thống
    customer_id             BIGINT          NOT NULL,
    vehicle_id              BIGINT          NOT NULL,
    assigned_staff_id       BIGINT          NULL,
    deposit_id              BIGINT          NULL,   -- FK -> Deposits.id (cọc thiện chí)

    -- [Section 1] Thông tin cá nhân
    full_name               NVARCHAR(100)   NOT NULL,
    date_of_birth           DATE            NOT NULL,
    id_card_number          NVARCHAR(20)    NOT NULL,
    id_card_issued_date     DATE            NULL,
    id_card_issued_place    NVARCHAR(255)   NULL,
    phone_number            NVARCHAR(20)    NOT NULL,
    email                   NVARCHAR(255)   NULL,
    permanent_address       NVARCHAR(500)   NULL,
    current_address         NVARCHAR(500)   NULL,

    -- [Section 2] Nghề nghiệp & Thu nhập
    occupation_type         VARCHAR(20)     NOT NULL,  -- 'EMPLOYEE' | 'SELF_EMPLOYED'
    employer_name           NVARCHAR(255)   NULL,
    job_title               NVARCHAR(100)   NULL,
    work_duration_months    INT             NULL,
    monthly_income          DECIMAL(18,0)   NOT NULL,
    salary_payment_method   VARCHAR(20)     NULL,      -- 'CASH' | 'BANK_TRANSFER'
    business_name           NVARCHAR(255)   NULL,      -- Chỉ dùng khi SELF_EMPLOYED
    business_type           NVARCHAR(100)   NULL,
    business_duration_months INT            NULL,

    -- [Section 3] Tài chính
    total_income            DECIMAL(18,0)   NULL,
    monthly_expenses        DECIMAL(18,0)   NULL,
    existing_loans          DECIMAL(18,0)   NOT NULL CONSTRAINT DF_IA_ExistingLoans DEFAULT 0,
    dependents_count        INT             NOT NULL CONSTRAINT DF_IA_Dependents DEFAULT 0,

    -- [Section 4] Khoản vay
    vehicle_price           DECIMAL(18,0)   NOT NULL,
    down_payment            DECIMAL(18,0)   NOT NULL,
    loan_amount             DECIMAL(18,0)   NOT NULL,
    loan_term_months        INT             NOT NULL,
    repayment_type          NVARCHAR(50)    NULL,

    -- Tích hợp Bank API
    bank_loan_id            NVARCHAR(255)   NULL,      -- loanId trả về từ Bank API
    bank_approval_pdf_url   NVARCHAR(500)   NULL,      -- URL PDF lưu từ Webhook ngân hàng
    rejection_reason        NVARCHAR(1000)  NULL,

    -- Trạng thái & Timestamps
    status                  VARCHAR(30)     NOT NULL CONSTRAINT DF_IA_Status DEFAULT 'DRAFT',
    submitted_at            DATETIME2(3)    NULL,
    completed_at            DATETIME2(3)    NULL,
    created_at              DATETIME2(3)    NOT NULL CONSTRAINT DF_IA_CreatedAt DEFAULT SYSUTCDATETIME(),
    updated_at              DATETIME2(3)    NOT NULL CONSTRAINT DF_IA_UpdatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_InstallmentApplications PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_IA_Status CHECK (status IN (
        'DRAFT','PENDING','CIC_CHECKING','APPRAISING',
        'APPROVED','REJECTED','COMPLETED','CANCELLED'
    )),
    CONSTRAINT CK_IA_OccupationType CHECK (occupation_type IN ('EMPLOYEE','SELF_EMPLOYED')),
    CONSTRAINT CK_IA_LoanAmount      CHECK (loan_amount > 0),
    CONSTRAINT CK_IA_DownPayment     CHECK (down_payment >= 0),
    CONSTRAINT FK_IA_Customer  FOREIGN KEY (customer_id)       REFERENCES Users(id),
    CONSTRAINT FK_IA_Vehicle   FOREIGN KEY (vehicle_id)        REFERENCES Vehicles(id),
    CONSTRAINT FK_IA_Staff     FOREIGN KEY (assigned_staff_id) REFERENCES Users(id),
    CONSTRAINT FK_IA_Deposit   FOREIGN KEY (deposit_id)        REFERENCES Deposits(id)
);

CREATE NONCLUSTERED INDEX IX_IA_Customer ON InstallmentApplications(customer_id, status);
CREATE NONCLUSTERED INDEX IX_IA_Vehicle  ON InstallmentApplications(vehicle_id);
CREATE NONCLUSTERED INDEX IX_IA_Staff    ON InstallmentApplications(assigned_staff_id)
    WHERE assigned_staff_id IS NOT NULL;
CREATE NONCLUSTERED INDEX IX_IA_Status   ON InstallmentApplications(status, created_at DESC);
CREATE NONCLUSTERED INDEX IX_IA_BankLoan ON InstallmentApplications(bank_loan_id)
    WHERE bank_loan_id IS NOT NULL;
```

### Bảng `InstallmentDocuments`

```sql
CREATE TABLE InstallmentDocuments (
    id                   BIGINT         IDENTITY(1,1) NOT NULL,
    application_id       BIGINT         NOT NULL,
    document_type        VARCHAR(30)    NOT NULL,
    cloudinary_url       NVARCHAR(500)  NOT NULL,
    cloudinary_public_id NVARCHAR(255)  NULL,
    original_filename    NVARCHAR(255)  NULL,
    uploaded_at          DATETIME2(3)   NOT NULL CONSTRAINT DF_ID_UploadedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_InstallmentDocuments PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_ID_DocType CHECK (document_type IN (
        'ID_CARD_FRONT','ID_CARD_BACK',
        'INCOME_PROOF','LABOR_CONTRACT','BUSINESS_LICENSE',
        'PURCHASE_CONTRACT','DEPOSIT_SLIP','BANK_APPROVAL_PDF','OTHER'
    )),
    CONSTRAINT FK_ID_Application FOREIGN KEY (application_id)
        REFERENCES InstallmentApplications(id) ON DELETE CASCADE
);

CREATE NONCLUSTERED INDEX IX_ID_ApplicationId
    ON InstallmentDocuments(application_id, document_type);
```

### Bảng `InstallmentStatusHistory`

> Theo pattern `BookingStatusHistory` / `TransferApprovalHistory` đã có trong dự án.

```sql
CREATE TABLE InstallmentStatusHistory (
    id             BIGINT        IDENTITY(1,1) NOT NULL,
    application_id BIGINT        NOT NULL,
    old_status     VARCHAR(30)   NULL,
    new_status     VARCHAR(30)   NOT NULL,
    changed_by     BIGINT        NULL,          -- NULL nếu do hệ thống/webhook tự động
    note           NVARCHAR(500) NULL,
    changed_at     DATETIME2(3)  NOT NULL CONSTRAINT DF_ISH_ChangedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_InstallmentStatusHistory PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_ISH_Application FOREIGN KEY (application_id)
        REFERENCES InstallmentApplications(id),
    CONSTRAINT FK_ISH_ChangedBy FOREIGN KEY (changed_by) REFERENCES Users(id)
);

CREATE NONCLUSTERED INDEX IX_ISH_ApplicationId
    ON InstallmentStatusHistory(application_id, changed_at DESC);
```

### Design Decision — Cọc thiện chí

> **Không tạo bảng mới.** Tái sử dụng bảng `Deposits` và `Transactions` đã có:

```
- Tạo bản ghi Deposits với payment_method = 'vnpay' hoặc 'zalopay'
- Sau khi tạo xong → lưu Deposits.id vào InstallmentApplications.deposit_id
- Bảng Transactions log giao dịch với:
    reference_type = 'InstallmentDeposit'
    reference_id   = Deposits.id
```

---

## 📝 Yêu cầu Nghiệp vụ

### Luồng theo Actor

#### 1. Guest (Khách vãng lai)
- Tại trang chi tiết xe: xem widget dự toán — chọn ngân hàng, kéo % trả trước, chọn kỳ hạn → hệ thống hiển thị số tiền trả hàng tháng (gốc + lãi)
- Nhấn "Đăng ký mua trả góp" → popup yêu cầu Đăng nhập / Đăng ký tài khoản

#### 2. Customer (Khách hàng đã đăng nhập)
- Nhấn "Đăng ký mua trả góp" → chuyển vào `InstallmentWizardPage`
- Hệ thống tự động lưu DRAFT mỗi khi điền; đóng trình duyệt có thể quay lại tiếp tục
- Điền form 7 bước → upload giấy tờ → tick cam kết → nhấn "Gửi hồ sơ"
- Sau khi gửi → redirect sang cổng thanh toán cọc thiện chí (10–20 triệu) qua VNPay / ZaloPay
- Vào trang "Quản lý hồ sơ" → theo dõi tiến độ:
  `DRAFT` → `PENDING` → `CIC_CHECKING` → `APPRAISING` → `APPROVED` → `COMPLETED`

#### 3. Bank System (API bên ngoài)
- **Hệ thống gọi ra (outbound):**
  - URL: `POST https://credit-service-n2s5.onrender.com/api/loan/apply`
  - Headers bắt buộc: `X-API-Key`, `X-Timestamp`, `X-Signature` (HMAC SHA256)
  - Nhận về: `loanId` → lưu vào `InstallmentApplications.bank_loan_id`
- **Bank gọi về (webhook inbound):**
  - Endpoint: `POST /api/webhook/bank/loan-result`
  - Body: `{ loanId, status: APPROVED|REJECTED, rejectionReason?, pdfUrl? }`
  - Phải verify HMAC chữ ký trước khi xử lý

#### 4. Sales Staff (Nhân viên bán hàng)
- Nhận thông báo có hồ sơ mới → vào xem danh sách, kiểm tra giấy tờ upload
- Nhấn **"Gửi ngân hàng định giá"** → trigger API định giá → cập nhật hạn mức cho vay
- Khi khách đã cọc tiền → chuyển trạng thái xe sang `Reserved`
- Nếu hồ sơ bị từ chối CIC → nhấn **"Hủy hồ sơ & Hoàn cọc"** → trigger hoàn tiền
- Khi bank giải ngân → nhấn **"Xác nhận hoàn tất"** → hồ sơ thành `COMPLETED`, xe thành `Sold`

#### 5. System Admin (Quản trị viên)
- Quản lý danh sách ngân hàng đối tác: thêm/sửa tên, logo
- Cấu hình `API Key`, `Endpoint URL` của từng ngân hàng
- Cập nhật lãi suất cơ sở để widget dự toán tính đúng theo từng thời kỳ
- Xem toàn bộ hồ sơ trả góp toàn hệ thống, lọc theo trạng thái / chi nhánh

---

### Wizard Form — Map 5 bước cụ thể

| Bước | Tên bước | Trường dữ liệu | Upload file |
|------|----------|----------------|-------------|
| 1 | Thông tin cá nhân | Họ tên, Ngày sinh, Số CCCD, SĐT, Email | ❌ |
| 2 | Nghề nghiệp, Thu nhập & Chi phí | Loại công việc, Tên công ty, Thu nhập, Chi phí sinh hoạt, Nợ hiện tại, Người phụ thuộc | ❌ |
| 3 | Thông tin khoản vay | Loại xe (pre-fill từ trang xe), Giá xe (pre-fill), Số tiền trả trước, Số tiền vay, Kỳ hạn | ❌ |
| 4 | Hồ sơ giấy tờ | Checklist: CCCD mặt trước + mặt sau, Bảng lương / Sao kê / GPKD, HĐ lao động, v.v. | ✅ Nhiều file, drag & drop |
| 5 | Xem lại & Gửi | Hiển thị toàn bộ thông tin tất cả bước để review; Checkbox cam kết; nút "Gửi hồ sơ" chỉ active khi pass validation | ❌ |

**Lưu ý đặc biệt:**
- **Bước 3:** `vehiclePrice` được tự động lấy từ xe hiện tại.
- **Bước 4:** `FileUploadZone` hỗ trợ drag & drop, preview ảnh, xóa file đã chọn trước khi submit.
- **Bước 5:** Nút "Gửi hồ sơ" bị disabled nếu bất kỳ bước nào chưa pass validation.

### Dữ liệu gửi đến ngân hàng

Ngân hàng nhận **song song 2 loại**:

**Nhóm 1 — Dữ liệu có cấu trúc (JSON):** Họ tên, CCCD, SĐT, Địa chỉ, Nghề nghiệp, Công ty, Thu nhập, Thời gian làm việc, Chi phí, Khoản vay hiện tại, Số người phụ thuộc, Giá xe, Trả trước, Số tiền vay, Kỳ hạn.

**Nhóm 2 — File tài liệu (URL từ Cloudinary):** Ảnh CCCD mặt trước/sau, Bảng lương / Sao kê / GPKD, Hợp đồng mua xe. Flow: Frontend upload → Cloudinary Documents → lấy URL bảo mật → gửi URL trong API payload.

---

## 📋 Kế hoạch Triển khai — 10 Phases

---

### Phase 1: DB Schema + Entity + Repository (Backend)

**Task 1.1 — Cấu hình Cloudinary thứ 2 (Documents)**
- Tạo `CloudinaryDocumentConfig.java` với cloud_name/api_key/api_secret riêng biệt, folder `installment-documents`
- Tạo `CloudinaryDocumentService.java` với method: `uploadFile(MultipartFile, String documentType)` → trả về `{ url, publicId }`

**Task 1.2 — Tạo 3 Entity và Repository**
- `InstallmentApplication.java` — map đầy đủ các cột theo schema trên, bao gồm enum `InstallmentStatus`
- `InstallmentDocument.java` — map bảng `InstallmentDocuments`
- `InstallmentStatusHistory.java` — map bảng `InstallmentStatusHistory`
- Tạo 3 Repository tương ứng với các query method cần thiết:
  - `findByCustomerIdAndStatus(Long customerId, InstallmentStatus status)`
  - `findByBankLoanId(String bankLoanId)`
  - `findTopByCustomerIdAndStatusOrderByCreatedAtDesc(Long customerId, InstallmentStatus status)`

**Task 1.3 — Tạo API endpoint nhận form từ Frontend**
- `POST /api/installments/applications` — nhận payload từ Frontend, lưu DB với status `DRAFT`
- `PUT /api/installments/applications/{id}` — cập nhật hồ sơ đang DRAFT
- `GET /api/installments/applications/my-draft` — trả về hồ sơ DRAFT hiện tại của Customer (nếu có)
- `POST /api/installments/applications/{id}/submit` — chuyển DRAFT → PENDING, set `submitted_at`

**Task 1.4 — Seed Permissions cho module Installment**
```sql
INSERT INTO Permissions (module, action, description) VALUES
    ('Installment', 'view',     N'Xem hồ sơ trả góp'),
    ('Installment', 'create',   N'Tạo hồ sơ trả góp'),
    ('Installment', 'update',   N'Cập nhật hồ sơ trả góp'),
    ('Installment', 'appraise', N'Gửi ngân hàng định giá'),
    ('Installment', 'cancel',   N'Hủy hồ sơ & hoàn cọc'),
    ('Installment', 'approve',  N'Duyệt / từ chối hồ sơ');
```

Phân quyền theo Role:
- `Customer` → `view` + `create` (chỉ hồ sơ của chính mình)
- `SalesStaff` → `view` + `update` + `appraise` + `cancel`
- `BranchManager` → `view` + `update` + `approve` + `cancel`
- `Admin` → toàn bộ

---

### Phase 2: Upload Tài liệu (Backend)

**Task 2.1 — API Upload file**
- `POST /api/installments/applications/{id}/documents` — nhận `MultipartFile` + `documentType`, upload lên Cloudinary Documents, insert `InstallmentDocuments`, trả về URL
- Validate: chỉ chấp nhận `jpg`, `png`, `pdf`; giới hạn 10MB/file
- Một `application_id` có thể có nhiều document, mỗi `document_type` có thể upload lại (overwrite `publicId` cũ trên Cloudinary)

**Task 2.2 — API lấy danh sách tài liệu**
- `GET /api/installments/applications/{id}/documents` — trả về list document URLs theo `document_type`

---

### Phase 3: Tích hợp API Ngân hàng (Backend)

**Task 3.1 — Tạo `BankIntegrationService` với HMAC SHA256**
```
Thuật toán tạo chữ ký:
1. Serialize payload thành chuỗi JSON
2. Lấy unix timestamp hiện tại
3. rawString = payloadJson + timestamp
4. signature  = HMAC_SHA256(rawString, apiSecret)
5. Gửi kèm Header: X-API-Key, X-Timestamp, X-Signature
```

**Task 3.2 — Gọi API `loan/apply` và xử lý kết quả**
- Dùng `RestTemplate` hoặc `WebClient` để gọi `POST https://credit-service-n2s5.onrender.com/api/loan/apply`
- Nhận về `loanId` → cập nhật `InstallmentApplications.bank_loan_id`
- Chuyển trạng thái → `CIC_CHECKING`
- Xử lý lỗi:
  - HTTP 400 → log lý do, giữ trạng thái `PENDING`, notify Staff
  - HTTP 401 → log cảnh báo "sai API Key/Signature", alert Admin

**Task 3.3 — Endpoint kích hoạt từ Staff**
- `POST /api/installments/applications/{id}/appraise` — chỉ Staff/Manager được gọi
- Validate: hồ sơ phải ở trạng thái `PENDING` mới được gửi

**Task 3.4 — Log AuditLogs cho mọi Bank API call**
```
Mỗi lần gọi ra hoặc nhận kết quả, insert AuditLogs:
  module  = 'Installment'
  action  = 'BANK_API_CALL' | 'BANK_API_FAILED'
  details = JSON { applicationId, bankLoanId, httpStatus, timestamp }
  user_id = NULL (system action)
```

---

### Phase 4: Webhook Handler — Nhận kết quả từ Ngân hàng (Backend)

> **Phase quan trọng nhất — thiếu trong plan gốc**

**Task 4.1 — Tạo `WebhookController`**
- Endpoint: `POST /api/webhook/bank/loan-result`
- Endpoint này là **public** (không yêu cầu JWT), xác thực bằng HMAC chữ ký riêng
- Body nhận: `{ loanId, status, rejectionReason?, pdfUrl? }`

**Task 4.2 — Xác thực HMAC chữ ký từ Bank**
- Đọc header `X-Signature` từ request của Bank
- Tính lại signature từ body + timestamp bằng cùng `apiSecret`
- Nếu **không khớp**: trả về HTTP 401, insert `AuditLogs` với `action = 'WEBHOOK_INVALID_SIGNATURE'`, **dừng xử lý**
- Nếu **hợp lệ**: tiếp tục

**Task 4.3 — Xử lý kết quả `APPROVED`**
1. Tra cứu `InstallmentApplications` theo `bank_loan_id`
2. Nếu Bank gửi kèm file PDF:
   - Upload PDF lên Cloudinary Documents
   - Lưu URL vào `InstallmentApplications.bank_approval_pdf_url`
   - Insert `InstallmentDocuments` với `document_type = 'BANK_APPROVAL_PDF'`
3. Cập nhật `status = 'APPROVED'`
4. Insert `InstallmentStatusHistory` (`old_status → APPROVED`, `changed_by = NULL`)
5. Insert `Notifications` cho Customer: "Hồ sơ được duyệt, chờ giải ngân"
6. Insert `Notifications` cho `assigned_staff_id`: "Hồ sơ [ID] được ngân hàng duyệt"
7. Trả về HTTP 200 cho Bank

**Task 4.4 — Xử lý kết quả `REJECTED`**
1. Tra cứu `InstallmentApplications` theo `bank_loan_id`
2. Cập nhật `status = 'REJECTED'`, lưu `rejection_reason`
3. Insert `InstallmentStatusHistory`
4. Insert `Notifications` cho Customer: "Hồ sơ bị từ chối" + lý do
5. Insert `Notifications` cho Staff: nhắc xử lý "Hủy hồ sơ & Hoàn cọc"
6. Trả về HTTP 200 cho Bank

**Task 4.5 — Log AuditLogs cho mọi Webhook nhận được**
```
Dù thành công hay thất bại, luôn insert:
  module  = 'Installment'
  action  = 'WEBHOOK_RECEIVED' | 'WEBHOOK_INVALID_SIGNATURE'
  details = JSON { loanId, bankStatus, httpStatus, receivedAt }
  user_id = NULL
```

**Task 4.6 — Seed `NotificationTemplates`**
```sql
INSERT INTO NotificationTemplates (name, title_template, body_template, channel) VALUES
  ('INSTALLMENT_SUBMITTED',  N'Hồ sơ trả góp mới',           N'Có hồ sơ trả góp #{id} cần xử lý',             'in_app'),
  ('INSTALLMENT_CIC',        N'Hồ sơ đang tra cứu CIC',       N'Hồ sơ của bạn đang được kiểm tra tín dụng',    'in_app'),
  ('INSTALLMENT_APPROVED',   N'Hồ sơ được duyệt!',            N'Chúc mừng! Khoản vay của bạn đã được phê duyệt','in_app'),
  ('INSTALLMENT_REJECTED',   N'Hồ sơ chưa được duyệt',        N'Hồ sơ của bạn chưa đạt yêu cầu: #{reason}',   'in_app'),
  ('INSTALLMENT_COMPLETED',  N'Hồ sơ hoàn tất',               N'Cảm ơn bạn đã tin tưởng. Xe đã được bàn giao', 'in_app');
```

---

### Phase 5: Thanh toán Cọc thiện chí (Backend)

**Task 5.1 — Tạo URL thanh toán**
- `POST /api/installments/applications/{id}/deposit/create`
- Validate: hồ sơ phải ở trạng thái `PENDING`, chưa có `deposit_id`
- Tạo bản ghi `Deposits` với `payment_method = 'vnpay'` hoặc `'zalopay'`
- Lưu `Deposits.id` vào `InstallmentApplications.deposit_id`
- Gọi VNPay / ZaloPay SDK tạo URL thanh toán → trả về URL cho Frontend redirect

**Task 5.2 — Nhận callback sau thanh toán**
- `GET /api/payments/installment-deposit/callback` — nhận kết quả từ cổng thanh toán
- Nếu **thành công**:
  - Cập nhật `Deposits.status = 'Confirmed'`, lưu `gateway_txn_ref`
  - Insert `Transactions` với `reference_type = 'InstallmentDeposit'`, `reference_id = deposit_id`
  - Insert `Notifications` cho Staff: "Khách đã cọc — cần khóa xe"
- Nếu **thất bại**:
  - Cập nhật `Deposits.status = 'Cancelled'`
  - Notify Customer: "Thanh toán không thành công, vui lòng thử lại"

**Task 5.3 — API hoàn cọc (Staff kích hoạt)**
- `POST /api/installments/applications/{id}/cancel`
- Chỉ Staff/Manager được gọi, hồ sơ phải ở trạng thái `REJECTED` hoặc `PENDING`
- Trigger hoàn tiền qua payment gateway (VNPay Refund / ZaloPay Refund API)
- Cập nhật `Deposits.status = 'Refunded'`
- Cập nhật `InstallmentApplications.status = 'CANCELLED'`
- Insert `InstallmentStatusHistory`
- Notify Customer: "Hồ sơ đã hủy, tiền cọc sẽ được hoàn trong 3–5 ngày làm việc"

---

### Phase 6: Công cụ Dự toán & Khởi tạo (Frontend)

**Task 6.1 — Component `InstallmentCalculatorWidget`**
- Đặt tại trang `VehicleDetailPage`
- Cho phép chọn: Ngân hàng (dropdown), % Trả trước (slider 10–50%), Kỳ hạn vay (12/24/36/48/60 tháng)
- Tự động tính và hiển thị: Số tiền vay, Lãi suất/tháng, Tiền trả tháng đầu (gốc + lãi)
- Lãi suất lấy từ `SystemConfigs` (Admin cấu hình), fallback về mức mặc định

**Task 6.2 — Nút "Đăng ký mua trả góp"**
- Nếu là **Guest**: mở popup yêu cầu đăng nhập / đăng ký
- Nếu là **Customer**: redirect đến `InstallmentWizardPage` với query params `?vehicleId=xxx&vehiclePrice=yyy`

---

### Phase 7: Wizard Form 5 bước + DRAFT auto-save (Frontend)

**Task 7.1 — Layout `InstallmentWizardPage`**
- Dựng layout với `WizardProgressBar` hiển thị 5 bước, highlight bước hiện tại
- Khi vào trang: gọi `GET /api/installments/applications/my-draft`
  - Có DRAFT → tự động khôi phục dữ liệu đã nhập
  - Không có → bắt đầu từ Bước 1
- Pre-fill `vehiclePrice` vào Bước 3

**Task 7.2 — Tích hợp `react-hook-form` + `zod`**
- Một form schema duy nhất bao gồm tất cả 5 bước
- Mỗi bước chỉ validate các trường của bước đó khi nhấn "Tiếp tục"
- Nút "Tiếp tục" bị disabled nếu bước hiện tại chưa pass validation

**Task 7.3 — Hook `useInstallmentDraft`**
- Tự động `PUT /api/installments/applications/{id}` mỗi khi giá trị form thay đổi (debounce 2 giây)
- Nếu chưa có `id`: gọi `POST` tạo DRAFT mới khi điền xong Bước 1
- Lưu `applicationId` vào localStorage để restore khi quay lại

**Task 7.4 — Bước 1: Thông tin cá nhân**
- Fields: Họ tên, Số CCCD/CMND, Ngày sinh, Số điện thoại, Email
- Không upload file ở bước này.

**Task 7.5 — Bước 2: Nghề nghiệp, Thu nhập & Chi phí**
- Select loại hình công việc, Tên công ty / Đơn vị, Thu nhập hàng tháng.
- Bổ sung các trường tài chính: Chi phí sinh hoạt/tháng, Khoản vay hiện tại, Số người phụ thuộc (để đáp ứng tiêu chí chấm điểm tín dụng của ngân hàng).

**Task 7.6 — Bước 3: Thông tin khoản vay**
- `vehiclePrice` được pre-fill.
- Fields nhập: Số tiền trả trước, Kỳ hạn vay.
- Auto-tính và hiển thị: Số tiền vay = Giá xe − Trả trước.

**Task 7.7 — Bước 4: Hồ sơ giấy tờ**
- `FileUploadZone` component hỗ trợ:
  - Drag & drop hoặc click to browse
  - Preview ảnh (hoặc icon PDF)
  - Nút xóa file trước khi upload
- Tải lên tài liệu eKYC (CCCD, Bảng lương, Hộ khẩu, v.v.).
- Mỗi file upload ngay lập tức gọi API documents.

**Task 7.8 — Bước 5: Xem lại & Gửi**
- Hiển thị toàn bộ thông tin đã nhập theo từng section (read-only)
- Nút "Quay lại sửa" cho phép quay về bước bất kỳ
- Nút "Gửi hồ sơ" chỉ active khi tất cả 4 bước trước đã pass validation
- Sau khi gửi thành công (status → `PENDING`):
  - Gọi `POST /api/installments/applications/{id}/deposit/create` để tạo lệnh cọc
  - Redirect ngay sang trang thanh toán VNPay / ZaloPay
  - Mục đích: giữ xe trong thời gian chờ thẩm định

---

### Phase 8: Trang Quản lý Hồ sơ của Staff (Frontend)

**Task 8.1 — `StaffInstallmentsPage`: Danh sách hồ sơ**
- Hiển thị bảng hồ sơ trả góp được assign cho Staff hoặc chi nhánh
- Filter theo: Trạng thái, Ngày tạo, Khách hàng
- Mỗi dòng hiển thị: Tên KH, Xe, Số tiền vay, Trạng thái (badge màu), Ngày gửi

**Task 8.2 — Trang chi tiết hồ sơ**
- Xem đầy đủ thông tin KH đã điền (5 bước)
- Xem preview tài liệu upload (ảnh + PDF)
- Hiển thị timeline trạng thái từ `InstallmentStatusHistory`

**Task 8.3 — Các nút hành động theo trạng thái**

| Trạng thái hồ sơ | Nút hiển thị | Action |
|---|---|---|
| `PENDING` | "Gửi ngân hàng định giá" | `POST /api/installments/{id}/appraise` |
| `PENDING` | "Hủy hồ sơ & Hoàn cọc" | `POST /api/installments/{id}/cancel` |
| `APPROVED` | "Xác nhận giải ngân & Hoàn tất" | `POST /api/installments/{id}/complete` → cập nhật xe thành `Sold` |
| `REJECTED` | "Hủy hồ sơ & Hoàn cọc" | `POST /api/installments/{id}/cancel` |

**Task 8.4 — Hiển thị PDF phê duyệt từ ngân hàng**
- Sau khi webhook APPROVED về: hiển thị link/iframe xem file PDF `bank_approval_pdf_url`
- Cả Staff và Customer đều thấy được link này

---

### Phase 9: Trang Theo dõi Hồ sơ của Customer (Frontend)

**Task 9.1 — `InstallmentStatusPage`**
- Hiển thị timeline trạng thái dạng stepper: `PENDING` → `CIC_CHECKING` → `APPRAISING` → `APPROVED` → `COMPLETED`
- Mỗi bước hiển thị: tên trạng thái, mô tả ngắn, timestamp
- Nếu `REJECTED`: hiển thị lý do từ chối

**Task 9.2 — Section thông tin khoản vay**
- Hiển thị: Giá xe, Số tiền vay, Kỳ hạn, Số tiền trả hàng tháng (ước tính)
- Nếu `APPROVED`: hiển thị hạn mức chính thức từ ngân hàng

**Task 9.3 — Section tài liệu & PDF**
- Danh sách tài liệu đã upload với trạng thái
- Link xem PDF "Thông báo đồng ý cho vay" (nếu đã có)

**Task 9.4 — Nút "Thanh toán cọc" (Fallback)**
- Luồng chính: Customer được redirect sang thanh toán ngay sau khi gửi hồ sơ (Task 7.8)
- Nút này chỉ hiện như fallback khi: status = `PENDING` VÀ `deposit_id` còn NULL
  (tức là Customer đã gửi hồ sơ nhưng tắt trang trước khi hoàn tất thanh toán)
- Khi nhấn: gọi `POST /api/installments/applications/{id}/deposit/create` → redirect sang VNPay / ZaloPay
- Không hiện nút này khi status = `APPROVED` (đã muộn, xe cần được giữ ngay từ lúc PENDING)

---

### Phase 10: Integration Test End-to-End

> **Chiến lược test:**
> - **Playwright E2E:** Happy Path UI, DRAFT auto-save, Security (phân quyền Customer)
> - **Postman / curl thủ công:** Giả lập Bank gọi Webhook vào `POST /api/webhook/bank/loan-result`
>   với body `{ loanId, status: "APPROVED" }` và header X-Signature hợp lệ
> - **JUnit Unit Test (Backend):** Xác thực thuật toán HMAC SHA256 trong `BankIntegrationService`
>   và `WebhookService` — test cả case signature đúng và sai
> - **Sandbox Gateway:** Test callback VNPay/ZaloPay bằng môi trường sandbox của từng cổng

**Task 10.1 — Test luồng Happy Path**
- Customer điền đủ 5 bước → Gửi hồ sơ → Thanh toán cọc → Staff gửi định giá → Bank webhook APPROVED → Staff xác nhận hoàn tất → Xe chuyển `Sold`

**Task 10.2 — Test luồng Rejected**
- Bank webhook REJECTED → Staff hủy hồ sơ → Refund cọc → Xe về `Available`

**Task 10.3 — Test DRAFT auto-save**
- Customer điền đến Bước 4, đóng tab → mở lại → chọn "Tiếp tục hồ sơ cũ" → form restore đúng dữ liệu

**Task 10.4 — Test bảo mật**
- Gửi request Webhook với signature sai → nhận HTTP 401
- Customer A không thể xem hồ sơ của Customer B
- Guest không thể gọi API tạo hồ sơ

---

## ✅ Điều kiện Hoàn thành (Done When)

- [ ] Backend sinh đúng chữ ký HMAC SHA256 và call thành công `credit-service-n2s5.onrender.com`, nhận về HTTP 200 kèm `loanId`
- [ ] Webhook từ Bank được nhận, xác thực chữ ký HMAC thành công, cập nhật DB đúng trạng thái
- [ ] File PDF phê duyệt từ Bank được upload lên Cloudinary Documents và hiển thị được cho Staff & Customer
- [ ] Customer điền đủ 5 bước form mượt mà, upload ảnh đúng vào Cloudinary riêng biệt
- [ ] Hồ sơ DRAFT được lưu tự động, Customer có thể đóng trình duyệt rồi quay lại điền tiếp
- [ ] Customer thanh toán cọc thiện chí qua VNPay / ZaloPay thành công, xe chuyển sang `Reserved`
- [ ] Staff thấy đủ 3 nút hành động: "Gửi định giá" / "Hủy & Hoàn cọc" / "Xác nhận hoàn tất"
- [ ] Customer nhận thông báo in-app khi trạng thái hồ sơ thay đổi
- [ ] Staff thấy được hồ sơ trả góp nạp vào hệ thống cùng với `loanId` liên kết
- [ ] Mọi Bank API call và Webhook đều được ghi vào `AuditLogs`
- [ ] Webhook với chữ ký không hợp lệ bị từ chối HTTP 401, không cập nhật DB

---

## 🔢 Thứ tự triển khai (Road Map)

```
Phase 1: DB Schema + Entity + Repository + Permissions seed
    ↓
Phase 2: Upload Tài liệu — Cloudinary Documents Service
    ↓
Phase 3: Bank Integration — HMAC Signature + API call
    ↓
Phase 4: Webhook Handler — Nhận kết quả, xử lý APPROVED/REJECTED ★
    ↓
Phase 5: Payment Gateway — Cọc thiện chí VNPay/ZaloPay ★
    ↓
Phase 6: Frontend — Installment Calculator Widget
    ↓
Phase 7: Frontend — Wizard Form 5 bước + DRAFT auto-save
    ↓
Phase 8: Frontend — Staff Management Page + Action Buttons
    ↓
Phase 9: Frontend — Customer Status Tracking Page
    ↓
Phase 10: Integration Test end-to-end
```
