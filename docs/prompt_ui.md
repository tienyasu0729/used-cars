> **BanXeOTo Da Nang**
>
> AI Stitch Prompt Sets --- Complete UI System
>
> Used Car Marketplace \| Da Nang, Vietnam

**SECTION 1 --- UI Architecture Overview**

BanXeOTo Da Nang is a full-stack used car marketplace serving 5 distinct
actor types: Guest, Customer, Sales Staff, Branch Manager, and System
Admin. The UI system comprises 56 canonical screens organized into 5
layout groups, each with its own navigation structure, color theme, and
interaction pattern.

The architecture follows a component-based design system where layout
wrappers, atomic components, and domain-specific components are defined
once and reused across all screens within a layout group.

**Actor & Screen Summary**

  --------------------------------------------------------------------------
  **Actor**       **Dashboard Route**   **Screen   **Layout Name**
                                        Count**    
  --------------- --------------------- ---------- -------------------------
  Guest /         / (Public Website)    12 screens PublicLayout
  Customer                                         

  Customer        /dashboard            11 screens CustomerDashboardLayout

  Sales Staff     /staff                10 screens StaffDashboardLayout

  Branch Manager  /manager              10 screens ManagerDashboardLayout

  System Admin    /admin                12 screens AdminDashboardLayout
  --------------------------------------------------------------------------

**Core Design Principles**

-   Single layout wrapper per actor group --- ensures structural
    consistency

-   Atomic component library shared across ALL layouts --- Button,
    Badge, Input, Modal, Toast, Spinner, EmptyState, SkeletonCard

-   Design token system --- one source of truth for colors, typography,
    spacing

-   Responsive-first --- every component adapts to mobile, tablet,
    desktop

-   Vietnamese language interface --- all UI text in Vietnamese

**SECTION 2 --- Layout Groups**

**Layout Group 1 --- Public Website**

Used by: Guest (unauthenticated) and Customer (authenticated, same
layout). Sticky header + footer + floating chat widget. Routes: /,
/vehicles, /vehicles/:id, /compare, /branches, /branches/:id, /contact,
/about, /login, /register, /forgot-password, /reset-password.

**Layout Group 2 --- Customer Dashboard**

Used by: Authenticated Customer. Sidebar (220px) + Topbar + Main content
area. All 11 dashboard pages share this exact layout. Routes:
/dashboard, /dashboard/profile, /dashboard/saved, /dashboard/bookings,
/dashboard/deposits, /dashboard/orders, /dashboard/orders/:id,
/dashboard/transactions, /dashboard/chat, /dashboard/notifications,
/dashboard/security.

**Layout Group 3 --- Sales Staff Dashboard**

Used by: Sales Staff (branch-scoped). Dark topbar (#1A3C6E) + dark
sidebar (gray-900) + light content area. Routes: /staff/dashboard,
/staff/schedule, /staff/bookings, /staff/consultations,
/staff/inventory, /staff/orders/new, /staff/orders, /staff/deposits/new,
/staff/chat, /staff/transfer-requests.

**Layout Group 4 --- Branch Manager Dashboard**

Used by: Branch Manager. White topbar + blue sidebar (#1A3C6E) + gray
content area. Routes: /manager/dashboard, /manager/vehicles,
/manager/vehicles/new, /manager/vehicles/:id/edit, /manager/staff,
/manager/staff/new, /manager/appointments, /manager/transfers,
/manager/reports, /manager/settings.

**Layout Group 5 --- System Admin Dashboard**

Used by: System Admin (full system access). Dark topbar (#111827) + dark
sidebar (#1F2937) + gray content area. Routes: /admin/dashboard,
/admin/users, /admin/roles, /admin/branches, /admin/branches/new,
/admin/catalog, /admin/transfers, /admin/cms, /admin/config,
/admin/reports, /admin/logs, /admin/notifications.

**SECTION 3 --- Global Design System**

This design system must be applied consistently across all 5 prompt
sets. Include this block at the top of every Stitch prompt.

GLOBAL DESIGN SYSTEM (Apply consistently across ALL screens)

COLOR TOKENS:

-   Primary Blue: #1A3C6E --- Header, sidebar active state, primary
    buttons, section headings

-   Accent Orange: #E8612A --- CTA buttons, vehicle price display, hover
    highlights, link accents

-   Success Green: #22C55E --- \"Available\" badges, success toasts,
    confirmation icons

-   Warning Orange: #F97316 --- \"Reserved/Deposited\" badges, warning
    states, deposit indicators

-   Danger Red: #EF4444 --- \"Sold\" badges, delete buttons, error
    messages, critical alerts

-   Background Gray: #F9FAFB --- Page backgrounds, card backgrounds,
    section fills

-   Border Gray: #E5E7EB --- Table borders, input borders, card borders,
    dividers

-   Text Dark: #111827 --- Primary content, headings, important labels

-   Text Secondary: #6B7280 --- Meta info, placeholders, secondary
    labels, timestamps

-   White: #FFFFFF --- Card surfaces, modal backgrounds, input fields

TYPOGRAPHY:

-   Font Family: Inter (primary), system-ui (fallback)

-   H1 Page Title: 28px / font-bold / text-gray-900

-   H2 Section Title: 22px / font-semibold / text-gray-800

-   H3 Card Title: 18px / font-semibold / text-gray-800

-   Body Large: 16px / font-normal / text-gray-700

-   Body: 14px / font-normal / text-gray-600

-   Caption/Meta: 12px / font-normal / text-gray-500

-   Label: 13px / font-medium / text-gray-700

SPACING SYSTEM (TailwindCSS):

-   Page padding: px-6 py-6 (desktop), px-4 py-4 (mobile)

-   Section gap: gap-6

-   Card padding: p-4 or p-6

-   Form field gap: space-y-4

-   Button padding: px-4 py-2 (md), px-6 py-3 (lg)

CARD DESIGN:

-   Background: white

-   Border: 1px solid #E5E7EB

-   Border-radius: rounded-xl (12px)

-   Shadow: shadow-sm (hover: shadow-md)

-   Padding: p-4 or p-6

BUTTON STYLES:

-   Primary: bg-\[#1A3C6E\] text-white hover:bg-blue-800 rounded-lg px-4
    py-2 font-medium

-   Accent/CTA: bg-\[#E8612A\] text-white hover:bg-orange-700 rounded-lg
    px-4 py-2 font-medium

-   Outline: border border-\[#1A3C6E\] text-\[#1A3C6E\] hover:bg-blue-50
    rounded-lg px-4 py-2

-   Danger: bg-\[#EF4444\] text-white hover:bg-red-600 rounded-lg px-4
    py-2

-   Ghost: text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-2

INPUT STYLES:

-   Default: border border-gray-300 rounded-lg px-3 py-2 text-sm
    focus:ring-2 focus:ring-blue-500 focus:border-transparent

-   Error: border-red-500 focus:ring-red-500

-   Helper text below field: text-xs text-gray-500

-   Error message: text-xs text-red-600

BADGE / STATUS STYLES:

-   Available: bg-green-100 text-green-700 border border-green-200
    rounded-full px-2.5 py-0.5 text-xs font-medium

-   Reserved/Deposit: bg-orange-100 text-orange-700 border
    border-orange-200 rounded-full px-2.5 py-0.5 text-xs font-medium

-   Sold: bg-gray-100 text-gray-600 border border-gray-200 rounded-full
    px-2.5 py-0.5 text-xs font-medium

-   Pending: bg-yellow-100 text-yellow-700 border border-yellow-200

-   Confirmed: bg-blue-100 text-blue-700 border border-blue-200

ICON USAGE:

-   Library: Lucide React (consistent icon set throughout)

-   Size: 16px inline, 20px standalone, 24px hero/nav

-   Color: Match context --- gray for meta, blue for primary actions,
    orange for CTA

TOAST NOTIFICATIONS:

-   Position: top-right, fixed, z-50

-   Duration: 3000ms auto-dismiss

-   Success: green-600 background with check icon

-   Error: red-600 background with x icon

-   Warning: orange-500 background with alert icon

TECH STACK:

-   React 18 + TypeScript

-   TailwindCSS (utility-first, no custom CSS unless unavoidable)

-   Lucide React (icons)

-   React Router v6 (routing)

-   Recharts (charts and analytics)

-   Component-based architecture --- every repeated UI element is a
    named component

COMPONENT ARCHITECTURE PRINCIPLES:

-   Create shared layout wrappers: PublicLayout,
    CustomerDashboardLayout, StaffDashboardLayout,
    ManagerDashboardLayout, AdminDashboardLayout

-   Create reusable atoms: Button, Badge, Input, Select, Modal, Toast,
    Spinner, EmptyState, SkeletonCard

-   Create domain components: VehicleCard, VehicleStatusBadge,
    BookingRow, StaffRow, etc.

-   All pages within the same layout must import and use the identical
    layout wrapper

RESPONSIVE BREAKPOINTS:

-   Mobile (sm): \< 640px --- single column, hamburger nav, filter
    drawers

-   Tablet (md): 640px--1024px --- 2 columns, collapsed sidebar

-   Desktop (lg): \> 1024px --- full layout, expanded sidebar, 3-4
    column grids

**SECTION 4 --- AI Stitch Prompt Sets**

The following 5 prompt sets are ready to paste directly into AI Stitch.
Each prompt generates all screens for one layout group. Paste the Global
Design System block (Section 3) at the top of each prompt before the
layout-specific content.

**PROMPT SET 1 --- PUBLIC WEBSITE UI**

Screens: 12 \| Actors: Guest, Customer \| Layout: PublicLayout

Paste this entire block into AI Stitch to generate all public-facing
screens:

**PROMPT SET 1 --- PUBLIC WEBSITE UI**

BanXeOTo Da Nang \| Used Car Marketplace \| Public-Facing Pages

You are building the complete public-facing website for \"BanXeOTo Da
Nang,\" a professional used-car marketplace in Da Nang, Vietnam.
Generate all screens listed below using a single consistent layout and
design system.

**1. SCREENS TO BUILD (all share PUBLIC WEBSITE LAYOUT)**

-   Homepage /

-   Vehicle Listing /vehicles

-   Vehicle Detail /vehicles/:id

-   Compare Vehicles /compare

-   Branch Listing /branches

-   Branch Detail /branches/:id

-   Contact / Consulting /contact

-   About Us /about

-   Login Page /login

-   Register Page /register

-   Forgot Password /forgot-password

-   Reset Password /reset-password

**2. PUBLIC WEBSITE LAYOUT STRUCTURE**

Create a \<PublicLayout\> wrapper component used by ALL pages above.

STICKY HEADER (h-16, bg-white, shadow-sm, z-50):

Left: Logo + brand name \"BanXeOTo\" in Primary Blue (#1A3C6E),
font-bold text-xl

Center: Nav links --- \"Mua Xe\" (/vehicles) \| \"Chi Nhánh\"
(/branches) \| \"Liên Hệ\" (/contact) \| \"Về Chúng Tôi\" (/about)

Center-Right: Inline search bar (hidden on mobile) --- placeholder \"Tìm
xe theo hãng, đời, giá\...\" width 280px

Right (guest): Button \"Đăng Nhập\" (outline) + Button \"Đăng Ký\"
(primary, bg-\[#E8612A\])

Right (authenticated): User avatar (40px circle) with dropdown: \"Trang
Cá Nhân\" \| \"Dashboard\" \| \"Đăng Xuất\"

Mobile: Hamburger icon (☰) opens full-screen slide-in drawer with all
nav links and auth buttons

FOOTER (bg-\[#1A3C6E\] text-white):

Column 1: Logo + tagline \"Chợ xe ô tô uy tín tại Đà Nẵng\" + social
icons (Facebook, Zalo, YouTube)

Column 2: \"Liên Kết Nhanh\" --- Mua Xe \| Chi Nhánh \| Liên Hệ \| Về
Chúng Tôi \| Blog

Column 3: \"Liên Hệ\" --- Hotline, Email, Địa chỉ trụ sở

Column 4: \"Giờ Hoạt Động\" --- Thứ 2--Thứ 7: 8:00--18:00 \| Chủ Nhật:
9:00--16:00

Bottom bar: © 2025 BanXeOTo Da Nang \| Chính sách bảo mật \| Điều khoản

Mobile: Stack to single column

FLOATING CHAT WIDGET (all public pages):

Position: fixed bottom-6 right-6 z-50

Collapsed state: Rounded button (60px circle) bg-\[#E8612A\] with
MessageCircle icon + tooltip \"Tư Vấn Ngay\"

Expanded state: Chat window 360×500px, rounded-2xl, shadow-2xl

-   Header: Avatar + \"Tư Vấn Viên BanXeOTo\" + Online/Offline badge +
    Close button

-   Message area: scrollable, alternating left/right bubbles

-   Input bar: Text input + Send button

-   When staff offline: Show \"AI đang hỗ trợ bạn\" indicator

-   Quick reply chips: \"Xem xe đang có\" \| \"Lịch làm việc\" \|
    \"Chính sách đặt cọc\"

**3. PAGE DEFINITIONS**

**PAGE A: HOMEPAGE (/)**

HERO SECTION (min-h-\[600px\], full-width):

Background: High-quality car image with dark gradient overlay
(from-black/60 to-transparent)

Heading: \"Tìm xe ô tô phù hợp nhất tại Đà Nẵng\" (text-5xl font-bold
text-white)

Sub-heading: \"Hàng trăm xe đã qua sử dụng chất lượng cao\" (text-xl
text-white/80)

SEARCH BAR (centered, white card, rounded-2xl, shadow-2xl, p-6,
max-w-3xl):

Row: Dropdown \"Hãng Xe\" (Select) \| Dropdown \"Giá Tối Đa\" \| Input
\"Từ khoá\" \| Button \"Tìm Kiếm\" (bg-\[#E8612A\])

QUICK STATS (3 cards below hero): \"500+ Xe Hiện Có\" \| \"3 Chi Nhánh\"
\| \"10 Năm Hoạt Động\"

FEATURED VEHICLES SECTION:

Heading: \"Xe Nổi Bật\" + Tab filter: \"Mới Nhất\" \| \"Giá Thấp Nhất\"
\| \"Giá Cao Nhất\"

Carousel: 4 VehicleCard per row (desktop), 2 (tablet), 1 (mobile)

Arrow buttons left/right for scroll

CTA link \"Xem tất cả xe →\"

WHY CHOOSE US SECTION (bg-\[#F9FAFB\]):

4 feature cards: Icon + Title + Description

Features: Xe kiểm định kỹ lưỡng \| Giá minh bạch \| Hỗ trợ thủ tục \|
Bảo hành sau mua

BRANCH MAP SECTION:

Left: Google Maps embed (60% width) showing branch pin locations

Right (40%): Scrollable list of branches

Each branch row: Branch name (bold) \| Address \| Phone \| Hours \|
\"Xem Chi Tiết\" link

TESTIMONIALS SECTION:

3 customer review cards: Avatar \| Name \| Star rating \| Quote text

Background: white, subtle border

CTA BANNER (bg-\[#1A3C6E\]):

Text: \"Chưa tìm được xe ưng ý?\" + Button \"Tư Vấn Miễn Phí\"
(bg-\[#E8612A\])

**PAGE B: VEHICLE LISTING (/vehicles)**

LAYOUT: 2-column --- Filter Panel (left 250px fixed) + Vehicle Grid
(right flex)

FILTER PANEL (left sidebar, sticky top-20, overflow-y-auto):

Title: \"Bộ Lọc\" + \"Xóa tất cả\" reset link

Filters (each in collapsible accordion section):

**1. Tìm kiếm từ khoá: Text input --- placeholder \"Nhãn, model, biển
số\...\"**

2\. Hãng Xe: Multi-select checkbox list (Toyota, Honda, Ford, Mazda,
Hyundai, Kia, Mitsubishi, Nissan, BMW, Mercedes)

3\. Dòng Xe: Multi-select checkbox (dependent on Brand selection ---
load dynamically)

**4. Năm Sản Xuất: Dual input range Tu/Đến (2000 --- current year)**

**5. Khoảng Giá (VND): Range slider 0--2,000,000,000 with formatted
number display**

**6. Số Km Đã Đi: Range slider 0--300,000 km**

**7. Nhiên Liệu: Checkbox --- Xăng \| Dầu \| Hybrid \| Điện**

**8. Hộp Số: Checkbox --- Số Tự Động \| Số Sàn**

9\. Màu Xe: Color swatches (circular 24px dots) --- Đen, Trắng, Bạc, Đỏ,
Xanh, Vàng

**10. Chi Nhánh: Checkbox list (all branches)**

**11. Trạng Thái: Checkbox --- Còn Hàng \| Đã Đặt Cọc**

Apply button (mobile only): \"Áp Dụng Bộ Lọc\" (full-width, primary)

VEHICLE GRID (right):

Toolbar row: Result count \"120 xe tìm thấy\" \| Sort dropdown \"Sắp xếp
theo\" (Mới nhất, Giá tăng dần, Giá giảm dần, Km ít nhất) \| Grid/List
toggle buttons

Grid: 3 cols desktop, 2 tablet, 1 mobile

VehicleCard component (see component spec below)

Pagination: Previous \| 1 2 3 \... 10 \| Next --- 20 items/page

VEHICLE CARD COMPONENT (reusable):

Container: rounded-xl bg-white border border-gray-200 shadow-sm
hover:shadow-md transition overflow-hidden

Image section (aspect-video):

-   Lazy-loaded vehicle image

-   Status badge top-left: \"Còn Hàng\" (green) \| \"Đã Đặt Cọc\"
    (orange) \| \"Đã Bán\" (gray)

-   Heart/Save button top-right (fills red when saved)

-   Compare checkbox bottom-left on hover

Card body (p-4):

-   Vehicle name: font-semibold text-gray-900 (e.g., \"Toyota Camry 2.5Q
    2020\")

-   Price: text-\[#E8612A\] font-bold text-xl (e.g., \"850.000.000 ₫\")

-   Meta row with icons: \[km icon\] 45,000 km \| \[calendar icon\] 2020
    \| \[fuel icon\] Xăng \| \[gear icon\] Tự động

-   Branch: \[MapPin icon\] Tên chi nhánh (text-sm text-gray-500)

-   Button row: \"Xem Chi Tiết\" (primary, flex-1) \| \"So Sánh\"
    (outline, icon only on mobile)

**PAGE C: VEHICLE DETAIL (/vehicles/:id)**

LAYOUT: Split --- Gallery left 60% + Info Panel right 40% (sticky)

GALLERY (left):

Main image: rounded-xl overflow-hidden aspect-video w-full object-cover

Thumbnail strip: Horizontal scroll row of 8 thumbnails (80×60px each),
selected has blue ring

Image count badge: \"1/8\" on main image

Fullscreen gallery modal: Click main image opens lightbox with arrow
navigation

INFO PANEL (right, sticky top-20):

Vehicle name: text-2xl font-bold text-gray-900

> Status badge: \"Còn Hàng\" / \"Đã Đặt Cọc\" / \"Đã Bán\"

Price: text-3xl font-bold text-\[#E8612A\]

Quick specs grid (2×3): Year \| Mileage \| Fuel \| Transmission \|
Exterior Color \| Interior Color

Branch info card (bg-gray-50 rounded-xl p-4):

Branch photo (circle 48px) \| Name (font-medium) \| Address \| Phone

\"Xem trên bản đồ\" link

CTA buttons (stacked):

\"Đặt Lịch Lái Thử\" --- bg-\[#1A3C6E\] text-white w-full py-3
rounded-lg font-medium (opens booking modal)

\"Đặt Cọc Ngay\" --- bg-\[#E8612A\] text-white w-full py-3 rounded-lg
font-medium (opens deposit modal)

\"Liên Hệ Tư Vấn\" --- outline border-gray-300 w-full py-3 (opens chat)

Secondary actions row: \[Heart\] Lưu xe \| \[GitCompare\] So sánh \|
\[Share2\] Chia sẻ (Facebook, Zalo, Copy)

TABS SECTION (below gallery+panel):

Tab bar: \"Thông Số Kỹ Thuật\" \| \"Mô Tả\" \| \"Vị Trí\" \| \"Xe Tương
Tự\"

Tab - Thông Số Kỹ Thuật:

2-column table: all technical specs with labels in left col, values in
right col

Groups: Thông tin cơ bản \| Động cơ & Vận hành \| Kích thước \| Trang bị

Tab - Mô Tả:

Rich text display of vehicle history, condition, service records

Tab - Vị Trí:

Google Maps iframe (height 300px) centered on branch location

Tab - Xe Tương Tự:

Grid 4 VehicleCard (same brand or similar price range)

MODALS triggered from this page:

BOOK TEST DRIVE MODAL:

Title: \"Đặt Lịch Lái Thử\"

> Fields: Họ tên (auto-fill if logged in) \| SĐT \| Ngày muốn lái (date
> picker) \| Khung giờ (select: 8h--18h, 1h slots) \| Ghi chú

Available slots shown as clickable time chip buttons (gray=available,
orange=booked)

Submit: \"Xác Nhận Đặt Lịch\" (primary)

DEPOSIT MODAL (multi-step wizard):

Step 1 - Xác nhận thông tin xe (readonly display)

Step 2 - Thông tin người đặt cọc + số tiền cọc (min 10,000,000 VND)

Step 3 - Phương thức thanh toán (Chuyển khoản \| Tiền mặt tại chi nhánh
\| VNPay \| MoMo)

Step 4 - Xác nhận & hoàn tất

Progress steps indicator at top

**PAGE D: COMPARE VEHICLES (/compare)**

COMPARE BAR (sticky bottom, shows when ≥1 vehicle selected on listing):

Row of 3 slots: Each slot shows mini vehicle card or empty \"+ Thêm xe\"
placeholder

\"So Sánh Ngay\" button (active when ≥2 selected)

COMPARE TABLE:

Top row: 3 vehicle columns (each with image, name, price, \"Xóa\"
button, \"Đặt Lịch Lái Thử\" CTA)

Comparison rows (each spec is a row):

> Rows: Giá \| Năm SX \| Số Km \| Hãng \| Dòng xe \| Động cơ \| Nhiên
> liệu \| Hộp số \| Màu ngoại \| Trạng thái \| Chi nhánh

Highlight rows where values differ: bg-yellow-50 for differing cells

Row labels left-aligned, spec values centered in each column

Sticky \"Đặt Lịch Lái Thử\" button at bottom of each column

**PAGE E: BRANCH LISTING (/branches)**

Header section: \"Các Chi Nhánh BanXeOTo\" title + description

Google Maps (full width, 350px height) showing all branch pins

Branch cards grid (3 cols desktop, 2 tablet, 1 mobile):

Each card: Branch photo (aspect-video) \| Name \| Address \| Phone \|
Hours \| Vehicle count badge \| \"Xem Chi Tiết\" button

**PAGE F: BRANCH DETAIL (/branches/:id)**

Hero: Branch photo banner (300px height) + overlay with branch name

Info row: Address \| Phone \| Email \| Hours \| Working days

Active staff list (read-only): Avatar + Name + Role

Vehicle grid: All vehicles at this branch (same VehicleCard component)

Map embed: Branch location

**PAGE G: AUTH PAGES (Login, Register, Forgot/Reset Password)**

SHARED AUTH LAYOUT:

Left half (desktop): Full-height brand panel (bg-\[#1A3C6E\]) with logo,
tagline, car illustration/pattern

Right half: White panel with centered form (max-w-md mx-auto)

Mobile: Full-screen white with logo at top

LOGIN FORM (/login):

Title: \"Đăng Nhập\"

> Fields: Email hoặc SĐT \| Mật khẩu (toggle visibility)

Row: Checkbox \"Ghi nhớ đăng nhập\" \| Link \"Quên mật khẩu?\"

Button: \"Đăng Nhập\" (full-width primary)

Divider: \"hoặc đăng nhập bằng\"

Google OAuth button (with Google icon, white background, border)

Footer: \"Chưa có tài khoản? Đăng ký ngay\"

Error states: Red border + error message below email/password fields

REGISTER FORM (/register):

Title: \"Tạo Tài Khoản Mới\"

Fields (in order):

Họ và tên\* --- text, 2--100 chars

Email\* --- email, must be unique

Số điện thoại\* --- tel, 10 digits starting 0 or +84

Mật khẩu\* --- password with strength meter (weak/medium/strong
indicator bar)

Xác nhận mật khẩu\* --- must match

Ngày sinh --- date, optional, must be 18+

Giới tính --- radio: Nam \| Nữ \| Khác (optional)

Địa chỉ --- text, optional

Checkbox: \"Tôi đồng ý với Điều Khoản Dịch Vụ\" (required, link opens
Terms modal)

Button: \"Tạo Tài Khoản\" (full-width primary)

Google OAuth button

Footer: \"Đã có tài khoản? Đăng nhập\"

FORGOT PASSWORD (/forgot-password):

Email input + \"Gửi Link Đặt Lại\" button

Success state: Green check icon + \"Kiểm tra email của bạn\" message

RESET PASSWORD (/reset-password?token=\...):

New password + Confirm password

\"Cập Nhật Mật Khẩu\" button

**PAGE H: CONTACT (/contact) & ABOUT (/about)**

CONTACT PAGE:

Left: Contact form --- Họ tên \| Email \| SĐT \| Chủ đề \| Nội dung
(textarea) \| Submit button

Right: Branch contact info cards (phone, email, address per branch) +
Map

ABOUT PAGE:

Hero section: Company story heading + paragraph

Timeline: Company milestones (founding year through present)

Team section: Founder/manager photo cards

Branch photo gallery

**4. RESPONSIVE BEHAVIOR**

Mobile (\<640px):

-   Header: Logo + Hamburger only. Search bar hidden (move inside
    drawer).

-   Vehicle Listing: Filter panel becomes bottom drawer, triggered by
    \"Bộ Lọc\" button

-   Vehicle Grid: 1 column

-   Compare: Stack columns vertically

-   Vehicle Detail: Gallery full width, info panel below

-   Hero search: Stack filters vertically

Tablet (640--1024px):

-   Vehicle Grid: 2 columns

-   Filter panel: 200px narrow

-   Vehicle Detail: Gallery + panel side by side but 55/45 split

**5. COMPONENT EXPORTS**

Export as named components:

PublicLayout, PublicHeader, PublicFooter, FloatingChatWidget

VehicleCard, VehicleStatusBadge, VehicleQuickSpecs

FilterPanel, FilterAccordion, ColorSwatchFilter, PriceRangeSlider

CompareBar, CompareTable

BookTestDriveModal, DepositWizardModal

BranchCard, BranchMap

AuthLayout, LoginForm, RegisterForm, PasswordStrengthMeter

HeroSearchBar, FeaturedCarousel, BranchMapSection

**PROMPT SET 2 --- CUSTOMER DASHBOARD UI**

Screens: 11 \| Actors: Authenticated Customer \| Layout:
CustomerDashboardLayout

Paste this entire block into AI Stitch to generate all customer
dashboard screens:

**PROMPT SET 2 --- CUSTOMER DASHBOARD UI**

BanXeOTo Da Nang \| Authenticated Customer Portal

You are building the complete Customer Dashboard for \"BanXeOTo Da
Nang.\" All screens share a common dashboard layout. Build every screen
listed.

**1. SCREENS TO BUILD (all share CUSTOMER DASHBOARD LAYOUT)**

-   Customer Overview /dashboard

-   My Profile /dashboard/profile

-   Saved Vehicles /dashboard/saved

-   My Bookings /dashboard/bookings

-   My Deposits /dashboard/deposits

-   My Orders /dashboard/orders

-   Order Detail /dashboard/orders/:id

-   Transaction History /dashboard/transactions

-   My Chat /dashboard/chat

-   Notifications /dashboard/notifications

-   Change Password / Security /dashboard/security

**2. CUSTOMER DASHBOARD LAYOUT**

Create \<CustomerDashboardLayout\> wrapper used by ALL screens above.

TOPBAR (h-14, bg-white, border-b border-gray-200, sticky top-0 z-40):

Left: \"← Về trang chủ\" back link (text-sm text-gray-500)

Center: Page title (changes per page)

Right: Bell icon with unread count badge + Avatar dropdown (Profile \|
Đổi mật khẩu \| Đăng xuất)

SIDEBAR (w-56, bg-white, border-r border-gray-200, h-full sticky):

Top section: User avatar (64px circle) + Full name (font-semibold) +
Email (text-xs text-gray-500)

Navigation items (with Lucide icons):

-   \[LayoutDashboard\] Tổng Quan /dashboard (active: bg-blue-50
    text-\[#1A3C6E\] font-medium)

-   \[Heart\] Xe Đã Lưu /dashboard/saved

-   \[Calendar\] Lịch Lái Thử /dashboard/bookings \[badge: pending
    count\]

-   \[Shield\] Đặt Cọc /dashboard/deposits \[badge: active deposits\]

-   \[ShoppingBag\] Đơn Mua /dashboard/orders

-   \[CreditCard\] Lịch Sử Giao Dịch /dashboard/transactions

-   \[MessageCircle\] Chat /dashboard/chat \[badge: unread messages\]

-   \[Bell\] Thông Báo /dashboard/notifications \[badge: unread\]

-   \[Lock\] Bảo Mật /dashboard/security

Bottom: \"Đăng Xuất\" button (text-red-500, LogOut icon)

Mobile: Sidebar collapses --- access via hamburger in topbar, slides in
as overlay

MAIN CONTENT AREA:

Padding: p-6 (desktop), p-4 (mobile)

Breadcrumb: Home \> Dashboard \> \[Page Name\]

Page header: H1 + optional action button (right-aligned)

Content zone

**3. PAGE DEFINITIONS**

**PAGE A: CUSTOMER OVERVIEW (/dashboard)**

QUICK STATS CARDS (4-col grid, responsive 2-col tablet, 1-col mobile):

Card 1: \[Heart icon, orange\] \"Xe Đã Lưu\" --- Count number + \"xem
tất cả →\" link

Card 2: \[Calendar icon, blue\] \"Lịch Lái Thử\" --- Upcoming count +
\"X chờ xác nhận\" sub-label

Card 3: \[Shield icon, green\] \"Đặt Cọc\" --- Active deposits + \"Tổng:
X.XXX.XXX ₫\" sub-label

Card 4: \[ShoppingBag icon, purple\] \"Đơn Đã Mua\" --- Total order
count

UPCOMING BOOKINGS SECTION:

Title: \"Lịch Hẹn Sắp Tới\"

List of 3 nearest bookings (card per booking):

Thumbnail (60×45px) \| Vehicle name \| Branch \| Date+Time \| Status
badge \| \"Xem Chi Tiết\" link

Empty state: Calendar icon + \"Bạn chưa có lịch lái thử nào\" + \"Đặt
Lịch Ngay\" button

RECENTLY VIEWED VEHICLES:

Title: \"Xe Đã Xem Gần Đây\"

Grid 4 mini VehicleCard (compact version, no compare button)

CTA BANNER:

bg-gradient-to-r from-\[#1A3C6E\] to-blue-700, rounded-xl, p-6

Text: \"Chưa tìm được xe ưng ý?\" \| Button: \"Khám Phá Ngay\"
bg-\[#E8612A\]

**PAGE B: MY PROFILE (/dashboard/profile)**

Two sections side by side (desktop) or stacked (mobile):

LEFT --- Avatar & Quick Info:

Large avatar (120px circle) with camera icon overlay for upload

Display name (h2)

Email + SĐT (read-only labels)

\"Thành viên từ\" + joined date

Verification badge row: Email verified? \| Phone verified?

RIGHT --- Edit Form:

> Fields: Họ và tên \| SĐT \| Ngày sinh \| Giới tính (radio) \| Địa chỉ
> (textarea)

Save button: \"Lưu Thay Đổi\" (primary)

Toast on save: \"Thông tin cá nhân đã cập nhật\"

**PAGE C: SAVED VEHICLES (/dashboard/saved)**

Toolbar: Total count \"12 xe đã lưu\" \| Sort: \"Mới lưu nhất\" \|
\"Chia sẻ danh sách\" button

Grid view (same VehicleCard as public site) with additional:

-   Red filled heart (remove from saved)

-   Status badge prominently shown (vehicle may have sold)

-   Toast when vehicle status changes: \"Xe X vừa được đặt cọc\"

Empty state: Heart icon + \"Bạn chưa lưu xe nào\" + \"Khám Phá Xe\"
button

**PAGE D: MY BOOKINGS (/dashboard/bookings)**

Filter tabs: \"Tất Cả\" \| \"Chờ Xác Nhận\" \| \"Đã Xác Nhận\" \| \"Đã
Hủy\"

Booking list (card per booking):

Row layout: \[Vehicle thumbnail 80×60px\] \| \[Vehicle info column\] \|
\[Branch+DateTime column\] \| \[Status badge\] \| \[Actions\]

Vehicle info: Name (bold) \| Year \| Km

> Status badges:

\"Chờ Xác Nhận\" --- yellow

\"Đã Xác Nhận\" --- blue

\"Hoàn Thành\" --- green

\"Đã Hủy\" --- gray

> Actions: \"Xem Chi Tiết\" \| \"Hủy Lịch\" (only if status = Chờ Xác
> Nhận, shows Confirm Cancel modal)

CANCEL BOOKING MODAL:

Title: \"Xác Nhận Hủy Lịch\"

Body: \"Bạn có chắc muốn hủy lịch lái thử ngày \[Date\] cho xe
\[Name\]?\"

Buttons: \"Giữ Lịch\" (outline) \| \"Hủy Lịch\" (danger)

**PAGE E: MY DEPOSITS (/dashboard/deposits)**

Table columns: \[Vehicle thumbnail\] \| Tên xe \| Số Tiền Cọc \| Ngày
Đặt Cọc \| Hạn Hết \| Trạng Thái \| Hành Động

> Status options:

\"Chờ Xử Lý\" --- yellow badge

\"Đã Xác Nhận\" --- green badge + countdown timer \"Còn X ngày\"

\"Đã Hoàn Cọc\" --- gray badge

\"Chuyển Sang Đơn Mua\" --- purple badge + \"Xem Đơn Mua\" link

**PAGE F: MY ORDERS (/dashboard/orders)**

Table: Mã Đơn \| Xe \| Giá \| Ngày Tạo \| Trạng Thái \| Hành Động

Order statuses: Chờ Xác Nhận \| Đã Xác Nhận \| Đang Xử Lý \| Hoàn Thành
\| Đã Hủy

Order Detail Modal or Page (/dashboard/orders/:id):

Order summary card: Mã đơn \| Ngày tạo \| Nhân viên phụ trách \| Chi
nhánh

Vehicle detail section: Image + full specs

Payment breakdown: Giá xe \| Tiền cọc đã đặt \| Còn lại \| Phương thức

Order timeline: Created → Confirmed → Processing → Completed (step
indicator)

Download: \"Tải Hóa Đơn PDF\" button

**PAGE G: TRANSACTION HISTORY (/dashboard/transactions)**

Filters row: Type dropdown (Đặt cọc \| Mua xe \| Hoàn cọc \| Tất cả) \|
Date range (7 ngày \| 30 ngày \| 3 tháng \| Tùy chọn)

Export: \"Xuất PDF\" \| \"Xuất Excel\" buttons (right-aligned)

Table: Mã GD \| Ngày \| Mô Tả \| Loại \| Số Tiền \| Trạng Thái

Income/positive amounts: text-green-600 font-medium

Outgoing amounts: text-red-600 font-medium

**PAGE H: MY CHAT (/dashboard/chat)**

Two-panel layout:

LEFT PANEL (w-72 border-r):

Search conversations bar

Conversation list: Avatar \| Name (Staff or AI) \| Last message preview
\| Timestamp \| Unread badge

RIGHT PANEL (flex-1):

Chat header: Staff avatar + Name + Role + Online status

Messages area (scrollable):

-   User messages right-aligned (bg-blue-600 text-white rounded-l-2xl
    rounded-tr-2xl)

-   Staff/AI messages left-aligned (bg-gray-100 text-gray-900
    rounded-r-2xl rounded-tl-2xl)

-   Timestamps below each bubble

-   Vehicle reference cards (if staff shared a vehicle: mini card embed)

Input bar: Attachment icon \| Text input \| Send button

**PAGE I: NOTIFICATIONS (/dashboard/notifications)**

Filter: \"Tất Cả\" \| \"Chưa Đọc\" \| \"Lịch Hẹn\" \| \"Đặt Cọc\" \|
\"Giảm Giá\"

\"Đánh Dấu Tất Cả Đã Đọc\" button (right)

Notification list:

Each item: Icon (colored by type) \| Title (bold if unread) \| Body
preview \| Timestamp \| Unread dot

Unread items: bg-blue-50

Click: Mark as read, navigate to related screen

**PAGE J: SECURITY (/dashboard/security)**

Change Password form:

Current Password \| New Password (with strength meter) \| Confirm New
Password

\"Đổi Mật Khẩu\" button

Active Sessions section:

List devices with Last Active time + \"Đăng Xuất Thiết Bị Này\" button

Two-Factor Authentication section (optional, toggle enable/disable)

**PROMPT SET 3 --- SALES STAFF DASHBOARD UI**

Screens: 10 \| Actors: Sales Staff \| Layout: StaffDashboardLayout

Paste this entire block into AI Stitch to generate all sales staff
dashboard screens:

**PROMPT SET 3 --- SALES STAFF DASHBOARD UI**

BanXeOTo Da Nang \| Internal Staff Operations Portal

You are building the complete Sales Staff Dashboard for \"BanXeOTo Da
Nang.\" All screens below share the STAFF DASHBOARD LAYOUT.

**1. SCREENS TO BUILD**

-   Staff Overview /staff/dashboard

-   My Schedule /staff/schedule

-   Test Drive Bookings /staff/bookings

-   Consulting Requests /staff/consultations

-   Branch Inventory /staff/inventory

-   Create Order /staff/orders/new

-   Order List /staff/orders

-   Create Deposit /staff/deposits/new

-   Customer Chat /staff/chat

-   Transfer Request /staff/transfer-requests

**2. STAFF DASHBOARD LAYOUT**

Create \<StaffDashboardLayout\> used by ALL screens above.

TOPBAR (h-14, bg-\[#1A3C6E\], text-white, sticky top-0 z-40):

Left: Logo (white version) + \"\| Chi Nhánh: \[Branch Name\]\" (text-sm
text-white/70)

Right: Bell icon (white) with unread badge + Staff avatar with dropdown:

-   Họ tên + \"Nhân Viên Bán Hàng\" role label

-   \"Đổi Mật Khẩu\" \| \"Đăng Xuất\"

SIDEBAR (w-56, bg-gray-900, text-gray-300, h-full):

Logo area at top (smaller)

Navigation items (with icons, active = bg-gray-700 text-white):

-   \[LayoutDashboard\] Tổng Quan /staff/dashboard

-   \[Calendar\] Lịch Làm Việc /staff/schedule

-   \[CalendarCheck\] Lịch Lái Thử /staff/bookings \[unread badge\]

-   \[MessageSquare\] Yêu Cầu Tư Vấn /staff/consultations \[pending
    badge\]

-   \[Package\] Tồn Kho /staff/inventory

-   \[PlusCircle\] Tạo Đơn Mua /staff/orders/new

-   \[ClipboardList\] Danh Sách Đơn /staff/orders

-   \[Banknote\] Tạo Đặt Cọc /staff/deposits/new

-   \[MessageCircle\] Chat Khách Hàng /staff/chat \[unread badge\]

-   \[ArrowLeftRight\] Yêu Cầu Điều Chuyển /staff/transfer-requests

Sidebar footer: Today\'s date + \"Phiên làm việc: 8h:00\" clock

MAIN CONTENT:

bg-gray-50, p-6, flex-1

**3. PAGE DEFINITIONS**

**PAGE A: STAFF OVERVIEW (/staff/dashboard)**

KPI CARDS row (4 cards):

\"Lịch Hẹn Hôm Nay\" --- \[Calendar icon, blue\] count + \"cần xử lý\"

\"Tư Vấn Chờ Xử Lý\" --- \[MessageSquare icon, orange\] count + \"yêu
cầu mới\"

\"Đơn Hàng Tuần Này\" --- \[ShoppingBag icon, green\] count

\"Xe Còn Khả Dụng\" --- \[Package icon, gray\] count at my branch

TODAY\'S SCHEDULE TIMELINE:

Vertical timeline 8:00--18:00, each hour is a slot

Events: Card with \[Customer avatar\] \| Customer name \| Type (Lái Thử
/ Tư Vấn) \| Vehicle name \| Status badge

Action chips on each event: \"Xác Nhận\" (green) \| \"Đổi Lịch\" (blue)
\| \"Hủy\" (red)

Empty slots: Dashed border \"Trống\"

Current time indicator: red line across timeline

PENDING TASKS LIST:

Title: \"Yêu Cầu Chờ Xử Lý\"

Each task card: Priority badge (Cao/Trung Bình/Thấp in red/yellow/gray)
\| Customer name \| Request summary \| \"X phút trước\" \| \"Xử Lý
Ngay\" button

**PAGE B: MY SCHEDULE (/staff/schedule)**

CALENDAR HEADER: Month/Year nav \| \"Hôm Nay\" button \| Week/Month view
toggle

WEEKLY CALENDAR VIEW:

7-column grid (Mon--Sun) + time rows (8:00--18:00 in 30-min slots)

Events as colored blocks (blue=test drive, orange=consultation)

Click event: Side panel opens with event details + action buttons

UPCOMING EVENTS LIST (right sidebar 280px):

Today\'s events in order

Each: Time \| Vehicle \| Customer \| Type \| Status

**PAGE C: TEST DRIVE BOOKINGS (/staff/bookings)**

Toggle: Calendar View \| List View

LIST VIEW:

Tabs: \"Tất Cả\" \| \"Chờ Xác Nhận\" \| \"Đã Xác Nhận\" \| \"Đã Hủy\"

Each row: \[Vehicle thumb\] \| Vehicle name \| Customer name + SĐT \|
Date/Time \| Status badge \| Actions

> Actions: \"Xác Nhận\" (green button) \| \"Đổi Lịch\" (blue) \| \"Hủy\"
> (red)

RESCHEDULE MODAL:

Original booking info (read-only)

New date picker + Time slot selector (shows availability)

Reason/note textarea (required)

Notify customer checkbox (pre-checked)

\"Cập Nhật Lịch\" button

**PAGE D: CONSULTING REQUESTS (/staff/consultations)**

Two-panel layout:

LEFT --- Request List:

Filter: \"Chưa Phản Hồi\" \| \"Đang Xử Lý\" \| \"Đã Giải Quyết\"

Each item: Customer avatar \| Name \| Request preview \| Time \|
Priority badge \| Unread indicator

RIGHT --- Request Detail & Response:

Customer info section: Avatar \| Name \| SĐT \| Vehicles they viewed

Original request message (full text, bg-gray-50 p-4 rounded-lg)

Previous conversation history (if any)

Response textarea: \"Nhập phản hồi\...\" + \"Gửi Phản Hồi\" button

Quick replies: \"Đã nhận yêu cầu, sẽ liên hệ sớm\" \| \"Xe hiện đã được
đặt cọc\" \| \"Vui lòng đến showroom để tư vấn trực tiếp\"

Mark as resolved: \"Đánh Dấu Đã Giải Quyết\" (outline button)

**PAGE E: BRANCH INVENTORY (/staff/inventory)**

Tab filter: \"Tất Cả\" \| \"Còn Hàng\" \| \"Đã Đặt Cọc\" \| \"Đã Bán\"

Search: Biển số hoặc tên xe (debounced 300ms)

Inventory table:

> Cols: \[Img 60×40\] \| Tên xe \| Biển số \| Năm SX \| Giá \| Trạng
> Thái badge \| Cập Nhật Cuối

Row click: Expand to show customer who deposited (if status=Reserved)

\"Xem tồn kho chi nhánh khác\" toggle section:

Dropdown: Select branch

Read-only inventory table for that branch

\"Yêu Cầu Điều Chuyển\" button on each row

**PAGE F: CREATE ORDER (/staff/orders/new)**

Multi-step form wizard with step indicator:

Step 1 --- Chọn Xe:

Search and select vehicle from branch inventory (Available only)

Vehicle mini card shown when selected

Step 2 --- Thông Tin Khách Hàng:

Search existing customer by SĐT/email OR create new customer

Auto-fill form if existing: Họ tên \| Email \| SĐT \| CMND/CCCD \| Địa
chỉ

Step 3 --- Chi Tiết Đơn Hàng:

Giá xe (auto-fill) \| Tiền cọc đã đặt (if exists, auto-fill) \| Còn lại
phải thanh toán

Phương thức thanh toán: Tiền mặt \| Chuyển khoản \| VNPay \| MoMo

Ngày dự kiến hoàn tất giao dịch

Ghi chú nội bộ (textarea)

Step 4 --- Xác Nhận:

Summary of all steps (readonly)

\"Tạo Đơn Hàng\" (primary) \| \"Quay Lại\" (outline)

On success: Toast + Redirect to order list

**PAGE G: ORDER LIST (/staff/orders)**

Toolbar: Search by customer name/order code \| Status filter \| Date
range

Table: Mã Đơn \| Khách Hàng \| Xe \| Giá \| Ngày Tạo \| Trạng Thái \|
Hành Động

Action: \"Xem Chi Tiết\" \| \"Xác Nhận Bán\" (if status=Confirmed)

CONFIRM SELL MODAL:

Title: \"Xác Nhận Bán Xe\"

Body: \"Xác nhận xe \[Tên xe\] đã bán thành công? Trạng thái sẽ đổi
thành Đã Bán.\"

Buttons: \"Hủy\" \| \"Xác Nhận Bán\" (danger)

**PAGE H: CREATE DEPOSIT (/staff/deposits/new)**

Form fields:

Select Vehicle: Search available vehicles + mini vehicle card display

Customer: Search or new (same as order form)

Số tiền đặt cọc: number input (min 10,000,000, format VND)

Ngày đặt cọc: date (default today)

Hạn hết cọc: date (default +7 days from deposit date)

Phương thức: select (Tiền mặt \| Chuyển khoản)

Ghi chú: textarea

\"Tạo Đặt Cọc\" button → updates vehicle status to Reserved

**PAGE I: CUSTOMER CHAT (/staff/chat)**

Two-panel chat (same structure as Customer chat page):

Left: Conversation list with customer name, last message, unread count,
vehicle context label

Right: Chat window + customer info panel (vehicle they inquired about,
booking status)

\"Giao cho đồng nghiệp\" button to transfer conversation

AI handoff indicator: \"AI đang phục vụ --- Tiếp nhận cuộc hội thoại\"
button

**PAGE J: TRANSFER REQUEST (/staff/transfer-requests)**

My requests list: Vehicle \| From (my branch) \| To branch \| Date \|
Status

\"Tạo Yêu Cầu Mới\" button → Form: Select vehicle \| Select target
branch \| Reason (required) \| Notes

> Status tracking: Chờ Duyệt (yellow) \| Đã Duyệt (green) \| Từ Chối
> (red)

**PROMPT SET 4 --- BRANCH MANAGER DASHBOARD UI**

Screens: 10 \| Actors: Branch Manager \| Layout: ManagerDashboardLayout

Paste this entire block into AI Stitch to generate all branch manager
dashboard screens:

**PROMPT SET 4 --- BRANCH MANAGER DASHBOARD UI**

BanXeOTo Da Nang \| Branch Operations Management Portal

You are building the complete Branch Manager Dashboard for \"BanXeOTo Da
Nang.\" All screens share the MANAGER DASHBOARD LAYOUT.

**1. SCREENS TO BUILD**

-   Manager Overview /manager/dashboard

-   Vehicle Management /manager/vehicles

-   Add Vehicle /manager/vehicles/new

-   Edit Vehicle /manager/vehicles/:id/edit

-   Staff Management /manager/staff

-   Add Staff Account /manager/staff/new

-   Appointment Overview /manager/appointments

-   Transfer Requests /manager/transfers

-   Branch Reports /manager/reports

-   Branch Settings /manager/settings

**2. MANAGER DASHBOARD LAYOUT**

Create \<ManagerDashboardLayout\> used by ALL screens above.

TOPBAR (h-14, bg-white, border-b, sticky top-0 z-40):

Left: \"\[Branch Name\] Dashboard\" (font-semibold text-gray-900) +
Branch badge

Right: Notification bell \| \"Xem trang công khai\" link \| Manager
avatar dropdown

Dropdown: Profile \| Đổi Mật Khẩu \| Đăng Xuất

SIDEBAR (w-60, bg-\[#1A3C6E\], text-white):

Branch logo/name at top

Navigation items (active = bg-white/10 rounded-lg):

-   \[LayoutDashboard\] Tổng Quan /manager/dashboard

-   \[Car\] Quản Lý Xe /manager/vehicles

-   \[Users\] Nhân Viên /manager/staff

-   \[CalendarDays\] Lịch Hẹn Tổng /manager/appointments

-   \[ArrowLeftRight\] Điều Chuyển Xe /manager/transfers \[pending
    badge\]

-   \[BarChart2\] Báo Cáo /manager/reports

-   \[Settings\] Cài Đặt Chi Nhánh /manager/settings

Bottom: \"← Trang Chủ\" link

CONTENT AREA: bg-gray-50, p-6, flex-1

**3. PAGE DEFINITIONS**

**PAGE A: MANAGER OVERVIEW (/manager/dashboard)**

KPI SUMMARY (5 cards, 3-2 grid layout):

Row 1:

\"Doanh Số Tháng Này\" --- Revenue number + sparkline mini chart + \"vs
tháng trước: +12%\"

\"Xe Đã Bán\" --- Count + \"▲ X xe so với tháng trước\"

\"Tổng Tồn Kho\" --- Count + donut mini chart (Available/Reserved/Sold
breakdown)

Row 2:

\"Lịch Hẹn Tuần Này\" --- Total + \"X chờ xác nhận\"

\"Nhân Viên Hiệu Quả\" --- Top 3 staff names with mini ranking badges
(🥇🥈🥉)

CHARTS SECTION (2 col):

Left: \"Doanh Số Theo Tháng\" --- Line chart (12 months) using Recharts

Right: \"Xe Bán Theo Hãng\" --- Horizontal bar chart (Toyota, Honda,
Mazda, etc.)

RECENT ACTIVITY FEED:

Timeline list:

-   \[icon\] Hành động --- Actor --- Vehicle/Customer --- Time

Icons: CarIcon=add vehicle, BadgeCheck=sold, CalendarCheck=booking
confirmed

Max 10 items, \"Xem tất cả\" link

**PAGE B: VEHICLE MANAGEMENT (/manager/vehicles)**

TOOLBAR:

Left: \"+ Thêm Xe Mới\" (primary button with PlusCircle icon)

Center: Search input (by name, plate number)

Right: Filter dropdowns (Trạng Thái \| Hãng Xe \| Năm SX) \| Export
Excel/PDF

VEHICLE TABLE (full-width):

Header: Select All checkbox

Columns: ☐ \| \[Img 60×40\] \| Tên Xe (link) \| Biển Số \| Năm SX \| Giá
\| Trạng Thái \| Nhân Viên Phụ Trách \| Ngày Cập Nhật \| Hành Động

> Status column: Inline dropdown to change status (Available → Reserved
> → Sold)

Action column: \"Sửa\" (Edit icon) \| \"Xóa\" (Trash icon, opens confirm
modal)

Bulk actions bar (appears when rows selected):

\"X xe đã chọn\" \| \"Đổi Trạng Thái Hàng Loạt\" \| \"Xóa Hàng Loạt\"
(danger)

Pagination: 20/page, page numbers

**PAGE C: ADD VEHICLE (/manager/vehicles/new)**

Two-column form layout (desktop):

Left column --- Basic Info:

Hãng Xe (Brand): select (load from catalog) --- REQUIRED

Dòng Xe (Model): select (dependent on Brand) --- REQUIRED

Phiên Bản/Trim: text --- e.g., \"2.5Q\", \"1.8E\"

Năm Sản Xuất: number/select 2000--current --- REQUIRED

Biển Số: text (format: 43A-123.45) --- optional

Số Km Đã Đi: number (0--999,999) --- REQUIRED

Màu Ngoại Thất: select + color swatch --- REQUIRED

Màu Nội Thất: select --- REQUIRED

Nhiên Liệu: select (Xăng/Dầu/Hybrid/Điện) --- REQUIRED

Hộp Số: select (Tự Động/Sàn) --- REQUIRED

Kiểu Xe: select (Sedan/SUV/Hatchback/Pickup/Van) --- REQUIRED

Dung Tích Động Cơ: number (e.g., 2.5) --- optional

Số Chỗ Ngồi: select 2/4/5/7/8/9 --- optional

Right column --- Pricing & Status:

Giá Niêm Yết: number (VND format) --- REQUIRED

Trạng Thái: select (Available/Reserved/Sold) --- REQUIRED

Nhân Viên Phụ Trách: select (staff at this branch)

Image Upload section:

Drag-and-drop zone: \"Kéo thả ảnh hoặc click để chọn\"

Support: JPG/PNG/WEBP, max 5MB each, up to 15 images

Preview grid: Thumbnail + X remove button, drag to reorder

Progress bar per file during upload

Full-width bottom --- Mô Tả:

Rich textarea: Vehicle description, service history, condition notes
(max 2000 chars)

Form actions: \"Lưu Nháp\" (outline) \| \"Đăng Xe\" (primary) \| \"Hủy\"
(ghost)

**PAGE D: EDIT VEHICLE --- Same form pre-filled, \"Cập Nhật Xe\" submit
button, breadcrumb shows vehicle name**

**PAGE E: STAFF MANAGEMENT (/manager/staff)**

TOOLBAR: Search by name/email \| Status filter (Active/Inactive) \| \"+
Thêm Nhân Viên\" button

STAFF TABLE:

> Cols: \[Avatar 36px\] \| Họ Tên \| Email \| SĐT \| Ngày Bắt Đầu \| Đơn
> Đã Tạo \| Trạng Thái \| Hành Động
>
> Status badge: Active (green) \| Inactive (gray)

Action: \"Chi Tiết\" \| \"Đặt Lại Mật Khẩu\" \| \"Vô Hiệu Hóa\"

STAFF DETAIL SIDE PANEL (slide-in from right, 380px):

Opens when clicking staff name

Sections:

Avatar + Name + Role + Status + Contact info

Performance this month: Đơn hàng \| Lịch hẹn \| Doanh số (bar)

Recent activity: last 5 actions with timestamps

\"Phân Công Công Việc\" button \| \"Xem Toàn Bộ Hoạt Động\" link

ADD STAFF FORM (/manager/staff/new):

> Fields: Họ và tên\* \| Email\* \| SĐT\* \| Vai Trò (Sales Staff only
> for Manager) \| Ngày Bắt Đầu \| Mật Khẩu Tạm Thời (auto-generate
> toggle) \| Ghi Chú

\"Tạo Tài Khoản\" + auto-send welcome email checkbox

**PAGE F: APPOINTMENT OVERVIEW (/manager/appointments)**

Date range filter + Staff filter (all staff or specific one) + Type
filter (Lái Thử/Tư Vấn)

CALENDAR VIEW (monthly, large):

Day cells show event count bubbles

Click day: Expand to list view for that day

LIST VIEW:

Grouped by date

Each appointment: Customer \| Vehicle \| Staff \| Type \| Time \| Status
\| Actions (Confirm/Reschedule/Cancel)

Summary stats row: \"Tuần này: X lái thử + Y tư vấn \| Tỷ lệ xác nhận:
Z%\"

**PAGE G: TRANSFER REQUESTS (/manager/transfers)**

My Outgoing Requests:

Table: Xe \| Từ (my branch) \| Đến chi nhánh \| Ngày yêu cầu \| Trạng
Thái \| Ghi Chú Admin

> Status: Chờ Duyệt (yellow) \| Đã Duyệt (green) \| Từ Chối (red with
> reason tooltip)

\"+ Tạo Yêu Cầu Mới\" button

Incoming Requests to My Branch:

Table: Xe muốn điều đến \| Từ chi nhánh \| Ngày yêu cầu \| Trạng Thái

(Manager can see but only Admin can approve)

**PAGE H: BRANCH REPORTS (/manager/reports)**

DATE RANGE SELECTOR (prominent, top of page):

Quick options: \"Hôm Nay\" \| \"7 Ngày\" \| \"30 Ngày\" \| \"Tùy Chọn\"
(opens date range picker)

Applied range display: \"01/01/2025 --- 31/01/2025\"

KPI ROW: Doanh Thu \| Số Xe Bán \| Giá TB Mỗi Xe \| Số Khách Mới (4
cards with trend arrows)

CHARTS:

\"Doanh Số Theo Thời Gian\" --- Line/area chart, Recharts, responsive

\"Xe Bán Theo Hãng\" --- Horizontal bar chart

TABLES:

Top Selling Vehicles: Rank \| Xe \| Hãng \| Giá \| Ngày Bán

Staff Performance: Avatar \| Tên \| Số Xe Bán \| Doanh Số \| Số Lịch Hẹn
\| Rating bar

Export row: \"Xuất PDF\" \| \"Xuất Excel\" (right-aligned buttons)

**PAGE I: BRANCH SETTINGS (/manager/settings)**

Sections (tabbed or single scroll):

Branch Info:

Ten chi nhánh \| Địa chỉ \| Quận/Huyện \| SĐT \| Email \| Tọa độ GPS
(Lat/Lng with map preview)

\"Cập Nhật\" button

Working Hours:

Grid: Days of week × Open/Close time range + checkbox \"Mở cửa\"

Branch Photos:

Upload grid, drag-to-reorder, delete

\"Lưu Tất Cả Thay Đổi\" (primary, sticky bottom bar)

**PROMPT SET 5 --- SYSTEM ADMIN DASHBOARD UI**

Screens: 12 \| Actors: System Admin \| Layout: AdminDashboardLayout

Paste this entire block into AI Stitch to generate all system admin
dashboard screens:

**PROMPT SET 5 --- SYSTEM ADMIN DASHBOARD UI**

BanXeOTo Da Nang \| System Administration Portal

You are building the complete System Admin Dashboard for \"BanXeOTo Da
Nang.\" All screens share the ADMIN DASHBOARD LAYOUT.

**1. SCREENS TO BUILD**

-   Admin Overview /admin/dashboard

-   User Management /admin/users

-   Role & Permissions /admin/roles

-   Branch Management /admin/branches

-   Add Branch /admin/branches/new

-   Vehicle Catalog (Master Data) /admin/catalog

-   Transfer Approval /admin/transfers

-   CMS Management /admin/cms

-   System Config /admin/config

-   System Reports /admin/reports

-   Audit Logs /admin/logs

-   Notification Config /admin/notifications

**2. ADMIN DASHBOARD LAYOUT**

Create \<AdminDashboardLayout\> used by ALL screens above.

TOPBAR (h-14, bg-\[#111827\] text-white, sticky top-0 z-50):

Left: \"BanXeOTo Admin\" in white + version tag \"v1.0\"

Right: Search all (Cmd+K shortcut hint) \| Bell \| Admin avatar with
dropdown

Dropdown: \"System Admin\" role badge \| Profile \| Settings \| Đăng
Xuất

SIDEBAR (w-64, bg-\[#1F2937\] text-gray-300):

Section: TỔNG QUAN

-   \[LayoutDashboard\] Dashboard /admin/dashboard

Section: NGƯỜI DÙNG

-   \[Users\] Quản Lý Users /admin/users

-   \[Shield\] Vai Trò & Quyền /admin/roles

Section: CHI NHÁNH & XE

-   \[Building2\] Chi Nhánh /admin/branches

-   \[BookOpen\] Danh Mục Xe /admin/catalog

-   \[ArrowLeftRight\] Duyệt Điều Chuyển /admin/transfers \[pending
    badge red\]

Section: NỘI DUNG

-   \[FileText\] Quản Lý CMS /admin/cms

Section: HỆ THỐNG

-   \[Settings2\] Cấu Hình /admin/config

-   \[BarChart3\] Báo Cáo Tổng /admin/reports

-   \[ScrollText\] Audit Logs /admin/logs

-   \[Bell\] Thông Báo Config /admin/notifications

Sidebar footer: Admin email + \"Đăng Xuất\" (LogOut icon, text-red-400)

Active item: bg-gray-700 text-white rounded-lg

**3. PAGE DEFINITIONS**

**PAGE A: ADMIN OVERVIEW (/admin/dashboard)**

SYSTEM KPI CARDS (4 cards, 2×2 grid then 4 across on xl):

\"Tổng Doanh Thu Tháng\" --- revenue with ±% vs last month

\"Tổng Xe Đã Bán / Tổng Tồn Kho\" --- ratio display

\"Khách Hàng Mới\" --- new registrations this month

\"Chi Nhánh Đang Hoạt Động\" --- active branch count

CHARTS ROW:

\"Doanh Số Theo Chi Nhánh\" --- Grouped bar chart (Recharts) comparing
all branches by month

\"Phân Bổ Xe Theo Trạng Thái\" --- Pie/donut chart
(Available/Reserved/Sold)

BRANCH PERFORMANCE MAP:

Da Nang city map with branch pins

Pin color = performance level (green=high, yellow=mid, red=low)

Hover pin: popup with branch name + monthly revenue

RECENT ACTIVITY FEED (right panel):

Real-time feed:

-   \[User+\] Tài khoản mới đăng ký \| CustomerName \| X phút trước

-   \[Car+\] Xe mới thêm \| VehicleName \| BranchName \| X phút trước

-   \[BadgeCheck\] Xe bán thành công \| VehicleName \| StaffName \| X
    phút trước

-   \[ArrowLeftRight\] Yêu cầu điều chuyển \| From→To \| X phút trước

\"Xem tất cả logs →\" link

ALERTS SECTION:

Yellow warning cards for:

\"3 xe sắp hết hạn đặt cọc (trong 24h)\"

\"2 yêu cầu điều chuyển chờ duyệt\"

\"1 tài khoản bị khóa do đăng nhập sai nhiều lần\"

**PAGE B: USER MANAGEMENT (/admin/users)**

TABS: \"Tất Cả\" \| \"Khách Hàng\" \| \"Nhân Viên Bán Hàng\" \| \"Quản
Lý Chi Nhánh\"

TOOLBAR:

Search: by name/email/phone

Filters: Role \| Branch \| Status (Active/Locked) \| Joined date range

\"+ Tạo Tài Khoản\" button (opens modal)

USER TABLE:

> Cols: \[Avatar 36px\] \| Họ Tên \| Email \| SĐT \| Vai Trò (badge) \|
> Chi Nhánh \| Ngày Tạo \| Trạng Thái \| Hành Động

Action dropdown per row:

\"Chỉnh Sửa\" --- opens edit modal

\"Đổi Mật Khẩu\" --- opens reset modal

\"Khóa Tài Khoản\" (if active) → Confirm Lock Modal

\"Mở Khóa\" (if locked) → immediate

\"Xóa Tài Khoản\" → Confirm Delete Modal (danger)

CREATE USER MODAL:

> Fields: Họ tên \| Email \| SĐT \| Vai Trò (select all roles) \| Chi
> Nhánh (if role=Staff/Manager) \| Mật khẩu tạm thời (auto-gen) \| Gửi
> email chào mừng (checkbox)

**PAGE C: ROLE & PERMISSIONS (/admin/roles)**

Left panel: Role list (Guest \| Customer \| Sales Staff \| Branch
Manager \| Admin) with user count

Right panel: Permission matrix for selected role

Matrix: Feature module rows × Permission columns
(View/Create/Edit/Delete/Approve)

Toggles (checkbox or switch) per cell

\"Lưu Thay Đổi\" button

Warning: \"Thay đổi quyền ảnh hưởng X người dùng\"

**PAGE D: BRANCH MANAGEMENT (/admin/branches)**

VIEW TOGGLE: Grid \| List

BRANCH GRID CARDS:

Branch photo (aspect-video) \| Name (h3) \| Address \| SĐT \| Quận

Stats row: X xe \| Y nhân viên

> Status badge: Đang Hoạt Động (green) \| Tạm Đóng (gray)
>
> Actions: \"Quản Lý\" \| \"Chỉnh Sửa\" \| \"Xóa\"

BRANCH LIST TABLE:

> Cols: Tên \| Địa Chỉ \| SĐT \| Số Xe \| Số Nhân Viên \| Trạng Thái \|
> Hành Động

\"+ Thêm Chi Nhánh Mới\" button → /admin/branches/new

ADD BRANCH FORM (/admin/branches/new):

> Fields:

Tên Chi Nhánh\*: text, 5-100 chars, unique

Địa Chỉ\*: text

Quận/Huyện\*: select (Hải Châu/Thanh Khê/Sơn Trà/Ngũ Hành Sơn/Liên
Chiểu/Cẩm Lệ/Hòa Vang)

Số Điện Thoại\*: tel

Email Chi Nhánh: email (optional)

Giờ Mở Cửa\*: time range picker

Ngày Làm Việc\*: multi-checkbox

Tọa Độ GPS Lat\*: number + \"Lấy từ Google Maps\" helper

Tọa Độ GPS Lng\*: number

Mô Tả: textarea (optional)

Ảnh Chi Nhánh: multi-upload (JPG/PNG, max 5MB, tối đa 5 ảnh)

Submit: \"Tạo Chi Nhánh\" (primary) \| \"Hủy\" (outline)

**PAGE E: VEHICLE CATALOG (/admin/catalog)**

TABS: \"Hãng Xe\" \| \"Dòng Xe\" \| \"Loại Nhiên Liệu\" \| \"Hộp Số\" \|
\"Màu Xe\"

Each tab has:

\"+ Thêm Mới\" button

Search input

Simple table: Name \| Slug \| Số Lượng Xe \| Trạng Thái
(Active/Inactive) \| Hành Động

Inline edit: click Name → becomes editable input (click ✓ to save, ✗ to
cancel)

Toggle status switch per row

Delete (with confirm if 0 vehicles using it, blocked if in use)

HÃNG XE tab extra: Logo upload per brand

**PAGE F: TRANSFER APPROVAL (/admin/transfers)**

FILTER tabs: \"Chờ Duyệt\" \[badge count\] \| \"Đã Duyệt\" \| \"Từ
Chối\"

TABLE:

> Cols: Mã YC \| Xe \| Từ Chi Nhánh \| Đến Chi Nhánh \| Người Yêu Cầu \|
> Ngày Yêu Cầu \| Trạng Thái \| Ghi Chú \| Hành Động
>
> Actions (for Chờ Duyệt rows):

\"Duyệt\" (green) → Confirm Transfer Approval Modal

\"Từ Chối\" (red) → Rejection Modal (requires reason textarea)

Confirm Approval Modal:

\"Duyệt điều chuyển xe \[Tên xe\] từ \[CN A\] sang \[CN B\]?\"

\"Hủy\" \| \"Xác Nhận Duyệt\" (primary)

Rejection Modal:

\"Lý do từ chối:\" textarea (required)

\"Hủy\" \| \"Từ Chối\" (danger)

**PAGE G: CMS MANAGEMENT (/admin/cms)**

TABS: \"Banner Trang Chủ\" \| \"Bài Viết\" \| \"Trang Tĩnh\"

BANNER TAB:

Drag-and-drop ordered list of banners

Each banner: Preview image (200×80px) \| Title \| Link \| Status toggle
\| Edit/Delete

\"+ Thêm Banner\" → upload image + title + link + CTA text

BÀI VIẾT (Blog/News):

Table: Title \| Category \| Author \| Published Date \| Status \|
Actions

> Status: Draft \| Published \| Archived

\"Tạo Bài Viết Mới\" → Rich text editor (title, content with WYSIWYG,
featured image, category, publish date)

TRANG TĨNH:

List: About Us \| Terms of Service \| Privacy Policy

Click → WYSIWYG rich text editor for that page

**PAGE H: SYSTEM CONFIG (/admin/config)**

TABS: \"Thanh Toán\" \| \"Thông Báo\" \| \"Tổng Quát\"

PAYMENT CONFIG:

VNPay: merchant code, hash secret (masked), enable toggle

MoMo: partner code, access key (masked), enable toggle

Minimum deposit amount: number input (VND)

Deposit hold duration: number + \"ngày\" (days)

NOTIFICATION CONFIG:

Email SMTP: Host, Port, Username, Password (masked), SSL toggle, \"Test
kết nối\" button

SMS Gateway: Provider select (ESMS/SpeedSMS) \| API Key (masked) \|
\"Test SMS\" button

GENERAL CONFIG:

Site name \| Hotline \| Support email \| Default language \| Timezone

\"Lưu Tất Cả Cài Đặt\" (primary, sticky bottom)

**PAGE I: SYSTEM REPORTS (/admin/reports)**

FILTER ROW:

Branch: \"Tất Cả Chi Nhánh\" or specific branch selector

Date range: same quick options as Manager reports

SYSTEM KPI ROW (5 cards): Tổng Doanh Thu \| Tổng Xe Bán \| Giá Trung
Bình Mỗi Xe \| Số Khách Mới \| Tỷ Lệ Chuyển Đổi

BRANCH COMPARISON CHART:

Grouped bar chart: Compare all branches across months (Recharts)

SALES FUNNEL CHART:

Funnel: Lượt Xem Xe → Đặt Lịch → Đặt Cọc → Mua Xe (with conversion
rates)

TABLES:

Branch performance ranking

Top 10 selling vehicles across system

Export: \"Xuất Báo Cáo Tổng PDF\" \| \"Xuất Excel\" (prominent buttons)

**PAGE J: AUDIT LOGS (/admin/logs)**

FILTERS: Actor (User/Staff/Manager/Admin/System) \| Action type \| Date
range \| Keyword search

Table (read-only):

> Cols: Thời Gian \| Người Thực Hiện \| Vai Trò \| Hành Động \| Đối
> Tượng \| IP Address \| Chi Tiết

\"Chi Tiết\" column: expandable row showing full JSON payload (monospace
font)

Export logs: CSV

**PAGE K: NOTIFICATION CONFIG (/admin/notifications)**

Tabs: Email Templates \| SMS Templates

EMAIL TEMPLATES tab:

List of template types:

Xác Thực Đăng Ký \| Xác Nhận Lịch Lái Thử \| Nhắc Lịch \| Xác Nhận Đặt
Cọc \| Giảm Giá \| Xác Nhận Đơn Mua \| Yêu Cầu Reset Mật Khẩu

Each template editor:

Preview tab + Edit tab

Edit: Subject line input + HTML email body (rich text/code editor)

Variables reference: {{customer_name}}, {{vehicle_name}},
{{booking_date}}, etc.

\"Gửi Test Email\" button

\"Lưu Template\" button

SMS TEMPLATES tab: Same structure, plain text only, 160-char counter

**APPENDIX --- Reusable Component Registry**

The following components must be created as shared, reusable modules and
imported across all layout groups:

**Atomic Components (src/components/ui/)**

  -------------------------------------------------------------------------------------
  **Component**      **Props / Description**                         **Used By**
  ------------------ ----------------------------------------------- ------------------
  Button             variant:                                        All layouts
                     primary\|accent\|outline\|danger\|ghost \|      
                     size: sm\|md\|lg \| loading: bool               

  Badge              variant:                                        All layouts
                     available\|reserved\|sold\|pending\|confirmed   
                     \| text: string                                 

  Input              label, placeholder, error, helpText, type,      All forms
                     required                                        

  Select             options: {value, label}\[\] \| searchable: bool All forms
                     \| multi: bool                                  

  Modal              isOpen, onClose, title, children, footer        All layouts

  Toast              type: success\|error\|warning\|info \| message  All layouts
                     \| autoDismiss                                  

  Spinner            size: sm\|md\|lg \| color: string               All layouts

  EmptyState         icon, title, description, actionButton          All listing pages

  SkeletonCard       variant: vehicle\|table-row\|stats-card         Loading states

  DataTable          columns, data, pagination, onSort, selectable   All dashboards

  Pagination         currentPage, totalPages, onPageChange,          All listing pages
                     itemsPerPage                                    

  DateRangePicker    startDate, endDate, onChange, presets           Reports, filters

  ConfirmModal       title, message, confirmText, confirmVariant,    Delete/action
                     onConfirm                                       confirms

  FileUpload         multiple, maxSize, accept, onUpload,            Vehicle/branch
                     showProgress                                    forms

  RichTextEditor     value, onChange, placeholder, maxLength         CMS, descriptions

  ColorSwatch        colors: {name, hex}\[\] \| selected \| onChange Vehicle
                                                                     filters/forms
  -------------------------------------------------------------------------------------

**Domain Components (src/components/domain/)**

-   VehicleCard --- Full card with image, badge, heart, compare, price,
    specs, CTA buttons

-   VehicleCardMini --- Compact version for dashboard recently viewed

-   VehicleStatusBadge --- Standalone badge: Còn Hàng / Đã Đặt Cọc / Đã
    Bán

-   VehicleQuickSpecs --- Icon row: Km \| Year \| Fuel \| Transmission

-   BookingRow --- Used in Customer dashboard bookings list

-   OrderSummary --- Full order detail card with timeline

-   StaffCard --- Avatar + name + role + stats for staff listing

-   BranchCard --- Photo + info + vehicle count card

-   KpiCard --- Stats card with icon + number + trend indicator

-   ActivityFeedItem --- Single feed event with icon + text + timestamp

-   ChatMessage --- Message bubble, supports text + vehicle card embeds

-   TimelineScheduler --- Vertical hourly timeline for staff schedule

**Layout Wrappers (src/layouts/)**

-   PublicLayout --- Sticky header + footer + floating chat + mobile
    drawer

-   CustomerDashboardLayout --- Sidebar + topbar + breadcrumb

-   StaffDashboardLayout --- Dark topbar + dark sidebar + content

-   ManagerDashboardLayout --- White topbar + blue sidebar + content

-   AdminDashboardLayout --- Dark topbar + dark sidebar + section
    headers

-   AuthLayout --- Split brand panel + form panel

--- END OF DOCUMENT ---

*BanXeOTo Da Nang \| UI/UX Design Specification v1.0 \| AI Stitch Prompt
Sets*