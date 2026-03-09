export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/reset-password',
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    STAFF: '/admin/staff',
    TRANSACTIONS: '/admin/transactions',
    SETTINGS: '/admin/settings',
    CAR_POST_APPROVAL: '/admin/car-post-approval',
  },
  SHOWROOM: {
    INVENTORY: '/showroom/inventory',
    ADD_CAR: '/showroom/add-car',
    PROFILE: '/showroom/profile',
    APPOINTMENTS: '/showroom/appointments',
  },
  CUSTOMER: {
    CARS: '/cars',
    CAR_DETAIL: (id: string) => `/cars/${id}`,
    BOOK_APPOINTMENT: '/book-appointment',
    TRANSACTIONS: '/transactions',
  },
} as const
