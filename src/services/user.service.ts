/**
 * Hồ sơ & thống kê khách — GET/PUT /users/me, avatar, /users/me/stats
 * (Facade tên theo spec tích hợp; logic tại `userProfile.service.ts`.)
 */
export {
  fetchMyProfile as getProfile,
  updateMyProfile as updateProfile,
  uploadMyAvatar as uploadAvatar,
  fetchCustomerStats as getMyStats,
  normalizeVNPhoneForApi,
} from './userProfile.service'
export type { UpdateMyProfileBody, CustomerStats } from './userProfile.service'
