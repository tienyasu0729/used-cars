import type { Vehicle } from '@/types'

export interface ManagerStaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  branchId: string
  startDate: string
  orderCount: number
  status: 'active' | 'inactive'
  avatar?: string
}

export interface ManagerAppointment {
  id: string
  customerName: string
  vehicleName: string
  staffName: string
  date: string
  timeSlot: string
  type: 'test_drive' | 'consultation'
  status: string
}

export interface ManagerTransfer {
  id: string
  vehicleId: string
  vehicleName: string
  vehicleImage?: string
  vin?: string
  fromBranchId: string
  fromBranchName: string
  fromBranchRegion?: string
  toBranchId: string
  toBranchName: string
  toBranchRegion?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  createdAtAgo?: string
}

export interface BranchReportData {
  monthlyRevenue: number[]
  salesByBrand: { brand: string; count: number }[]
  topVehicles: { name: string; sold: number; revenue: number; image?: string }[]
}

export const mockManagerVehicles: Vehicle[] = [
  {
    id: 'v1',
    brand: 'Toyota',
    model: 'Corolla Cross 1.8V',
    year: 2022,
    price: 825000000,
    mileage: 25000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    status: 'Available',
    branchId: 'branch1',
    images: ['https://placehold.co/600x400/1a3c6e/white?text=Toyota+Corolla'],
    exteriorColor: 'Trắng',
    plateNumber: '43A-688.99',
    engine: '1.8L Dual VVT-i',
    horsepower: 140,
    wheelbaseMm: 2640,
    airbags: 7,
    safetySystem: 'Toyota Safety Sense',
  },
  {
    id: 'v2',
    brand: 'Mazda',
    model: '3 Premium',
    year: 2021,
    price: 695000000,
    mileage: 35000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    status: 'Reserved',
    branchId: 'branch1',
    images: ['https://placehold.co/600x400/1a3c6e/white?text=Mazda+3'],
    exteriorColor: 'Đỏ',
    plateNumber: '43C-245.12',
    engine: '2.0L SkyActiv-G',
    horsepower: 165,
    wheelbaseMm: 2725,
    airbags: 6,
    safetySystem: 'i-Activsense',
  },
  {
    id: 'v3',
    brand: 'Ford',
    model: 'Ranger Wildtrak',
    year: 2023,
    price: 960000000,
    mileage: 12000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    status: 'Sold',
    branchId: 'branch1',
    images: ['https://placehold.co/600x400/1a3c6e/white?text=Ford+Ranger'],
    exteriorColor: 'Cam',
    plateNumber: '43A-552.18',
    engine: '2.0L Bi-Turbo Diesel',
    horsepower: 213,
    wheelbaseMm: 3220,
    airbags: 6,
    safetySystem: 'Ford Co-Pilot360',
  },
]

export const mockStaffMembers: ManagerStaffMember[] = [
  {
    id: 's1',
    name: 'Nguyễn Văn A',
    email: 'vana.nguyen@banxeoto.vn',
    phone: '0905 123 456',
    role: 'Nhân viên bán hàng',
    branchId: 'branch1',
    startDate: '2023-03-15',
    orderCount: 42,
    status: 'active',
  },
  {
    id: 's2',
    name: 'Trần Thị B',
    email: 'thib.tran@banxeoto.vn',
    phone: '0914 999 888',
    role: 'Tư vấn kỹ thuật',
    branchId: 'branch1',
    startDate: '2024-01-20',
    orderCount: 12,
    status: 'inactive',
  },
  {
    id: 's3',
    name: 'Lê Quang C',
    email: 'quangc.le@banxeoto.vn',
    phone: '0905 777 666',
    role: 'Trưởng nhóm kinh doanh',
    branchId: 'branch1',
    startDate: '2022-11-05',
    orderCount: 156,
    status: 'active',
  },
]

export const mockAppointments: ManagerAppointment[] = [
  {
    id: 'a1',
    customerName: 'Nguyễn Văn A',
    vehicleName: 'VinFast VF8 2024',
    staffName: 'Minh Tran',
    date: '2025-03-15',
    timeSlot: '09:30',
    type: 'test_drive',
    status: 'Confirmed',
  },
  {
    id: 'a2',
    customerName: 'Trần Thị B',
    vehicleName: 'Ford Everest Platinum',
    staffName: 'Hoang Nguyen',
    date: '2025-03-15',
    timeSlot: '11:00',
    type: 'consultation',
    status: 'Pending',
  },
  {
    id: 'a3',
    customerName: 'Lê Văn C',
    vehicleName: 'Toyota Camry',
    staffName: 'Minh Tran',
    date: '2025-03-15',
    timeSlot: '14:30',
    type: 'consultation',
    status: 'Confirmed',
  },
]

const IMG = {
  toyotaCamry:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCEUMGY-bKQdao6TrS81qSwA1LGD2ZAPe0TCnR_G6lYPdPT28Wweil6dztUCwS9h9TH8FYeBqt-bmVngYRcCh8LYvrEBfdTKB5DFIlAvqz847QP5-nLUbeXHzYl0GSceBCogYkhy5LuYf6ZigaIARbywjhUA7MF8mrcZdUi874ap3Fr8rZ7LSEsTl32nVXGxMaLjULISPl7y160tXhc2pt0v_D0frpyG9svsZbxXsnNVzXABPhjjr8RyatSIqoFYu6kvI71EfS-GFAk',
  fordEverest:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuALHdIWrrTS0YrjTH2h5pyTTQIgy7HxxZqO6WcHE3EHOUmW0T5MOTDCoG_Oaq-7_V-E2liu6e1JAvYDP9k0BZzffwvEbPKbinveYtUQmYSAV7MvwRhKY9mqnA73dwcvPXgm0w8QHcCITOswYbCiPQSRhIsq-uP9s9ybjS0Hvh0zysIPa9IkSO80RxPUERQycx57ZTJk7_hHqHF8MhVk4b8kopeZyDyCGrtCaIDgj7zMFCQmIePYsgMjecFTvKIj6ITu1YSyMMCZ26sB',
  bmwX5:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDP55Pg-TBIH84xDotdQaC2zbzcqWhkQOpyWh7Ty2TjP7y085izJjdO0Xvd4y6toDuyYAXirEbpK-BVjDD-9ji2hweNGp7MLJmhnyXOzTryrkXvg4PKHZTVP8KammWlK3o0XnxseUah5hTBTwgxWda4-P_yMzAPZaM4iAuKPer0-Pxk2QAKvwbWPBJ-qL_opmr9TOoxqZYYHnYrNBjpNhpKMZtt82mRrobqxeRXVxkVSetziiqJFw72uuUyAd4Grkr-qldxZzC-eXXb',
  mazdaCx5:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD23e5ZnicvN4q3EGGvOQYcpLbdyoPmTKYYsRYZ_mZe8LvbmJd2fzJUiszvIDyV3HrglATpgGjbbu5PQDPztz_8M3_mZ0iw7TuWQlZAOoDh-tVYtuYZ7y_QWMIqc43Lea5nl7y483WpcfG1yHoYByDgYt77Dh4Nz3xFn0O1olXwwHANTzA40m_e3DqHgHHUQZKiVNphZkiJpS4F5_RdCQ8NPFMlwQ5DIrNyvaYAqbPapT8MZQrxs2oY1YorwS3vbPoTpMtigXzrax_s',
  kiaSeltos:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDgL4o9pCIlfO4w9hYKUHN2IJzKGgivZEOJNr0aW8BpM340nihlzgC5Pi0Upjua12L4fyFB0qYsIYluhJ2esqYuKaDJcYiZu0iT8HygNNX1x_6fMuFK4Vk9_srYmk5fR8hgDaVStF9JRllZdFag0g7PlgkjwMLxBQyAaYyoEvYkbrePahZRdM6WZVYo1CT8MrLIQerUX2S_CN4pbbWlQmNhyl899QPovgtlWLZH40dz4WnXAG_TwJ4yRErJCqg-JFkkmTbiK8GrqlVW',
  placeholder: 'https://placehold.co/80x60/1a3c6e/white?text=Car',
}

export const mockManagerTransfers: ManagerTransfer[] = [
  {
    id: 'TRF-2023-001',
    vehicleId: 'v1',
    vehicleName: 'Toyota Camry 2022',
    vehicleImage: IMG.toyotaCamry,
    vin: '1234...889',
    fromBranchId: 'branch1',
    fromBranchName: 'Chi Nhánh Hải Châu',
    toBranchId: 'branch2',
    toBranchName: 'Hà Nội - Hoàn Kiếm',
    toBranchRegion: 'Khu vực Miền Bắc',
    status: 'pending',
    createdAt: '22/05/2024',
  },
  {
    id: 'TRF-2023-002',
    vehicleId: 'v2',
    vehicleName: 'Ford Everest Titanium',
    vehicleImage: IMG.fordEverest,
    vin: '9921...442',
    fromBranchId: 'branch1',
    fromBranchName: 'Chi Nhánh Hải Châu',
    toBranchId: 'branch3',
    toBranchName: 'TP.HCM - Quận 1',
    toBranchRegion: 'Khu vực Miền Nam',
    status: 'approved',
    createdAt: '20/05/2024',
  },
  {
    id: 'TRF-2023-005',
    vehicleId: 'v4',
    vehicleName: 'BMW X5 xDrive40i',
    vehicleImage: IMG.bmwX5,
    vin: '0041...332',
    fromBranchId: 'branch1',
    fromBranchName: 'Chi Nhánh Hải Châu',
    toBranchId: 'branch4',
    toBranchName: 'Hải Phòng - Lê Chân',
    toBranchRegion: 'Khu vực Miền Bắc',
    status: 'rejected',
    createdAt: '18/05/2024',
  },
  {
    id: 'TRF-2023-003',
    vehicleId: 'v7',
    vehicleName: 'Honda CR-V 2023',
    vehicleImage: IMG.placeholder,
    vin: '5566...112',
    fromBranchId: 'branch1',
    fromBranchName: 'Chi Nhánh Hải Châu',
    toBranchId: 'branch2',
    toBranchName: 'Hà Nội - Hoàn Kiếm',
    toBranchRegion: 'Khu vực Miền Bắc',
    status: 'pending',
    createdAt: '21/05/2024',
  },
  {
    id: 'TRF-2023-004',
    vehicleId: 'v8',
    vehicleName: 'Hyundai Tucson 2022',
    vehicleImage: IMG.placeholder,
    vin: '7788...334',
    fromBranchId: 'branch1',
    fromBranchName: 'Chi Nhánh Hải Châu',
    toBranchId: 'branch3',
    toBranchName: 'TP.HCM - Quận 1',
    toBranchRegion: 'Khu vực Miền Nam',
    status: 'approved',
    createdAt: '19/05/2024',
  },
  {
    id: 'TRF-2023-006',
    vehicleId: 'v9',
    vehicleName: 'Mitsubishi Xpander 2023',
    vehicleImage: IMG.placeholder,
    vin: '9900...556',
    fromBranchId: 'branch1',
    fromBranchName: 'Chi Nhánh Hải Châu',
    toBranchId: 'branch4',
    toBranchName: 'Hải Phòng - Lê Chân',
    toBranchRegion: 'Khu vực Miền Bắc',
    status: 'pending',
    createdAt: '17/05/2024',
  },
  {
    id: 'TRF-2023-007',
    vehicleId: 'v10',
    vehicleName: 'VinFast VF8 2024',
    vehicleImage: IMG.placeholder,
    vin: '1122...778',
    fromBranchId: 'branch1',
    fromBranchName: 'Chi Nhánh Hải Châu',
    toBranchId: 'branch2',
    toBranchName: 'Hà Nội - Hoàn Kiếm',
    toBranchRegion: 'Khu vực Miền Bắc',
    status: 'rejected',
    createdAt: '16/05/2024',
  },
  {
    id: 'TRF-2023-008',
    vehicleId: 'v11',
    vehicleName: 'Kia Sportage 2023',
    vehicleImage: IMG.placeholder,
    vin: '3344...990',
    fromBranchId: 'branch1',
    fromBranchName: 'Chi Nhánh Hải Châu',
    toBranchId: 'branch3',
    toBranchName: 'TP.HCM - Quận 1',
    toBranchRegion: 'Khu vực Miền Nam',
    status: 'approved',
    createdAt: '15/05/2024',
  },
  {
    id: 'TRF-2023-009',
    vehicleId: 'v12',
    vehicleName: 'Toyota Vios 2023',
    vehicleImage: IMG.placeholder,
    vin: '5566...112',
    fromBranchId: 'branch1',
    fromBranchName: 'Chi Nhánh Hải Châu',
    toBranchId: 'branch4',
    toBranchName: 'Hải Phòng - Lê Chân',
    toBranchRegion: 'Khu vực Miền Bắc',
    status: 'pending',
    createdAt: '14/05/2024',
  },
  {
    id: 'TRF-2023-010',
    vehicleId: 'v13',
    vehicleName: 'Mazda 3 Premium 2023',
    vehicleImage: IMG.placeholder,
    vin: '7788...334',
    fromBranchId: 'branch1',
    fromBranchName: 'Chi Nhánh Hải Châu',
    toBranchId: 'branch2',
    toBranchName: 'Hà Nội - Hoàn Kiếm',
    toBranchRegion: 'Khu vực Miền Bắc',
    status: 'approved',
    createdAt: '13/05/2024',
  },
  {
    id: 'TRF-2023-011',
    vehicleId: 'v14',
    vehicleName: 'Ford Ranger Wildtrak 2023',
    vehicleImage: IMG.placeholder,
    vin: '9900...556',
    fromBranchId: 'branch1',
    fromBranchName: 'Chi Nhánh Hải Châu',
    toBranchId: 'branch3',
    toBranchName: 'TP.HCM - Quận 1',
    toBranchRegion: 'Khu vực Miền Nam',
    status: 'pending',
    createdAt: '12/05/2024',
  },
  {
    id: 'TRF-2023-012',
    vehicleId: 'v15',
    vehicleName: 'Hyundai Kona 2023',
    vehicleImage: IMG.placeholder,
    vin: '1122...778',
    fromBranchId: 'branch1',
    fromBranchName: 'Chi Nhánh Hải Châu',
    toBranchId: 'branch4',
    toBranchName: 'Hải Phòng - Lê Chân',
    toBranchRegion: 'Khu vực Miền Bắc',
    status: 'rejected',
    createdAt: '11/05/2024',
  },
]

export const mockIncomingTransfers: ManagerTransfer[] = [
  {
    id: 'TRF-INC-001',
    vehicleId: 'v5',
    vehicleName: 'Mazda CX-5 2023',
    vehicleImage: IMG.mazdaCx5,
    fromBranchId: 'branch2',
    fromBranchName: 'Hà Nội - Cầu Giấy',
    toBranchId: 'branch1',
    toBranchName: 'Chi Nhánh Đà Nẵng',
    status: 'pending',
    createdAt: '2025-05-21',
    createdAtAgo: '2 giờ trước',
  },
  {
    id: 'TRF-INC-002',
    vehicleId: 'v6',
    vehicleName: 'Kia Seltos Luxury',
    vehicleImage: IMG.kiaSeltos,
    fromBranchId: 'branch3',
    fromBranchName: 'TP.HCM - Thủ Đức',
    toBranchId: 'branch1',
    toBranchName: 'Chi Nhánh Đà Nẵng',
    status: 'pending',
    createdAt: '2025-05-20',
    createdAtAgo: '5 giờ trước',
  },
]

export const mockBranchReports: BranchReportData = {
  monthlyRevenue: [120, 145, 130, 165, 155, 180],
  salesByBrand: [
    { brand: 'Toyota', count: 42 },
    { brand: 'Hyundai', count: 31 },
    { brand: 'Mazda', count: 24 },
    { brand: 'Ford', count: 18 },
  ],
  topVehicles: [
    { name: 'Toyota Camry 2023', sold: 12, revenue: 420000000, image: 'https://placehold.co/80x80/1a3c6e/white?text=Camry' },
    { name: 'Hyundai Tucson 2023', sold: 9, revenue: 288000000, image: 'https://placehold.co/80x80/1a3c6e/white?text=Tucson' },
    { name: 'Mazda CX-5 Premium', sold: 7, revenue: 245000000, image: 'https://placehold.co/80x80/1a3c6e/white?text=CX5' },
  ],
}
