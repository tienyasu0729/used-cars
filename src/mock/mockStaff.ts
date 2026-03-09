import type {
  PendingCar,
  PendingReview,
  FraudReport,
  CategoryNode,
  MediaItem,
  SeoPage,
  AppointmentFlowItem,
  ChangeLog,
  ShowroomApplication,
  StaffVoucher,
  BlogPost,
} from '@/api/staffApi'
import type { Banner } from '@/api/customerApi'

export const mockStaffStats = {
  pendingCarApprovals: 12,
  pendingReviewApprovals: 5,
  newFraudReports: 2,
}

export const mockPendingCars: PendingCar[] = [
  { id: 'pc-1', carName: 'Toyota Vios 2024', showroom: 'CarHub Motors', price: 520_000_000, submittedAt: '08/03/2025 10:30' },
  { id: 'pc-2', carName: 'Honda City 2023', showroom: 'Elite Auto', price: 480_000_000, submittedAt: '08/03/2025 09:15' },
  { id: 'pc-3', carName: 'VinFast VF 8 2024', showroom: 'City Drive', price: 460_000_000, submittedAt: '07/03/2025 16:00' },
]

export const mockPendingReviews: PendingReview[] = [
  { id: 'pr-1', reviewerName: 'Nguyễn A', showroom: 'CarHub Motors', reviewText: 'Xe tốt, giao dịch nhanh', rating: 5, createdAt: '08/03/2025' },
  { id: 'pr-2', reviewerName: 'Trần B', showroom: 'Elite Auto', reviewText: 'Chất lượng ổn', rating: 4, createdAt: '07/03/2025' },
]

export const mockFraudReports: FraudReport[] = [
  { id: 'fr-1', showroom: 'Auto Premium', issueType: 'Gian lận giá', evidence: ['/ev1.jpg'], status: 'pending', reportedAt: '08/03/2025' },
  { id: 'fr-2', showroom: 'City Drive', issueType: 'Bán xe không qua hệ thống', evidence: ['/ev2.jpg'], status: 'investigating', reportedAt: '07/03/2025' },
]

export const mockCategories: CategoryNode[] = [
  {
    id: 'toyota',
    name: 'Toyota',
    type: 'brand',
    children: [
      { id: 'camry', name: 'Camry', type: 'model', children: [{ id: 'sedan', name: 'Sedan', type: 'vehicleType' }] },
      { id: 'corolla', name: 'Corolla', type: 'model', children: [{ id: 'sedan2', name: 'Sedan', type: 'vehicleType' }] },
    ],
  },
  {
    id: 'honda',
    name: 'Honda',
    type: 'brand',
    children: [
      { id: 'crv', name: 'CR-V', type: 'model', children: [{ id: 'suv', name: 'SUV', type: 'vehicleType' }] },
    ],
  },
]

export const mockMedia: MediaItem[] = [
  { id: 'm1', url: '/img/banner1.jpg', name: 'banner1.jpg', type: 'image' },
  { id: 'm2', url: '/img/car1.jpg', name: 'car1.jpg', type: 'image' },
  { id: 'm3', url: '/img/logo.png', name: 'logo.png', type: 'image' },
]

export const mockBanners: Banner[] = [
  { id: '1', title: 'Khuyến mãi mùa hè', image: '', link: '/promo', type: 'promotion' },
  { id: '2', title: 'Xe nổi bật', image: '', link: '/cars', type: 'featured' },
]

export const mockSeoPages: SeoPage[] = [
  { id: '1', pageUrl: '/', metaTitle: 'SCUDN - Ô tô cũ Đà Nẵng', metaDescription: 'Mua bán xe cũ uy tín', keywords: 'xe cũ, ô tô, đà nẵng' },
  { id: '2', pageUrl: '/cars', metaTitle: 'Danh sách xe', metaDescription: 'Xem danh sách xe cũ', keywords: 'xe cũ, danh sách' },
]

export const mockAppointmentFlow: AppointmentFlowItem[] = [
  { id: 'af-1', appointmentId: 'APT-001', car: 'Toyota Camry', customer: 'Nguyễn A', showroom: 'CarHub', appointmentDate: '08/03/2025', saleStatus: 'not_reported', suspicious: true },
  { id: 'af-2', appointmentId: 'APT-002', car: 'Honda CR-V', customer: 'Trần B', showroom: 'Elite', appointmentDate: '07/03/2025', saleStatus: 'reported', suspicious: false },
]

export const mockChangeHistory: ChangeLog[] = [
  { id: 'ch-1', user: 'Staff A', action: 'Edited car price', module: 'Cars', changedData: 'Toyota Camry: 850M -> 820M', timestamp: '08/03/2025 10:30' },
  { id: 'ch-2', user: 'Staff B', action: 'Updated showroom info', module: 'Showrooms', changedData: 'CarHub: phone updated', timestamp: '08/03/2025 09:15' },
]

export const mockShowroomApplications: ShowroomApplication[] = [
  { id: 'sa-1', showroomName: 'Premium Motors', owner: 'Lê Văn X', phone: '0901234567', location: 'Đà Nẵng', status: 'pending' },
  { id: 'sa-2', showroomName: 'Auto Center', owner: 'Phạm Thị Y', phone: '0907654321', location: 'Hà Nội', status: 'pending' },
]

export const mockStaffVouchers: StaffVoucher[] = [
  { id: 'sv-1', code: 'SUMMER2025', discountPercent: 10, usageLimit: 100, expiryDate: '31/08/2025', status: 'active' },
  { id: 'sv-2', code: 'RESCUE1Y', discountPercent: 100, usageLimit: 1, expiryDate: '31/12/2025', status: 'active' },
]

export const mockBlogPosts: BlogPost[] = [
  { id: 'bp-1', title: 'Hướng dẫn mua xe cũ', content: 'Nội dung bài viết...', category: 'Blog', status: 'published' },
  { id: 'bp-2', title: 'FAQ: Bảo hành xe', content: 'Nội dung FAQ...', category: 'FAQ', status: 'draft' },
]

export const mockHotCars = ['car-001', 'car-002', 'car-003']

export interface StaffManageItem {
  id: string
  name: string
  email: string
  role: string
  status: string
}

export const mockStaffList: StaffManageItem[] = [
  { id: '1', name: 'Nguyen Van A', email: 'nguyenvana@scudn.vn', role: 'Staff', status: 'active' },
  { id: '2', name: 'Tran Thi B', email: 'tranthib@scudn.vn', role: 'Staff', status: 'pending' },
]

export const mockRefundVerifications: { id: string; customerPhotos: string[]; inspectionReport: string }[] = [
  { id: 'rv-1', customerPhotos: ['/p1.jpg', '/p2.jpg'], inspectionReport: '142-point: Minor wear on tires, brake pads 70%' },
]
