import type { Vehicle } from '@/types'

/** Vai trò hệ thống từ API — dùng để ẩn hành động đồng cấp (BranchManager không sửa BranchManager khác). */
export type StaffSystemRoleCode = 'SalesStaff' | 'BranchManager'

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
  staffRoleCode?: StaffSystemRoleCode
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
