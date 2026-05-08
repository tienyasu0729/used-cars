# Template import dinh gia xe cu

Thu muc nay dung cho trang `/manager/vehicle-pricing`.

## Muc dich

Manager co the:

1. Chon file Excel `vehicle_pricing_import_toyota_vios_2021_select.xlsx` hoac template cung cau truc
2. Chon thu muc `images/`
3. Bam `Nap du lieu`

Frontend se:

1. Doc sheet `Vehicle`
2. Doc sheet `Images`
3. Match `fileName` trong Excel voi ten file trong thu muc `images/`
4. Upload anh len Cloudinary
5. Do du lieu vao form de manager sua tiep va goi AI pricing

## Cau truc template

### 1. File Excel

File khuyen nghi:

- `vehicle_pricing_import_toyota_vios_2021_select.xlsx`

File nay da co san dropdown trong Excel cho:

- `categoryName`
- `subcategoryName`

Bat buoc co 2 sheet:

- `Vehicle`
- `Images`

### 2. Thu muc anh

Thu muc: `images/`

Anh trong thu muc phai dung dung ten nhu cot `fileName` trong sheet `Images`.

## Cac cot trong sheet Vehicle

Sheet `Vehicle` dang o dang 2 cot:

- `field`
- `value`

Field uu tien:

- `categoryName`
- `subcategoryName`
- `title`
- `year`
- `mileage`
- `fuel`
- `transmission`
- `bodyStyle`
- `origin`
- `description`

Field cu van duoc ho tro de backward-compatible:

- `categoryId`
- `subcategoryId`

Khuyen nghi:

- Manager chon theo dropdown `categoryName/subcategoryName` trong Excel, khong nhap ID.
- Frontend se tu resolve `categoryName/subcategoryName` sang ID dung theo catalog hien tai.
- Neu `subcategoryName` khong thuoc `categoryName` da chon, import se bao loi khi nap len UI.

## Cac cot trong sheet Images

Moi dong la 1 anh:

- `fileName`
- `declaredGroup`
- `caption`
- `captionBy`
- `captionType`

## Declared group hop le

- `front`
- `rear`
- `left_side`
- `right_side`
- `interior_front`
- `interior_rear`
- `dashboard`
- `odometer`
- `engine_bay`
- `tire`
- `damage_detail`
- `document`
- `other`

## Ghi chu nghiep vu

- `caption` chi la hint cua manager, khong phai su that tuyet doi.
- AI pricing va workflow gui admin se snapshot toan bo:
  - thong tin xe
  - toan bo anh
  - caption metadata
  - ket qua AI dinh gia
  - gia manager de nghi
- Admin se xem lai duoc day du ho so nay truoc khi approve/reject.

## Giai thich bang SQL UsedCarPurchaseRequests

Bang `UsedCarPurchaseRequests` duoc tao boi script:

- [create-used-car-purchase-requests.sql](../../../../used-cars-backend/scripts/create-used-car-purchase-requests.sql)

Bang nay dung de luu `snapshot bat bien` cua ho so mua xe cu tai thoi diem manager gui admin.

### Nhom cot chinh

- `branch_id`
  - Chi nhanh gui duyet
- `requested_by`, `requested_by_name`
  - Manager gui ho so
- `status`
  - Trang thai workflow: `PendingApproval`, `Approved`, `Rejected`, `Paid`, `ConvertedToInventory`
- `requested_purchase_price`
  - Gia manager de nghi admin duyet
- `approved_purchase_price`
  - Gia admin duyet
- `manager_note`, `admin_note`
  - Ghi chu hai ben

### Cac cot snapshot

- `vehicle_snapshot_json`
  - Toan bo thong tin xe tu form manager
- `image_snapshot_json`
  - Toan bo anh Cloudinary URL + publicId + declaredGroup + caption
- `valuation_snapshot_json`
  - Toan bo ket qua AI pricing, warnings, market stats, condition summary...

### Cac cot vong doi duyet

- `approved_by`, `approved_by_name`, `approved_at`
  - Ai da duyet hoac tu choi
- `paid_by`, `paid_by_name`, `paid_at`
  - Manager nao da xac nhan thanh toan
- `created_vehicle_id`
  - ID xe duoc tao vao kho sau khi da thanh toan

## Luu y runtime

Backend dang de:

- `spring.jpa.hibernate.ddl-auto=validate`

Nen truoc khi chay end-to-end, can chay script SQL tao bang moi trong SQL Server.
