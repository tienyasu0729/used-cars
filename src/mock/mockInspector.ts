import type { InspectionTask, InspectionGroup } from '@/api/inspectorApi'

export const mockInspectionTasks: InspectionTask[] = [
  { id: 't1', carId: 'car-001', carName: 'Toyota Camry 2024', showroomName: 'CarHub Motors', showroomAddress: '123 Auto Lane, Đà Nẵng', lat: 16.0544, lng: 108.2022, appointmentTime: '15/03/2025 10:00', status: 'waiting' },
  { id: 't2', carId: 'car-002', carName: 'Honda CR-V 2023', showroomName: 'Elite Auto', showroomAddress: '45 Lê Duẩn, Hà Nội', lat: 21.0285, lng: 105.8542, appointmentTime: '16/03/2025 14:00', status: 'in_progress' },
  { id: 't3', carId: 'car-003', carName: 'Mercedes E-Class 2024', showroomName: 'CarHub', showroomAddress: 'Đà Nẵng', status: 'completed', appointmentTime: '14/03/2025' },
]

export const mockShowroomImages: Record<string, string[]> = {
  'car-001': ['/img1.jpg', '/img2.jpg', '/img3.jpg'],
  'car-002': ['/img1.jpg', '/img2.jpg'],
}

export const mockInspectionChecklist: InspectionGroup[] = [
  { id: 'g1', name: 'Giấy tờ pháp lý', items: [{ id: 'i1', label: 'Đăng ký xe' }, { id: 'i2', label: 'Bảo hiểm còn hiệu lực' }] },
  { id: 'g2', name: 'Ngoại thất & khung gầm', items: [{ id: 'i3', label: 'Thân xe không hư hỏng' }, { id: 'i4', label: 'Khung xe nguyên vẹn', critical: true }] },
  { id: 'g3', name: 'Nội thất', items: [{ id: 'i5', label: 'Ghế ngồi' }, { id: 'i6', label: 'Bảng điều khiển' }] },
  { id: 'g4', name: 'Động cơ & cơ khí', items: [{ id: 'i7', label: 'Động cơ hoạt động' }, { id: 'i8', label: 'Hộp số', critical: true }] },
]
