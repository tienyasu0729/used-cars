**HE THONG BAN XE O TO DA QUA SU DUNG**

*Da Nang Used Car Marketplace*

**TAI LIEU THIET KE UI/UX TOAN HE THONG**

Phien ban: 1.0 \| Ngay: 2025 \| Vai tro: Senior Product Designer + UX
Architect

**MUC LUC**

1\. Tong quan he thong & Kien truc Module

2\. Danh sach day du cac trang (Pages) theo Actor

3\. Thiet ke UI chi tiet - Public Website

4\. Thiet ke UI chi tiet - Customer Dashboard

5\. Thiet ke UI chi tiet - Sales Staff Dashboard

6\. Thiet ke UI chi tiet - Branch Manager Dashboard

7\. Thiet ke UI chi tiet - System Admin Dashboard

8\. Chi tiet Form & Fields

9\. Popup / Modal / Thong bao

10\. UI States (Trang thai giao dien)

11\. Reusable Components

12\. Tinh nang UI/UX nang cao

**1. TONG QUAN HE THONG & KIEN TRUC MODULE**

**1.1 Mo ta Tong quan**

He thong ban xe o to da qua su dung tai Da Nang la mot website thuong
mai dien tu chuyen nghiep cho phep: khach hang tim kiem, so sanh va mua
xe truc tuyen; showroom quan ly toan bo hoat dong ban hang tu mot noi
duy nhat; nhan vien ban hang xu ly don hang, lich hen, dat coc va xac
nhan ban xe; quan ly chi nhanh giam sat nhan su va bao cao; quan tri
vien dieu phoi toan he thong.

**1.2 Actors & Phan quyen**

  -----------------------------------------------------------------------
  **Actor**        **Mo ta**              **Quyen han chinh**
  ---------------- ---------------------- -------------------------------
  Guest            Nguoi dung chua dang   Xem xe, tim kiem, gui tu van
                   nhap                   

  Customer         Nguoi dung da dang ky  Tat ca Guest + dat lich, dat
                                          coc, mua xe, lich su giao dich

  Sales Staff      Nhan vien ban hang chi Quan ly lich hen, tu van, tao
                   nhanh                  don hang, cap nhat trang thai
                                          xe

  Branch Manager   Quan ly chi nhanh      Toan bo Sales Staff + quan ly
                                          xe, nhan vien, bao cao chi
                                          nhanh

  System Admin     Quan tri he thong      Toan quyen: quan ly chi nhanh,
                                          phan quyen, cau hinh, bao cao
                                          tong
  -----------------------------------------------------------------------

**1.3 Cac Module Chinh**

  ------------------------------------------------------------------------
  **Module**       **Chuc nang chinh**                **Actor lien quan**
  ---------------- ---------------------------------- --------------------
  Authentication   Dang ky, Dang nhap, Google OAuth,  Guest, Customer,
                   Quen mat khau, Dang xuat           Staff, Manager,
                                                      Admin

  Vehicle          CRUD xe, upload anh, cap nhat      Branch Manager,
  Management       trang thai, danh muc xe            Admin

  Branch           Tao/sua chi nhanh, quan ly nhan    Admin, Branch
  Management       vien, lich lam viec                Manager

  Customer         Tim kiem, xem chi tiet, so sanh,   Guest, Customer
  Features         yeu thich, tu van, dat lich, dat   
                   coc                                

  Inventory        Theo doi ton kho, dieu chuyen xe   Sales Staff, Branch
  Management       giua chi nhanh                     Manager, Admin

  Sales / Order    Tao don mua, xu ly dat coc, xac    Sales Staff, Branch
  Mgmt             nhan ban, lich su giao dich        Manager, Customer

  System           Phan quyen RBAC, cau hinh he       Admin
  Management       thong, CMS noi dung                

  Reporting /      Bao cao doanh so, ton kho, khach   Branch Manager,
  Analytics        hang theo chi nhanh / tong         Admin

  Notification     Email/SMS nhac lich, xac nhan coc, System (tu dong)
  System           thong bao giam gia                 

  AI Chatbot       Tu van xe tu dong khi nhan vien    Guest, Customer, AI
                   ngoai gio                          System
  ------------------------------------------------------------------------

**2. DANH SACH DAY DU CAC TRANG (PAGES)**

**2.1 Public Website (Guest & Customer)**

  ------------------------------------------------------------------------
  **Page Name**   **Muc dich**          **Actor**     **URL**
  --------------- --------------------- ------------- --------------------
  Homepage        Trang chu, gioi thieu Guest,        /
                  showroom, xe noi bat  Customer      

  Vehicle Listing Danh sach xe, bo loc, Guest,        /vehicles
                  tim kiem              Customer      

  Vehicle Detail  Chi tiet mot xe cu    Guest,        /vehicles/:id
                  the                   Customer      

  Compare         So sanh 2-3 xe        Guest,        /compare
  Vehicles                              Customer      

  Branch Listing  Danh sach tat ca chi  Guest,        /branches
                  nhanh                 Customer      

  Branch Detail   Chi tiet chi nhanh +  Guest,        /branches/:id
                  xe thuoc chi nhanh    Customer      

  Contact /       Form gui yeu cau tu   Guest,        /contact
  Consulting      van                   Customer      

  About Us        Gioi thieu showroom,  Guest         /about
                  lich su                             

  Login Page      Dang nhap he thong    Guest         /login

  Register Page   Dang ky tai khoan moi Guest         /register

  Forgot Password Yeu cau reset mat     Guest         /forgot-password
                  khau                                

  Reset Password  Nhap mat khau moi qua Guest         /reset-password
                  link email                          
  ------------------------------------------------------------------------

**2.2 Customer Dashboard**

  ----------------------------------------------------------------------------
  **Page Name**   **Muc dich**          **Actor**   **URL**
  --------------- --------------------- ----------- --------------------------
  Customer        Tong quan tai khoan,  Customer    /dashboard
  Overview        thong ke nhanh                    

  My Profile      Xem va sua thong tin  Customer    /dashboard/profile
                  ca nhan                           

  Saved Vehicles  Danh sach xe da luu   Customer    /dashboard/saved
                  yeu thich                         

  My Bookings     Danh sach lich Test   Customer    /dashboard/bookings
                  Drive                             

  My Deposits     Danh sach cac khoang  Customer    /dashboard/deposits
                  dat coc                           

  My Orders       Lich su don mua xe    Customer    /dashboard/orders

  Order Detail    Chi tiet mot don hang Customer    /dashboard/orders/:id
                  cu the                            

  Transaction     Toan bo lich su giao  Customer    /dashboard/transactions
  History         dich tai chinh                    

  My Chat         Lich su chat voi nhan Customer    /dashboard/chat
                  vien / AI                         

  Notifications   Trung tam thong bao   Customer    /dashboard/notifications
                  ca nhan                           

  Change Password Cap nhat mat khau     Customer    /dashboard/security
  ----------------------------------------------------------------------------

**2.3 Sales Staff Dashboard**

  -----------------------------------------------------------------------------
  **Page Name**    **Muc dich**          **Actor**   **URL**
  ---------------- --------------------- ----------- --------------------------
  Staff Overview   Tong quan cong viec   Sales Staff /staff/dashboard
                   trong ngay                        

  My Schedule      Lich lam viec, lich   Sales Staff /staff/schedule
                   hen trong ngay                    

  Test Drive       Danh sach lich hen    Sales Staff /staff/bookings
  Bookings         lai thu chua xu ly                

  Consulting       Danh sach yeu cau tu  Sales Staff /staff/consultations
  Requests         van can phan hoi                  

  Branch Inventory Ton kho xe tai chi    Sales Staff /staff/inventory
                   nhanh cua minh                    

  Create Order     Tao don mua xe cho    Sales Staff /staff/orders/new
                   khach tren he thong               

  Order List       Quan ly cac don hang  Sales Staff /staff/orders
                   da tao                            

  Create Deposit   Tao khoang dat coc    Sales Staff /staff/deposits/new
                   cho khach                         

  Customer Chat    Chat truc tiep voi    Sales Staff /staff/chat
                   khach hang                        

  Transfer Request Gui yeu cau dieu      Sales Staff /staff/transfer-requests
                   chuyen xe tu chi                  
                   nhanh khac                        
  -----------------------------------------------------------------------------

**2.4 Branch Manager Dashboard**

  -------------------------------------------------------------------------------
  **Page Name**    **Muc dich**          **Actor**   **URL**
  ---------------- --------------------- ----------- ----------------------------
  Manager Overview Dashboard tong quan   Branch      /manager/dashboard
                   chi nhanh             Manager     

  Vehicle          CRUD xe cua chi nhanh Branch      /manager/vehicles
  Management                             Manager     

  Add Vehicle      Them xe moi vao chi   Branch      /manager/vehicles/new
                   nhanh                 Manager     

  Edit Vehicle     Sua thong tin xe da   Branch      /manager/vehicles/:id/edit
                   co                    Manager     

  Staff Management Quan ly nhan vien chi Branch      /manager/staff
                   nhanh                 Manager     

  Add Staff        Tao tai khoan cho     Branch      /manager/staff/new
  Account          nhan vien moi         Manager     

  Appointment      Toan bo lich hen cua  Branch      /manager/appointments
  Overview         chi nhanh             Manager     

  Transfer         Xem va gui yeu cau    Branch      /manager/transfers
  Requests         dieu chuyen xe        Manager     

  Branch Reports   Bao cao doanh so, ton Branch      /manager/reports
                   kho chi nhanh         Manager     

  Branch Settings  Cap nhat thong tin    Branch      /manager/settings
                   chi nhanh             Manager     
  -------------------------------------------------------------------------------

**2.5 System Admin Dashboard**

  --------------------------------------------------------------------------
  **Page Name**    **Muc dich**          **Actor**   **URL**
  ---------------- --------------------- ----------- -----------------------
  Admin Overview   Tong quan toan bo he  Admin       /admin/dashboard
                   thong                             

  User Management  CRUD tai khoan toan   Admin       /admin/users
                   he thong, gan Role                

  Role &           Cau hinh phan quyen   Admin       /admin/roles
  Permissions      RBAC                              

  Branch           Tao, sua, xoa chi     Admin       /admin/branches
  Management       nhanh                             

  Add Branch       Them chi nhanh moi    Admin       /admin/branches/new
                   vao he thong                      

  Vehicle Catalog  Quan ly Master Data:  Admin       /admin/catalog
                   Brand, Model, Fuel                
                   Type                              

  Transfer         Duyet yeu cau dieu    Admin       /admin/transfers
  Approval         chuyen xe                         

  CMS Management   Quan ly banner, bai   Admin       /admin/cms
                   viet, noi dung                    
                   website                           

  System Config    Cau hinh cong thanh   Admin       /admin/config
                   toan, tham so he                  
                   thong                             

  System Reports   Bao cao tong hop toan Admin       /admin/reports
                   he thong                          

  Audit Logs       Nhat ky hoat dong he  Admin       /admin/logs
                   thong                             

  Notification     Cau hinh mau          Admin       /admin/notifications
  Config           email/SMS thong bao               
  --------------------------------------------------------------------------

**3. THIET KE UI CHI TIET - PUBLIC WEBSITE**

**3.1 Homepage (/)**

**Layout Tong the**

Sticky Navigation Header \| Hero Section (Full-width) \| Featured
Vehicles Carousel \| Why Choose Us \| Branch Map \| Testimonials \| CTA
Banner \| Footer

**Navigation Header**

-   Logo showroom (trai)

-   Menu chinh: Mua Xe \| Chi Nhanh \| Lien He \| Ve Chung Toi

-   Search bar inline (placeholder: \'Tim xe theo hang, doi, gia\...\')

-   Nut \'Dang Nhap\' (outline) + \'Dang Ky\' (filled/primary)

-   Khi da dang nhap: Avatar dropdown (Profile, Dashboard, Dang xuat)

-   Mobile: Hamburger menu

**Hero Section**

-   Background: Anh xe dep full-width voi gradient overlay

-   Tieu de lon: \'Tim xe o to phu hop nhat tai Da Nang\'

-   Thanh tim kiem chinh: Dropdown \'Hang xe\' + Dropdown \'Gia toi
    da\' + Input \'Tien ich\' + Nut \'Tim kiem\'

-   Quick stats: So xe hien co \| So chi nhanh \| Nam hoat dong

**Featured Vehicles Carousel**

-   Tieu de section: \'Xe Noi Bat\'

-   Carousel ngang 4 xe hien thi cung luc (responsive: 1-2 xe mobile)

-   Moi Vehicle Card: Anh xe \| Ten xe \| Gia \| Nam san xuat \| So km
    \| Nut \'Xem Chi Tiet\'

-   Nut \'Tim trái / Tim phai\' de cuon

-   Tab filter: \'Moi Nhat\' \| \'Gia Thap Nhat\' \| \'Gia Cao Nhat\'

**Branch Map Section**

-   Ban do Google Maps nhung truc tiep hien thi vi tri cac chi nhanh

-   Sidebar danh sach chi nhanh: Ten chi nhanh \| Dia chi \| So dien
    thoai \| Gio mo cua

-   Click chi nhanh: Map zoom den chi nhanh do + popup thong tin

**3.2 Vehicle Listing Page (/vehicles)**

**Layout 2 cot: Filter Panel (trai) + Vehicle Grid (phai)**

**Filter Panel (250px co dinh)**

  -----------------------------------------------------------------------
  **Filter**      **Loai component** **Mo ta**
  --------------- ------------------ ------------------------------------
  Tim kiem tu     Text input         Placeholder: \'Nhan, model, bien
  khoa                               so\...\'

  Hang xe (Brand) Multi-select       Toyota, Honda, Ford, Mazda,
                  checkbox           Hyundai\...

  Model / Dong xe Multi-select       Camry, Civic, Ranger\...
                  checkbox (phu      
                  thuoc Brand)       

  Nam san xuat    Range slider hoac  Min: 2000, Max: nam hien tai
                  2 input: Tu - Den  

  Khoang gia      Range slider       0 - 2,000,000,000 VND
  (VND)                              

  So km da di     Range slider       0 - 300,000 km

  Nhien lieu      Multi-select       Xang, Dau, Hybrid, Dien
                  checkbox           

  Hop so          Multi-select       So tu dong, So san
                  checkbox           

  Mau xe          Color swatches     Den, Trang, Bac, Do, Xanh\...
                  (tron)             

  Chi nhanh       Multi-select       Danh sach cac chi nhanh
                  checkbox           

  Trang thai      Multi-select       Con hang, Da dat coc
                  checkbox           
  -----------------------------------------------------------------------

**Vehicle Grid**

-   Sort bar: \'Sap xep theo\' Dropdown (Moi nhat, Gia tang dan, Gia
    giam dan, Km it nhat)

-   Hien thi dem: \'120 xe tim thay\'

-   Toggle view: Grid / List view

-   Grid 3 cot (desktop), 2 cot (tablet), 1 cot (mobile)

-   Pagination cuoi trang: 20 xe/trang, nut Truoc/Sau + so trang

**Vehicle Card Component**

-   Anh xe (crop 16:9, gallery preview khi hover)

-   Badge trang thai: \'Con Hang\' (xanh la) \| \'Da Dat Coc\' (cam) \|
    \'Da Ban\' (xam)

-   Nut Luu (heart icon) o goc tren phai

-   Ten xe (in dam): VD \'Toyota Camry 2.5Q 2020\'

-   Gia: in dam mau cam, VD \'850.000.000 VND\'

-   Thong so nhanh: Icon km \| Icon nam \| Icon nhien lieu \| Icon hop
    so

-   Chi nhanh: Icon location + ten chi nhanh

-   Nut \'Xem Chi Tiet\' (primary) + Nut \'So sanh\' (outline)

**3.3 Vehicle Detail Page (/vehicles/:id)**

**Layout: Gallery (trai 60%) + Info Panel (phai 40%)**

**Gallery Section (trai)**

-   Anh chinh lon ben tren

-   Thumbnail strip bên duoi (click de xem anh lon)

-   Nut xem thu vien day du (modal lightbox)

-   Video 360 neu co

**Info Panel (phai, sticky khi scroll)**

-   Ten xe + badge trang thai

-   Gia: in lon, mau noi bat

-   Thong so chính: Nam SX \| So km \| Nhien lieu \| Hop so \| Mau ngoai
    \| Mau noi that \| Bien so (neu public)

-   Chi nhanh: Anh chi nhanh + ten + dia chi + SDT

-   3 CTA nut: \'Dat Lich Lai Thu\' (primary) \| \'Dat Coc Ngay\'
    (accent) \| \'Lien He Tu Van\' (outline)

-   Nut \'Luu xe\' (heart) + Nut \'So sanh\'

-   Nut \'Chia se\' (Facebook, Zalo, Copy link)

**Tabs ben duoi: Thong So \| Mo Ta \| Vi Tri \| Xe Tuong Tu**

-   Tab Thong So: Bang 2 cot cac thong so ky thuat day du

-   Tab Mo Ta: Rich text mo ta tinh trang xe, lich su bao duong

-   Tab Vi Tri: Google Maps embed vi tri chi nhanh chua xe

-   Tab Xe Tuong Tu: Grid 3-4 xe cung hang/gia tuong tu

**3.4 Compare Vehicles Page (/compare)**

**Layout: Thanh them xe + Bang so sanh**

-   Slot them xe (toi da 3 xe): Moi slot co nut \'+ Them xe\' hoac hien
    thi mini card xe da chon

-   Nut \'Xoa\' tren moi xe da chon

-   Bang so sanh theo hang: Moi thong so la 1 hang, moi xe la 1 cot

-   Hang co gia tri khac biet duoc hightlight mau vang nhe

-   Cac thong so so sanh: Gia \| Nam SX \| So km \| Dong co \| Nhien
    lieu \| Hop so \| Kieu xe \| Mau \| Trang thai

-   CTA cuoi bang: \'Dat Lich Lai Thu\' cho tung xe

**4. THIET KE UI CHI TIET - CUSTOMER DASHBOARD**

**4.1 Layout Chung Customer Dashboard**

**Sidebar Navigation (220px)**

-   Avatar + Ten khach hang + Email

-   Menu items voi icon: Tong Quan \| Xe Da Luu \| Lich Lai Thu \| Dat
    Coc \| Don Mua \| Giao Dich \| Chat \| Thong Bao \| Bao Mat

-   Badge so luong thong bao chua doc tren menu items

**Main Content Area**

-   Breadcrumb navigation

-   Page title + action buttons (neu co)

-   Content area chinh

**4.2 Customer Overview Dashboard**

**Quick Stats Cards (hang ngang)**

  ------------------------------------------------------------------------
  **Card**        **Icon**      **Thong tin hien thi**
  --------------- ------------- ------------------------------------------
  Xe da Luu       Heart icon    So luong xe dang luu trong danh sach yeu
                                thich

  Lich Lai Thu    Calendar icon So lich hen sap toi + lich hen cho xac
                                nhan

  Dat Coc         Shield icon   So xe dang dat coc + tong tien coc

  Don Mua         ShoppingBag   So don da mua
                  icon          
  ------------------------------------------------------------------------

-   Upcoming Bookings: List 3 lich hen gan nhat (xe, chi nhanh, thoi
    gian, trang thai)

-   Recent Vehicles Viewed: Grid 4 xe da xem gan day

-   CTA banner: \'Tim xe phu hop voi ban?\' -\> Nut \'Kham Pha Ngay\'

**4.3 My Bookings (/dashboard/bookings)**

-   Filter tabs: Tat Ca \| Cho Xac Nhan \| Da Xac Nhan \| Da Huy

-   Moi booking row: Anh xe thumbnail \| Ten xe \| Chi nhanh \| Ngay gio
    \| Trang thai badge \| Nut \'Xem Chi Tiet\' \| Nut \'Huy\' (neu chua
    xac nhan)

-   Empty state: Icon calendar + \'Ban chua co lich lai thu nao\' + Nut
    \'Dat Lich Ngay\'

**4.4 My Deposits (/dashboard/deposits)**

-   Bang dat coc: Anh xe \| Ten xe \| So tien coc \| Ngay dat coc \| Han
    het coc \| Trang thai \| Hanh dong

-   Trang thai coc: \'Cho xu ly\' (vang) \| \'Da xac nhan\' (xanh) \|
    \'Da hoan coc\' (xam) \| \'Da chuyen sang don mua\' (tim)

-   Nut \'Xem don mua\' neu da chuyen sang mua xe

**4.5 Transaction History (/dashboard/transactions)**

-   Filter: Theo loai (Dat coc, Mua xe, Hoan coc) \| Theo thoi gian (7
    ngay, 30 ngay, 3 thang, tuy chon)

-   Bang giao dich: Ma GD \| Ngay \| Mo ta \| Loai \| So tien \| Trang
    thai

-   Xuat PDF / Excel bao cao giao dich

**5. THIET KE UI - SALES STAFF DASHBOARD**

**5.1 Layout Sales Staff**

**Top Navigation Bar**

-   Logo + Ten chi nhanh

-   Thong bao bell icon (badge so chua doc)

-   Avatar dropdown: Ho ten \| Vai tro \| Doi mat khau \| Dang xuat

**Sidebar Navigation**

-   Tong Quan \| Lich Lam Viec \| Lich Lai Thu \| Yeu Cau Tu Van \| Ton
    Kho \| Tao Don \| Don Hang \| Dat Coc \| Chat \| Yeu Cau Dieu Chuyen

**5.2 Staff Overview Dashboard**

**KPI Cards hang ngang**

-   Lich hen hom nay: So lich lai thu can xu ly

-   Tu van cho xu ly: So yeu cau chua phan hoi

-   Don hang tuan nay: So don da tao

-   Xe con kha dung: So xe tai chi nhanh co trang thai Available

**Today\'s Schedule Timeline**

-   Timeline doc theo gio tu 8:00 - 18:00

-   Moi event: Anh khach hang \| Ten khach \| Loai cuoc hen (Lai thu /
    Tu van) \| Ten xe \| Trang thai

-   Nut nhanh: \'Xac nhan\' \| \'Doi lich\' \| \'Huy\'

**Pending Tasks List**

-   Danh sach yeu cau tu van chua xu ly

-   Priority badge: Cao/Trung binh/Thap

-   Thoi gian gui yeu cau

-   Nut \'Xu Ly Ngay\'

**5.3 Test Drive Bookings (/staff/bookings)**

-   Calendar view (Weekly) + List view toggle

-   Moi lich hen: Anh xe \| Ten xe \| Khach hang \| SDT \| Thoi gian \|
    Trang thai

-   Action: \'Xac Nhan\' (green) \| \'Doi Lich\' (blue) \| \'Huy\' (red)

-   Modal Doi lich: Chon ngay gio moi + Ghi chu ly do

**5.4 Branch Inventory (/staff/inventory)**

-   Bang ton kho voi co the xem theo Trang thai: Tat Ca \| Available \|
    Dat Coc \| Da Ban

-   Cot: Anh \| Ten xe \| Bien so \| Nam SX \| Gia \| Trang thai \| Cap
    nhat lan cuoi

-   Tim kiem nhanh theo bien so hoac ten xe

-   Xem ton kho chi nhanh khac (read-only) de tu van dieu chuyen

**6. THIET KE UI - BRANCH MANAGER DASHBOARD**

**6.1 Manager Overview Dashboard**

**KPI Summary Cards**

  -----------------------------------------------------------------------
  **KPI**            **Mo ta**              **Hien thi**
  ------------------ ---------------------- -----------------------------
  Doanh so thang nay Tong gia tri xe da ban Bieu do thanh so sanh vs
                                            thang truoc

  Xe da ban          So xe ban duoc trong   Con so + % tang/giam
                     thang                  

  Tong ton kho       So xe hien con tai chi Phan chia theo trang thai
                     nhanh                  

  Lich hen tuan nay  So lich lai thu + tu   So lich hon + chua xac nhan
                     van                    

  Nhan vien hieu qua Top sales staff theo   Ranking 3 nguoi dau
                     doanh so               
  -----------------------------------------------------------------------

**6.2 Vehicle Management (/manager/vehicles)**

**Toolbar**

-   Nut \'+ Them Xe Moi\' (primary button)

-   Search bar: tim theo ten xe, bien so

-   Filter dropdown: Trang thai \| Hang xe \| Nam SX

-   Export Excel / PDF

**Vehicle Table**

  --------------------------------------------------------------------------------------
  **Cot**     **Mo ta**                 **Loai**
  ----------- ------------------------- ------------------------------------------------
  Checkbox    Chon nhieu xe de bulk     Checkbox
              action                    

  Anh         Anh dai dien nho (60x40px Image thumbnail
              thumbnail)                

  Ten xe      Link click de xem chi     Text link
              tiet                      

  Bien so     Bien so xe (an mot phan   Text
              neu chua ban)             

  Nam SX      Nam san xuat              Text

  Gia niem    Dinh dang VND             Currency
  yet                                   

  Trang thai  Badge mau:                Status badge
              Available/Reserved/Sold   

  Nhan vien   Ten sales staff phu trach Text
  phu trach   xe                        

  Ngay cap    Thoi gian cap nhat cuoi   Date
  nhat                                  

  Hanh dong   Nut: Sua \| Doi trang     Action buttons
              thai \| Xoa               
  --------------------------------------------------------------------------------------

-   Bulk actions khi chon nhieu xe: \'Doi trang thai hang loat\' \|
    \'Xoa hang loat\'

-   Pagination: 20 xe/trang

**6.3 Staff Management (/manager/staff)**

-   Danh sach nhan vien: Avatar \| Ho ten \| Email \| SDT \| Ngay bat
    dau \| So don da tao \| Trang thai (Active/Inactive)

-   Nut \'Them Nhan Vien\' \| \'Phan cong cong viec\' \| \'Reset Mat
    Khau\'

-   Click nhan vien: Panel ben phai hien lich su hoat dong, doanh so,
    lich lam viec

**6.4 Branch Reports (/manager/reports)**

-   Date range picker: Hom nay \| 7 ngay \| 30 ngay \| Tuy chon

-   Bieu do doanh so theo thoi gian (Line chart)

-   Bieu do xe ban theo hang (Bar chart)

-   Bang Top xe ban chay nhat

-   Bang hieu qua nhan vien: Ho ten \| So xe ban \| Doanh so \| So lich
    hen

-   Xuat bao cao PDF / Excel

**7. THIET KE UI - SYSTEM ADMIN DASHBOARD**

**7.1 Admin Overview (/admin/dashboard)**

**System-wide KPIs**

-   Tong doanh thu toan he thong (thang nay vs thang truoc)

-   Tong xe da ban / Tong ton kho

-   So khach hang moi dang ky

-   So chi nhanh dang hoat dong

**Dashboard Widgets**

-   Bieu do doanh so theo chi nhanh (Grouped bar chart)

-   Map Da Nang voi dot chi nhanh the hien muc doanh so

-   Feed hoat dong gan day: Tao tai khoan \| Them xe \| Xe da ban \| Yeu
    cau dieu chuyen

-   Alert: He thong canh bao xe gio qua hang hoac co loi thanh toan

**7.2 User Management (/admin/users)**

**Tabs: Tat Ca \| Customer \| Sales Staff \| Branch Manager**

-   Bang: Avatar \| Ho ten \| Email \| SDT \| Role \| Chi nhanh (neu co)
    \| Ngay tao \| Trang thai \| Hanh dong

-   Hanh dong: Chinh sua \| Doi mat khau \| Khoa/Mo khoa tai khoan \|
    Xoa

-   Loc: Theo Role \| Theo chi nhanh \| Theo trang thai \| Tim kiem
    email/ten

-   Nut \'Tao Tai Khoan\' -\> Modal tao tai khoan moi voi chon Role

**7.3 Branch Management (/admin/branches)**

-   Grid view hoac List view cac chi nhanh

-   Moi Branch Card: Anh chi nhanh \| Ten \| Dia chi \| SDT \| So xe \|
    So nhan vien \| Trang thai

-   Nut \'Them Chi Nhanh Moi\'

-   Click chi nhanh: Di chuyen den trang chi tiet quan ly chi nhanh

**7.4 Vehicle Catalog / Master Data (/admin/catalog)**

**Tabs: Hang Xe (Brand) \| Dong Xe (Model) \| Loai Nhien Lieu \| Hop So
\| Mau Xe**

-   Moi tab: Bang don gian Name \| Slug \| So luong xe \| Trang thai \|
    Hanh dong

-   Nut \'Them Moi\' tren moi tab

-   Inline edit (click vao ten de sua)

**7.5 Transfer Approval (/admin/transfers)**

-   Bang yeu cau dieu chuyen: Ma yeu cau \| Xe \| Tu chi nhanh \| Den
    chi nhanh \| Nguoi yeu cau \| Ngay yeu cau \| Trang thai

-   Trang thai: Cho duyet (vang) \| Da duyet (xanh) \| Tu choi (do)

-   Nut \'Duyet\' va \'Tu Choi\' voi modal xac nhan + ghi chu

**7.6 System Reports (/admin/reports)**

-   Filter: Theo chi nhanh (chon tat ca hoac cu the) \| Theo thoi gian

-   KPI Dashboard: Doanh thu tong \| Xe ban tong \| Trung binh gia xe \|
    Ty le chuyen doi

-   Bieu do so sanh hieu qua giua cac chi nhanh

-   Export bao cao tong: PDF / Excel

**8. CHI TIET FORM & FIELDS**

**8.1 Register Form**

  ---------------------------------------------------------------------------------------
  **Field**        **Input    **Required**   **Validation**       **Ghi chu**
                   Type**                                         
  ---------------- ---------- -------------- -------------------- -----------------------
  Ho va ten        text       Yes            2-100 ky tu, chi     VD: Nguyen Van An
                                             chua chu cai va      
                                             khoang trang         

  Email            email      Yes            Dinh dang email hop  VD:
                                             le, chua ton tai     nguyenvanan@gmail.com
                                             trong he thong       

  So dien thoai    tel        Yes            10 chu so, bat dau 0 VD: 0905123456
                                             hoac +84             

  Mat khau         password   Yes            Min 8 ky tu, co chu  Hien thi strength meter
                                             hoa, chu thuong, so  

  Xac nhan mat     password   Yes            Phai khop voi mat    
  khau                                       khau tren            

  Ngay sinh        date       Optional       Phai lon hon 18 tuoi 

  Gioi tinh        radio      Optional       Nam / Nu / Khac      

  Dia chi          text       Optional       Max 255 ky tu        

  Dong y dieu      checkbox   Yes            Phai check moi duoc  Link mo Terms modal
  khoan                                      dang ky              
  ---------------------------------------------------------------------------------------

**8.2 Login Form**

  -----------------------------------------------------------------------------
  **Field**          **Input    **Required**   **Validation**
                     Type**                    
  ------------------ ---------- -------------- --------------------------------
  Email hoac SDT     text       Yes            Dinh dang email hoac so dien
                                               thoai hop le

  Mat khau           password   Yes            Khong de trong

  Ghi nho dang nhap  checkbox   Optional       Luu session 30 ngay
  -----------------------------------------------------------------------------

Luu y thiet ke: \'Quen mat khau?\' link o ben phai. Nut \'Dang Nhap Bang
Google\' voi Google icon. Hien thi loi ro rang khi sai thong tin.

**8.3 Add / Edit Vehicle Form**

  -------------------------------------------------------------------------------
  **Field**          **Input Type**  **Required**   **Validation / Options**
  ------------------ --------------- -------------- -----------------------------
  Hang xe (Brand)    select          Yes            Lay tu danh muc, ket hop voi
                                                    Model

  Dong xe (Model)    select          Yes            Tu dong loc theo Brand da
                     (dependent)                    chon

  Phien ban / Trim   text            Optional       VD: 2.5Q, 1.8E, SX

  Nam san xuat       number/select   Yes            2000 - nam hien tai

  Bien so xe         text            Optional       Format bien so Viet Nam

  Mau ngoai that     select + color  Yes            Lay tu Master Data Mau Xe
                     swatch                         

  Mau noi that       select          Optional       Den, Be, Xam\...

  So km da di        number          Yes            0 - 999999, dieu kien: \>= 0

  Kieu nhien lieu    select          Yes            Xang, Dau, Hybrid, Dien

  Hop so             select          Yes            So tu dong, So san, CVT

  So cho ngoi        select          Yes            2, 4, 5, 7, 8, 9+

  Gia niem yet (VND) number          Yes            Phai \> 0, dinh dang so tien
                                                    VN

  Chi nhanh          select          Yes            Admin chon bat ky, Manager
                                                    chi thay CN minh

  Trang thai         select          Yes            Available, Reserved, Sold

  Mo ta tinh trang   rich text       Optional       Mo ta lich su, bao duong, do
  xe                 editor                         moi\...

  Upload hinh anh    file upload     Yes (\>= 3     JPG/PNG, max 5MB/anh, toi da
                     multi           anh)           20 anh

  Anh dai dien       radio chon tu   Yes            Chon 1 trong cac anh da
                     anh da upload                  upload
  -------------------------------------------------------------------------------

**8.4 Book Test Drive Form**

  -----------------------------------------------------------------------------
  **Field**          **Input       **Required**   **Validation**
                     Type**                       
  ------------------ ------------- -------------- -----------------------------
  Xe muon lai thu    auto-fill (tu Yes            Xe phai o trang thai
                     vehicle                      Available
                     detail)                      

  Chi nhanh          select        Yes            Mac dinh la chi nhanh co xe,
                                                  co the doi

  Ngay hen           date picker   Yes            Khong cho phep chon ngay qua,
                                                  khong chon CN/le

  Gio hen            time slot     Yes            Cac slot 30 phut: 8:00,
                     picker                       8:30\... den 17:30

  Ho ten             text          Yes            Auto-fill neu da dang nhap

  So dien thoai      tel           Yes            Auto-fill neu da dang nhap

  Email              email         Optional       Auto-fill neu da dang nhap

  Ghi chu them       textarea      Optional       Max 500 ky tu, VD: cau hoi,
                                                  yeu cau dac biet
  -----------------------------------------------------------------------------

**8.5 Deposit Payment Form**

  ---------------------------------------------------------------------------
  **Field**          **Input       **Required**   **Validation**
                     Type**                       
  ------------------ ------------- -------------- ---------------------------
  Xe dat coc         read-only (tu Yes            
                     vehicle                      
                     detail)                      

  Ten khach hang     text          Yes            Auto-fill

  SDT                tel           Yes            Auto-fill

  Email              email         Yes            Auto-fill, gui xac nhan ve
                                                  email nay

  So tien coc (VND)  number        Yes            Min: 5.000.000 VND, Max:
                                                  20% gia xe

  Hinh thuc TT       radio         Yes            Chuyen khoan ngan hang \|
                                                  Cong thanh toan online

  Ngan hang          select        Neu chon       BIDV, VCB, Techcombank,
                                   chuyen khoan   MB\...

  Ghi chu            textarea      Optional       Max 300 ky tu

  Dong y dieu kien   checkbox      Yes            Phai check moi xac nhan
  dat coc                                         
  ---------------------------------------------------------------------------

**8.6 Create Branch Form**

  -----------------------------------------------------------------------------
  **Field**          **Input       **Required**   **Validation**
                     Type**                       
  ------------------ ------------- -------------- -----------------------------
  Ten chi nhanh      text          Yes            5-100 ky tu, phai duy nhat

  Dia chi            text          Yes            Dia chi day du

  Quan/Huyen         select        Yes            Danh sach quan huyen Da Nang

  So dien thoai      tel           Yes            So hotline chi nhanh

  Email chi nhanh    email         Optional       Email lien he chi nhanh

  Gio mo cua - dong  time range    Yes            VD: 8:00 - 18:00
  cua                picker                       

  Ngay lam viec      multi         Yes            Thu 2 - Thu 7 \| Ca tuan
                     checkbox                     

  Toa do GPS (Lat)   number        Yes            Goi y lay tu Google Maps

  Toa do GPS (Lng)   number        Yes            Goi y lay tu Google Maps

  Mo ta chi nhanh    textarea      Optional       Max 500 ky tu

  Hinh anh chi nhanh file upload   Optional       JPG/PNG, max 5MB, toi da 5
                     multi                        anh
  -----------------------------------------------------------------------------

**8.7 Create Staff Account Form**

  -------------------------------------------------------------------------------
  **Field**          **Input Type**  **Required**   **Validation**
  ------------------ --------------- -------------- -----------------------------
  Ho va ten          text            Yes            2-100 ky tu

  Email              email           Yes            Dinh dang email, chua ton tai

  So dien thoai      tel             Yes            10 so

  Vai tro (Role)     select          Yes            Sales Staff \| Branch Manager

  Chi nhanh          select          Yes            Admin: chon bat ky; Manager:
                                                    chi chi nhanh minh

  Mat khau tam thoi  password /      Yes            Auto gen hoac nhap tay, gui
                     auto-generate                  email cho nhan vien

  Ngay bat dau lam   date            Optional       
  viec                                              

  Ghi chu            textarea        Optional       
  -------------------------------------------------------------------------------

**9. POPUP / MODAL / THONG BAO**

**9.1 Confirmation Modals**

  ------------------------------------------------------------------------
  **Popup Name**   **Trigger       **Noi dung chinh**     **Buttons**
                   Event**                                
  ---------------- --------------- ---------------------- ----------------
  Confirm Delete   Click \'Xoa\'   Xac nhan xoa xe \[Ten  Huy (outline) \|
  Vehicle          tren xe         xe\]? Hanh dong nay    Xoa (danger/red)
                                   khong the hoan tac.    

  Confirm Delete   Click \'Xoa     Xac nhan xoa tai khoan Huy \| Xoa Tai
  Staff            nhan vien\'     \[Ho ten\]? Nhan vien  Khoan
                                   se mat quyen truy cap. 

  Confirm Cancel   Click \'Huy     Xac nhan huy lich lai  Giu Lich \| Huy
  Booking          lich hen\'      thu ngay \[Ngay/Gio\]  Lich
                                   cho xe \[Ten xe\]?     

  Confirm Deposit  Click \'Huy dat Huy dat coc se khien   Khong \| Huy Dat
  Cancellation     coc\'           xe khong con duoc giu. Coc
                                   Lien he showroom de    
                                   hoan tien.             

  Confirm Transfer Admin click     Duyet dieu chuyen xe   Huy \| Duyet
  Approval         \'Duyet\'       \[Ten xe\] tu \[CN A\] 
                                   sang \[CN B\]?         

  Confirm Transfer Admin click     Textarea: Ly do tu     Huy \| Tu Choi
  Reject           \'Tu Choi\'     choi (required)        

  Confirm Sell     Staff click     Xac nhan xe \[Ten xe\] Huy \| Xac Nhan
  Vehicle          \'Xac nhan      da ban thanh cong?     Ban
                   ban\'           Trang thai se doi      
                                   thanh Da Ban.          

  Confirm Lock     Admin click     Khoa tai khoan         Huy \| Khoa
  Account          \'Khoa TK\'     \[Email\]? Nguoi dung  
                                   se khong the dang      
                                   nhap.                  
  ------------------------------------------------------------------------

**9.2 Success Notifications (Toast)**

  -----------------------------------------------------------------------
  **Popup Name**     **Trigger**        **Message**
  ------------------ ------------------ ---------------------------------
  Login Success      Dang nhap thanh    Chao mung tro lai, \[Ho ten\]!
                     cong               

  Register Success   Dang ky thanh cong Tai khoan da tao. Vui long kiem
                                        tra email de xac thuc.

  Vehicle Added      Them xe thanh cong Xe \[Ten xe\] da duoc them vao
                                        chi nhanh thanh cong.

  Vehicle Updated    Sua xe thanh cong  Thong tin xe da duoc cap nhat.

  Booking Confirmed  Dat lich lai thu   Lich lai thu da duoc dat. Kiem
                     thanh cong         tra email de xem chi tiet.

  Deposit Success    Dat coc thanh cong Dat coc thanh cong! Xe \[Ten xe\]
                                        duoc giu trong \[X\] ngay.

  Order Created      Tao don mua xe     Don hang \[Ma don\] da duoc tao
                                        thanh cong.

  Vehicle Sold       Xac nhan ban xe    Xe \[Ten xe\] da duoc cap nhat
                                        trang thai Da Ban.

  Transfer Approved  Duyet dieu chuyen  Yeu cau dieu chuyen xe da duoc
                                        duyet.

  Profile Updated    Cap nhat ho so     Thong tin ca nhan da cap nhat.
  -----------------------------------------------------------------------

**9.3 Error / Warning Notifications**

  -----------------------------------------------------------------------
  **Popup Name**     **Trigger**        **Message**
  ------------------ ------------------ ---------------------------------
  Login Failed       Sai email/mat khau Email hoac mat khau khong chinh
                                        xac. Vui long thu lai.

  Account Locked     Tai khoan bi khoa  Tai khoan nay tam thoi bi khoa.
                                        Lien he hotline de ho tro.

  Vehicle Not        Xe da het hang khi Rat tiec, xe nay vua co nguoi dat
  Available          dat coc            coc. Vui long chon xe khac.

  Booking Slot Taken Gio hen da day     Khung gio nay da co lich. Vui
                                        long chon thoi gian khac.

  Payment Failed     Thanh toan that    Thanh toan khong thanh cong. Vui
                     bai                long kiem tra thong tin va thu
                                        lai.

  File Too Large     Upload anh qua lon Anh vuot qua kich thuoc cho phep
                                        (5MB). Vui long chon anh khac.

  Session Expired    Het phien dang     Phien lam viec da het han. Vui
                     nhap               long dang nhap lai.
  -----------------------------------------------------------------------

**9.4 Email / SMS Notifications (Automated)**

  -------------------------------------------------------------------------
  **Loai thong     **Khi nao gui**  **Kenh**   **Noi dung chinh**
  bao**                                        
  ---------------- ---------------- ---------- ----------------------------
  Xac thuc dang ky Sau khi dang ky  Email      Link kich hoat tai khoan
                                               (het han 24h)

  Xac nhan lich    Sau khi dat lich Email +    Chi tiet lich: xe, chi
  lai thu                           SMS        nhanh, thoi gian

  Nhac lich lai    Truoc 24h        SMS        Nhac nho lich lai thu ngay
  thu                                          mai

  Xac nhan dat coc Sau khi dat coc  Email      Chi tiet xe, so tien, han
                   thanh cong                  giu xe

  Thong bao giam   Khi xe yeu thich Email      Xe \[Ten\] giam con \[Gia
  gia              giam gia                    moi\]

  Xac nhan don mua Khi tao don mua  Email      Ma don, chi tiet xe, huong
                   xe                          dan tiep theo

  Thong bao nhan   Khi co lich moi  Email +    Nhan vien duoc phan cong
  vien                              App notif  lich lai thu moi

  Yeu cau reset    Click \'Quen mat Email      Link reset mat khau (het han
  mat khau         khau\'                      1h)
  -------------------------------------------------------------------------

**10. UI STATES - TRANG THAI GIAO DIEN**

**10.1 Loading States**

-   Skeleton Loader: Hien thi placeholder cho Vehicle Cards, bang du
    lieu khi dang fetch API

-   Spinner: Trong cac button khi dang xu ly action (dang dat coc, luu
    form\...)

-   Progress Bar: Khi upload nhieu anh xe

-   Full-page Loader: Khi chuyen trang co animation tu nhien

**10.2 Empty States**

  -----------------------------------------------------------------------
  **Trang /          **Empty State Message**    **CTA**
  Section**                                     
  ------------------ -------------------------- -------------------------
  Danh sach xe       Khong tim thay xe phu hop  Nut \'Xoa bo loc\' hoac
  (khong co ket qua) voi tieu chi cua ban       \'Xem tat ca xe\'

  Saved Vehicles     Ban chua luu xe nao! Kham  Nut \'Tim Xe Ngay\'
  (chua luu xe nao)  pha va luu xe yeu thich.   

  My Bookings (chua  Ban chua co lich lai thu   Nut \'Dat Lich Lai Thu\'
  co lich hen)       nao.                       

  My Deposits (chua  Ban chua dat coc xe nao.   Nut \'Kham Pha Xe\'
  co coc)                                       

  Staff - Lich hen   Hom nay ban chua co lich   
  trong ngay (khong  hen nao.                   
  co)                                           

  Admin - Yeu cau    Khong co yeu cau dieu      
  dieu chuyen        chuyen nao dang cho xu ly. 
  -----------------------------------------------------------------------

**10.3 Error States**

-   404 Page: Hien thi anh \'Xe khong tim thay\' sac nen, link ve trang
    chu

-   500 Server Error: Thong bao loi ky thuat, nut \'Thu lai\' va lien he
    ho tro

-   Network Error: Banner \'Mat ket noi internet. Dang thu ket noi
    lai\...\'

-   Form Validation Error: Hien thi loi ngay duoi moi field bi loi,
    border do

-   Permission Denied: Thong bao \'Ban khong co quyen truy cap trang
    nay\'

**10.4 Success States**

-   After Booking: Hien thi trang Success voi thong tin lich hen, QR
    code ma dat lich

-   After Deposit: Trang xac nhan dat coc, tong ket so tien, han giu xe
    countdown

-   After Register: Trang \'Kiem tra email xac thuc\' voi huong dan ro
    rang

-   After Password Reset: \'Mat khau da duoc cap nhat. Vui long dang
    nhap lai\'

**10.5 Interactive States**

-   Hover State: Cards co shadow nang len, buttons doi mau nhe

-   Active/Selected State: Filter da chon co background mau primary,
    checkbox tick

-   Disabled State: Form fields, buttons o trang thai disabled (opacity
    0.5, cursor not-allowed)

-   Focus State: Border ring mau primary khi tab/click vao input

-   Badge States: Available (xanh la #22C55E) \| Reserved (cam #F97316)
    \| Sold (xam #9CA3AF)

**11. REUSABLE COMPONENTS**

**11.1 Vehicle Card**

  -----------------------------------------------------------------------
  **Prop / Variant** **Mo ta**
  ------------------ ----------------------------------------------------
  Standard Card      Hien thi trong grid danh sach xe: Anh, Ten, Gia,
                     Thong so, Chi nhanh, CTAs

  Compact Card       Hien thi trong widget \'Xe Tuong Tu\', Sidebar goi y

  Horizontal Card    Hien thi trong List view, lich su xem xe: Anh trai +
                     Thong tin phai

  Compare Card       Hien thi trong trang so sanh, khong co CTA, chi co
                     nut Xoa

  Saved Card         Hien thi trong My Saved: Co them ngay luu, nut Xoa
                     khoi danh sach
  -----------------------------------------------------------------------

**11.2 Branch Card**

-   Anh chi nhanh (16:9 crop)

-   Ten chi nhanh (in dam)

-   Dia chi + Icon map pin

-   So dien thoai + Icon phone

-   Gio hoat dong

-   So xe dang co (badge xanh la)

-   Nut \'Xem Chi Nhanh\' va \'Chi Duong\'

**11.3 Data Tables (Shared Component)**

  -----------------------------------------------------------------------
  **Feature**        **Mo ta**
  ------------------ ----------------------------------------------------
  Sortable columns   Click header de sort ASC/DESC, hien thi arrow icon

  Column visibility  Dropdown cho phep an/hien cot theo nhu cau

  Row selection      Checkbox chon don / chon tat ca cho bulk actions

  Inline status      Coloured badge cho cac cot trang thai
  badge              

  Pagination         Component dung chung: Rows per page +
                     Previous/Next + So trang

  Empty state        Hien thi empty state message khi khong co data

  Loading state      Hien thi skeleton rows khi dang tai du lieu

  Export button      Xuat ra CSV, Excel, PDF
  -----------------------------------------------------------------------

**11.4 Cac Components Khac**

  -----------------------------------------------------------------------
  **Component**      **Su dung tai**    **Mo ta**
  ------------------ ------------------ ---------------------------------
  Image Gallery /    Vehicle Detail,    Thumbnail strip + full-size modal
  Lightbox           Branch Detail      viewer + swipe

  Calendar / Date    Book Test Drive,   Date range, disable ngay qua,
  Picker             Reports filter     hightlight ngay co lich

  Time Slot Picker   Book Test Drive    Grid cac slot 30 phut, disabled
                     Form               slot da full

  Rich Text Editor   Vehicle            Bold, italic, lists, links
                     description, CMS   
                     content            

  Price Range Slider Vehicle filter     Dual handle slider voi input box
                                        kem theo

  Notification Bell  All dashboards     Dropdown 5 thong bao gan nhat,
                     (header)           badge so chua doc

  Breadcrumb         Tat ca trang con   Duong dan hien tai, click de
                                        navigate

  Status Badge       Tat ca tables va   Mau sac theo trang thai, reusable
                     cards              prop

  Avatar             User info, Staff   Anh dai dien + fallback chu cai
                     list               ten

  Search Bar         Header, Vehicle    Input + Icon search + Clear
                     Listing            button

  Filter Panel       Vehicle Listing,   Collapsible section, filter count
                     Inventory          badge

  AI Chat Widget     All public pages   Floating button bottom-right,
                                        open chat window

  Map Embed          Homepage, Branch   Google Maps iframe/API, custom
                     Detail, Vehicle    markers chi nhanh
                     Detail             

  Stat Card          All dashboards     Icon + Label + Value + % change
                                        indicator

  Chart Components   Reports, Admin     Line, Bar, Pie charts voi tooltip
                     Dashboard          va legend
  -----------------------------------------------------------------------

**12. TINH NANG UI/UX NANG CAO DE XUAT**

**12.1 Vehicle Comparison Tool**

-   Thanh \'Compare Bar\' noi tren cuoi man hinh khi co \>= 2 xe da chon

-   Hien thi thumbnail cac xe dang so sanh + so luong

-   Nut \'So Sanh\' de chuyen sang trang so sanh day du

-   Luu trang thai so sanh trong session (khong mat khi reload trang)

**12.2 AI Car Recommendation**

-   Sau khi xem \>= 3 xe: Hien thi banner \'Goi y danh rieng cho ban\'
    tren trang danh sach

-   AI Chatbot co the hoi \'Ban can xe de di lam hay du lich gia dinh?\'
    de goi y tot hon

-   Hien thi tag \'Phu hop voi ban\' tren Vehicle Cards dua tren lich su
    xem xe

**12.3 Saved Vehicles & Price Alert**

-   Nut heart icon tren tat ca Vehicle Cards (require dang nhap)

-   Trong My Saved: Bat/tat Price Alert cho tung xe cu the

-   Khi xe giam gia: Push notification trong app + Email thong bao tu
    dong

-   Hien thi \'% Giam so voi gia ban dau\' tren saved vehicles

**12.4 Trade-In Submission Form**

-   Them trang /trade-in tren public website

-   Form gui xe cu de dinh gia: Ten xe \| Nam SX \| So km \| Tinh trang
    \| Upload anh xe cu \| SDT

-   Ket qua: \'Chung toi se lien he trong vong 24h de dinh gia xe cua
    ban\'

-   Sales Staff nhan yeu cau trade-in trong dashboard de xu ly

**12.5 Live Chat & AI Chatbot**

**Floating Chat Widget (hien thi tren tat ca trang public)**

-   Vi tri: Bottom-right, icon tin nhan + \'Tu Van Ngay\'

-   Click mo: Chat window 360x500px

-   Khi nhan vien online: Chat truc tiep voi Sales Staff (UC-C12)

-   Khi nhan vien offline: AI tu dong tra loi (UC-C34)

-   AI co the tra loi: Thong so xe, goi y xe, lich lam viec, chinh sach
    dat coc

-   Chuyen sang nhan vien that khi customer yeu cau hoac khi AI khong xu
    ly duoc

**12.6 Responsive Design Guidelines**

  ------------------------------------------------------------------------
  **Breakpoint**   **Pham vi**        **Thay doi chinh**
  ---------------- ------------------ ------------------------------------
  Mobile (sm)      \< 640px           1 cot danh sach xe, hamburger menu,
                                      an Filter Panel (drawer)

  Tablet (md)      640px - 1024px     2 cot danh sach xe, sidebar thu gon,
                                      an mot so cot table

  Desktop (lg)     \> 1024px          3-4 cot, sidebar day du, hien thi
                                      day du
  ------------------------------------------------------------------------

**12.7 Performance & UX Best Practices**

-   Lazy loading anh xe: Chi tai anh khi scroll den (Intersection
    Observer)

-   Infinite scroll tuy chon: Thay the pagination cho vehicle listing
    tren mobile

-   Optimistic UI: Cap nhat UI ngay lap tuc khi save/delete, rollback
    neu API loi

-   Debounce search: Doi 300ms sau khi nguoi dung ngung go moi goi API
    tim kiem

-   Cache du lieu: Luu danh muc Brand/Model/Color vao localStorage,
    refresh moi 24h

-   Progressive form: Form nhieu buoc (Wizard) cho dat coc va mua xe

-   Accessibility: ARIA labels, keyboard navigation, contrast ratio WCAG
    AA

**12.8 Design Tokens & Mau Sac He Thong**

  -----------------------------------------------------------------------
  **Token**        **Gia tri**      **Su dung**
  ---------------- ---------------- -------------------------------------
  Primary Blue     #1A3C6E          Header, button chinh, heading,
                                    sidebar active

  Accent Orange    #E8612A          CTA button, gia xe, highlight, link
                                    hover

  Success Green    #22C55E          Badge Available, Toast success, check
                                    icon

  Warning Orange   #F97316          Badge Reserved, canh bao, dat coc

  Danger Red       #EF4444          Badge Sold, nut xoa, loi form

  Background Gray  #F9FAFB          Trang chu, card background

  Border Gray      #E5E7EB          Bien table, input border, divider

  Text Dark        #111827          Noi dung chinh, tieu de

  Text Secondary   #6B7280          Phu de, placeholder, metadata

  White            #FFFFFF          Card background, modal background
  -----------------------------------------------------------------------

**13. MA TRAN BAO PHU USE CASE**

Bang kiem tra dam bao toan bo Use Case duoc bao phu boi UI/UX thiet ke
tren day.

  -----------------------------------------------------------------------------
  **Use      **Ten**               **Trang/Component xu ly**      **Covered**
  Case**                                                          
  ---------- --------------------- ------------------------------ -------------
  UC-C01     Dang ky tai khoan     /register - Register Form      YES

  UC-C02     Dang nhap             /login - Login Form            YES

  UC-C03     Dang nhap Google      /login - Google OAuth Button   YES

  UC-C04     Quen mat khau         /forgot-password + Reset       YES
                                   Password Page                  

  UC-C05     Dang xuat             Header dropdown - Dang Xuat    YES

  UC-C06     Tim kiem & Loc xe     /vehicles - Filter Panel +     YES
                                   Search Bar                     

  UC-C07     Xem chi tiet xe       /vehicles/:id - Vehicle Detail YES
                                   Page                           

  UC-C08     So sanh xe            /compare - Compare Page +      YES
                                   Compare Bar                    

  UC-C09     Luu xe yeu thich      Heart icon tren Vehicle Card + YES
                                   /dashboard/saved               

  UC-C10     Gui yeu cau tu van    /contact - Consulting Form +   YES
                                   Chat Widget                    

  UC-C11     Dat lich Test Drive   Vehicle Detail CTA + Book Test YES
                                   Drive Form                     

  UC-C12     Chat voi nhan vien    Chat Widget + /staff/chat +    YES
                                   /dashboard/chat                

  UC-C13     Dat coc giu xe        Vehicle Detail CTA + Deposit   YES
                                   Payment Form                   

  UC-C14     Xem lich su giao dich /dashboard/transactions        YES

  UC-C15     Tiep nhan lich Test   /staff/bookings -              YES
             Drive                 Confirm/Reschedule             

  UC-C16     Xu ly yeu cau tu van  /staff/consultations -         YES
                                   Response Panel                 

  UC-C17     Tra cuu ton kho       /staff/inventory - Inventory   YES
                                   Table                          

  UC-C18     Tao don mua xe        /staff/orders/new - Create     YES
                                   Order Form                     

  UC-C19     Tao khoang dat coc    /staff/deposits/new - Create   YES
                                   Deposit Form                   

  UC-C20     Xac nhan ban xe       Staff Order Management -       YES
                                   Confirm Sold                   

  UC-C21     Quan ly xe chi nhanh  /manager/vehicles - Vehicle    YES
                                   Management Table               

  UC-C22     Cap nhat trang thai   Vehicle Table - Status Change  YES
             xe                    Dropdown                       

  UC-C23     Quan ly nhan vien     /manager/staff - Staff         YES
                                   Management                     

  UC-C24     Theo doi lich hen     /manager/appointments -        YES
             tong                  Calendar View                  

  UC-C25     Yeu cau chuyen xe     /manager/transfers - Transfer  YES
                                   Request Form                   

  UC-C26     Xem bao cao chi nhanh /manager/reports - Branch      YES
                                   Report Dashboard               

  UC-C27     Quan ly User & Phan   /admin/users + /admin/roles    YES
             quyen                                                

  UC-C28     Quan ly danh muc xe   /admin/catalog - Master Data   YES
                                   Tabs                           

  UC-C29     Quan ly chi nhanh     /admin/branches - Branch       YES
                                   Management                     

  UC-C30     Duyet dieu chuyen xe  /admin/transfers - Transfer    YES
                                   Approval Table                 

  UC-C31     Quan ly noi dung CMS  /admin/cms - CMS Management    YES

  UC-C32     Cau hinh he thong     /admin/config - System         YES
                                   Configuration                  

  UC-C33     Xem bao cao toan he   /admin/reports - System        YES
             thong                 Reports                        

  UC-C34     Quan ly thong bao     /admin/notifications + Email   YES
                                   Templates                      

  UC-C35     Chat AI tu van vien   AI Chat Widget - Floating      YES
                                   button tat ca trang            
  -----------------------------------------------------------------------------

**\-\-- HET TAI LIEU \-\--**

*He thong Ban Xe O To Da Qua Su Dung - Da Nang \| UI/UX Design
Specification v1.0*