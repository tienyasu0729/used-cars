BanXeOTo Da Nang – Frontend System Architecture

Tech Stack: React 18 + TypeScript

1. System Architecture Overview

Hệ thống frontend được xây dựng theo mô hình:

Feature-based architecture

Clean architecture

Component-driven UI

Client (React App)
│
├── Presentation Layer
│   ├── Pages
│   ├── Layouts
│   ├── Components
│   └── UI Design System
│
├── Application Layer
│   ├── Hooks
│   ├── State Management
│   ├── Services
│   └── API Clients
│
├── Domain Layer
│   ├── Entities
│   ├── Types
│   └── Business Logic
│
└── Infrastructure Layer
    ├── API
    ├── Auth
    ├── Storage
    └── Config
2. Technology Stack
Core
React 18
TypeScript
Vite
React Router v6
TailwindCSS
State Management
Zustand
React Query (TanStack Query)
Form Handling
React Hook Form
Zod validation
UI & Utilities
Lucide React (icons)
Recharts (charts)
Axios (API client)
3. Project Folder Structure
src
│
├── app
│   ├── router
│   │   ├── AppRouter.tsx
│   │   ├── PublicRoutes.tsx
│   │   ├── CustomerRoutes.tsx
│   │   ├── StaffRoutes.tsx
│   │   ├── ManagerRoutes.tsx
│   │   └── AdminRoutes.tsx
│   │
│   └── providers
│       ├── QueryProvider.tsx
│       ├── AuthProvider.tsx
│       └── ThemeProvider.tsx
│
├── layouts
│   ├── PublicLayout
│   ├── CustomerDashboardLayout
│   ├── StaffDashboardLayout
│   ├── ManagerDashboardLayout
│   └── AdminDashboardLayout
│
├── features
│   ├── auth
│   ├── vehicles
│   ├── branches
│   ├── bookings
│   ├── deposits
│   ├── orders
│   ├── users
│   ├── chat
│   └── notifications
│
├── pages
│   ├── public
│   ├── customer
│   ├── staff
│   ├── manager
│   └── admin
│
├── components
│   ├── ui
│   ├── common
│   └── charts
│
├── hooks
│
├── services
│
├── store
│
├── types
│
├── utils
│
├── config
│
└── assets
4. Layout Architecture

Hệ thống có 5 layout chính, mỗi layout đại diện cho một actor.

layouts
│
├── PublicLayout
│   ├── PublicHeader
│   ├── PublicFooter
│   └── FloatingChatWidget
│
├── CustomerDashboardLayout
│   ├── Sidebar
│   ├── Topbar
│   └── Content
│
├── StaffDashboardLayout
│   ├── Sidebar
│   ├── Topbar
│   └── Content
│
├── ManagerDashboardLayout
│
└── AdminDashboardLayout
5. Routing Architecture
/                       → Public Website
/vehicles
/vehicles/:id
/compare
/branches
/login
/register

/dashboard              → Customer
/dashboard/orders
/dashboard/bookings

/staff                  → Sales Staff
/staff/orders
/staff/inventory

/manager                → Branch Manager
/manager/vehicles
/manager/staff

/admin                  → System Admin
/admin/users
/admin/catalog
/admin/reports
6. Feature Module Architecture

Mỗi module được tổ chức theo feature-based structure.

Ví dụ module vehicles:

features
   vehicles
      components
         VehicleCard.tsx
         VehicleGallery.tsx
         VehicleStatusBadge.tsx

      pages
         VehicleListingPage.tsx
         VehicleDetailPage.tsx

      hooks
         useVehicles.ts

      services
         vehicleApi.ts

      types
         vehicle.types.ts
7. Domain Models
Vehicle Entity
export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  price: number
  mileage: number
  fuelType: FuelType
  transmission: Transmission
  status: VehicleStatus
  branchId: string
  images: string[]
}
Booking Entity
export interface Booking {
  id: string
  vehicleId: string
  customerId: string
  branchId: string
  date: string
  timeSlot: string
  status: BookingStatus
}
Order Entity
export interface Order {
  id: string
  vehicleId: string
  customerId: string
  price: number
  deposit: number
  status: OrderStatus
}
8. State Management Architecture

Global state sử dụng Zustand.

store
   authStore.ts
   userStore.ts
   compareStore.ts
   notificationStore.ts

Ví dụ:

export const useAuthStore = create((set) => ({
  user: null,
  token: null,

  login: (data) => set({
    user: data.user,
    token: data.token
  }),

  logout: () => set({
    user: null,
    token: null
  })
}))
9. API Layer Architecture
services
   apiClient.ts
   authApi.ts
   vehicleApi.ts
   bookingApi.ts
   orderApi.ts
   branchApi.ts

API client:

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})
10. UI Design System
components/ui
│
├── Button
├── Badge
├── Input
├── Select
├── Modal
├── Toast
├── Spinner
├── SkeletonCard
├── EmptyState
11. Component Architecture (Atomic Design)
Atoms
Button
Input
Badge

Molecules
VehicleCard
BookingRow
StaffRow

Organisms
VehicleGrid
BookingTable
InventoryTable

Templates
DashboardLayout

Pages
VehicleListingPage
VehicleDetailPage
12. Authentication & Role-Based Access

Hệ thống hỗ trợ 5 roles:

Guest
Customer
SalesStaff
BranchManager
Admin

Route protection:

ProtectedRoute
RoleRoute

Ví dụ:

<RoleRoute roles={["ADMIN"]}>
   <AdminDashboard />
</RoleRoute>
13. Performance Optimization

Áp dụng:

Code Splitting
Lazy Loading
Route-based chunking
API caching

Ví dụ:

const VehicleListingPage = lazy(() =>
  import('@/features/vehicles/pages/VehicleListingPage')
)
14. Scalability Strategy

Hệ thống được thiết kế để scale:

50+ screens
multi-role dashboards
multi-branch vehicle inventory
large vehicle catalog

Kiến trúc đảm bảo:

modular
maintainable
testable
scalable
15. Development Standards
ESLint
Prettier
Husky
Commitlint
16. CI/CD Pipeline
GitHub Actions
Vercel / Netlify deployment
Automated build
Lint + Type check
17. Final Architecture Overview
React Application
│
├── Layout Layer
│
├── Feature Modules
│   ├── Vehicles
│   ├── Orders
│   ├── Bookings
│   ├── Branches
│   ├── Users
│   └── Chat
│
├── Shared UI Component Library
│
├── Global State Management
│
├── API Layer
│
└── Domain Models