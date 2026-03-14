import type { Branch } from '@/types'

export const mockBranchStaff: Record<string, Array<{ name: string; role: string; avatar: string }>> = {
  branch1: [
    { name: 'Nguyễn Minh Hoàng', role: 'Quản lý chi nhánh', avatar: 'https://placehold.co/96x96/1a3c6e/white?text=NMH' },
    { name: 'Lê Thị Bảo Ngọc', role: 'Tư vấn viên cao cấp', avatar: 'https://placehold.co/96x96/1a3c6e/white?text=LBN' },
    { name: 'Trần Văn Tú', role: 'Chuyên gia kỹ thuật', avatar: 'https://placehold.co/96x96/1a3c6e/white?text=TVT' },
  ],
  branch2: [
    { name: 'Nguyễn Minh Hoàng', role: 'Quản lý chi nhánh', avatar: 'https://placehold.co/96x96/1a3c6e/white?text=NMH' },
    { name: 'Lê Thị Bảo Ngọc', role: 'Tư vấn viên cao cấp', avatar: 'https://placehold.co/96x96/1a3c6e/white?text=LBN' },
  ],
  branch3: [
    { name: 'Nguyễn Minh Hoàng', role: 'Quản lý chi nhánh', avatar: 'https://placehold.co/96x96/1a3c6e/white?text=NMH' },
    { name: 'Lê Thị Bảo Ngọc', role: 'Tư vấn viên cao cấp', avatar: 'https://placehold.co/96x96/1a3c6e/white?text=LBN' },
    { name: 'Trần Văn Tú', role: 'Chuyên gia kỹ thuật', avatar: 'https://placehold.co/96x96/1a3c6e/white?text=TVT' },
  ],
}

export const mockBranches: Branch[] = [
  {
    id: 'branch1',
    name: 'Chi Nhánh Hải Châu',
    address: '123 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng',
    phone: '0236 123 4567',
    email: 'haichau@banxeoto.vn',
    district: 'Hải Châu',
    lat: 16.0544,
    lng: 108.2022,
    openTime: '08:00',
    closeTime: '18:00',
    workingDays: 'Thứ 2 - Thứ 7',
    vehicleCount: 45,
    staffCount: 8,
    description: 'Điểm đến hàng đầu cho xe sang trọng và hiệu suất cao tại miền Trung Việt Nam.',
    images: ['https://placehold.co/1200x400/1a3c6e/white?text=Chi+Nh%C3%A1nh+H%E1%BA%A3i+Ch%C3%A2u'],
  },
  {
    id: 'branch2',
    name: 'Chi Nhánh Thanh Khê',
    address: '456 Điện Biên Phủ, Quận Thanh Khê, Đà Nẵng',
    phone: '0236 234 5678',
    district: 'Thanh Khê',
    lat: 16.0684,
    lng: 108.1912,
    openTime: '08:00',
    closeTime: '18:00',
    workingDays: 'Thứ 2 - Thứ 7',
    vehicleCount: 38,
    staffCount: 6,
    description: 'Chi nhánh phục vụ khu vực Thanh Khê với đa dạng mẫu xe.',
  },
  {
    id: 'branch3',
    name: 'Chi Nhánh Sơn Trà',
    address: '789 Võ Nguyên Giáp, Quận Sơn Trà, Đà Nẵng',
    phone: '0236 345 6789',
    district: 'Sơn Trà',
    lat: 16.0595,
    lng: 108.2427,
    openTime: '08:00',
    closeTime: '18:00',
    workingDays: 'Thứ 2 - Thứ 7',
    vehicleCount: 52,
    staffCount: 10,
    description: 'Showroom ven biển với view đẹp, trải nghiệm mua xe đẳng cấp.',
  },
]
