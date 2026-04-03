/**
 * Auth Service — Gọi API Auth (login, register, logout)
 * 
 * Service này chỉ xử lý các endpoint có sẵn từ backend Dev 1:
 * - POST /auth/login
 * - POST /auth/register
 * - POST /auth/change-password (JWT)
 * 
 * Mỗi hàm unwrap ApiResponse wrapper và trả về data thực tế.
 * Error handling: bắt lỗi từ axiosInstance (đã parse sẵn errorCode)
 * rồi re-throw với message tiếng Việt thân thiện.
 */

import axiosInstance from '@/utils/axiosInstance'
import type {
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  AuthResponse,
  ApiResponse,
  ApiErrorResponse,
} from '@/types/auth.types'

/** Key cố định trong localStorage — không được thay đổi */
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const authService = {
  /**
   * Đăng nhập bằng email + password.
   * 
   * Flow:
   * 1. POST /auth/login với { email, password }
   * 2. Backend trả ApiResponse<AuthResponse> → unwrap lấy data
   * 3. Lưu token vào localStorage để interceptor tự gắn ở request sau
   * 4. Return AuthResponse { user, token } cho hook xử lý tiếp
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // axiosInstance đã unwrap response.data → nhận được ApiResponse<AuthResponse>
      const apiResponse = await axiosInstance.post('/auth/login', loginData) as unknown as ApiResponse<AuthResponse>

      const { user, token } = apiResponse.data

      // Lưu token vào localStorage để các request sau tự gắn Bearer
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      return { user, token }
    } catch (error) {
      // Error đã được axiosInstance parse thành ApiErrorResponse
      const apiError = error as ApiErrorResponse

      // Map error code sang message tiếng Việt dễ hiểu
      switch (apiError.errorCode) {
        case 'INVALID_CREDENTIALS':
          throw { ...apiError, message: 'Sai email hoặc mật khẩu. Vui lòng thử lại.' }
        case 'ACCOUNT_SUSPENDED':
          throw { ...apiError, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.' }
        case 'VALIDATION_FAILED':
          throw apiError // Giữ nguyên errors[] để hook parse từng field
        default:
          console.error('[authService.login] Lỗi không xác định:', apiError)
          throw { ...apiError, message: apiError.message || 'Đăng nhập thất bại. Vui lòng thử lại sau.' }
      }
    }
  },

  /**
   * Đăng ký tài khoản Customer mới.
   * 
   * Flow:
   * 1. POST /auth/register với { name, email, phone, password }
   * 2. Backend trả HTTP 201 với ApiResponse<{ message: string }>
   * 3. Return message thành công cho hook hiển thị
   * 
   * Lưu ý: Backend chỉ gán role Customer mặc định.
   * Email verification chưa implement ở backend (chỉ trả message).
   */
  async register(registerData: RegisterRequest): Promise<{ message: string }> {
    try {
      const apiResponse = await axiosInstance.post('/auth/register', registerData) as unknown as ApiResponse<{ message: string }>
      return { message: apiResponse.data.message || 'Đăng ký thành công!' }
    } catch (error) {
      const apiError = error as ApiErrorResponse

      switch (apiError.errorCode) {
        case 'VALIDATION_FAILED':
          throw apiError // Giữ nguyên errors[] để hook parse từng field (VD: email trùng)
        default:
          console.error('[authService.register] Lỗi không xác định:', apiError)
          throw { ...apiError, message: apiError.message || 'Đăng ký thất bại. Vui lòng thử lại sau.' }
      }
    }
  },

  /**
   * Đăng xuất — xóa session ở client.
   * 
   * Backend chưa có endpoint /auth/logout riêng,
   * nên chỉ cần xóa token và user khỏi localStorage.
   * JWT sẽ tự hết hạn theo thời gian.
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('token')
    localStorage.removeItem(USER_KEY)
    // TODO: implement khi backend xong — gọi POST /auth/logout để revoke token
  },

  /**
   * Đổi mật khẩu khi đã đăng nhập.
   * POST /auth/change-password — axios gắn Bearer từ localStorage.
   */
  /**
   * Sau đăng nhập bằng mật khẩu tạm (admin reset) — đặt mật khẩu mới, nhận JWT đầy đủ quyền.
   */
  async completeRequiredPasswordChange(body: { newPassword: string }): Promise<AuthResponse> {
    try {
      const apiResponse = await axiosInstance.post(
        '/auth/complete-required-password-change',
        { newPassword: body.newPassword },
      ) as unknown as ApiResponse<AuthResponse>
      return apiResponse.data
    } catch (error) {
      const apiError = error as ApiErrorResponse
      switch (apiError.errorCode) {
        case 'PASSWORD_TOO_SHORT':
        case 'VALIDATION_FAILED':
          throw apiError
        case 'UNAUTHORIZED':
          throw { ...apiError, message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' }
        default:
          console.error('[authService.completeRequiredPasswordChange]', apiError)
          throw { ...apiError, message: apiError.message || 'Không đặt được mật khẩu mới.' }
      }
    }
  },

  async changePassword(body: ChangePasswordRequest): Promise<{ message: string }> {
    try {
      const apiResponse = await axiosInstance.post('/auth/change-password', {
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      }) as unknown as ApiResponse<{ success: boolean; message: string }>
      return { message: apiResponse.data.message || 'Mật khẩu đã được thay đổi.' }
    } catch (error) {
      const apiError = error as ApiErrorResponse
      switch (apiError.errorCode) {
        case 'INVALID_CURRENT_PASSWORD':
          throw { ...apiError, message: 'Mật khẩu hiện tại không đúng.' }
        case 'PASSWORD_TOO_SHORT':
          throw { ...apiError, message: 'Mật khẩu từ 8 đến 100 ký tự.' }
        case 'VALIDATION_FAILED':
          throw apiError
        case 'UNAUTHORIZED':
          throw { ...apiError, message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' }
        default:
          console.error('[authService.changePassword]', apiError)
          throw { ...apiError, message: apiError.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại sau.' }
      }
    }
  },

  // TODO: implement khi backend xong
  // forgotPassword(email: string): Promise<{ message: string }>
  // resetPassword(token: string, newPassword: string): Promise<{ message: string }>
  // refreshToken(): Promise<AuthResponse>
  // googleLogin(): Promise<AuthResponse>
  // verifyEmail(token: string): Promise<{ message: string }>
}

export default authService
