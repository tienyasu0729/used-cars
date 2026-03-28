// Re-export auth types nhưng exclude UserRole (để user.ts là canonical source có 'Guest')
export {
  type LoginRequest,
  type RegisterRequest,
  type UserProfile,
  type AuthResponse,
  type ApiResponse,
  type ValidationError,
  type ApiErrorResponse,
} from './auth.types'

export * from './vehicle'
// API-backed Vehicle types (Dev 2) — import these as named types khi cần phân biệt
export {
  type Vehicle as ApiVehicle,
  type VehicleStatus as ApiVehicleStatus,
  type VehicleImage,
  type Category,
  type Subcategory,
  type VehicleSearchParams,
  type PaginatedResponse,
  type CreateVehicleRequest,
} from './vehicle.types'
export * from './branch'
export * from './booking'
export * from './order'
export * from './user'
export * from './deposit'
export * from './transaction'
export * from './notification'
export * from './chat'
