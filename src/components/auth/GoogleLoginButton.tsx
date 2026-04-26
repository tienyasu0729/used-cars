/**
 * GoogleLoginButton — Nút đăng nhập bằng Google dùng chung cho LoginForm và RegisterForm.
 *
 * Dùng GoogleLogin component từ @react-oauth/google để hiện popup Google Sign-In.
 * Khi user chọn tài khoản Google → trả về credential (Google ID Token).
 * Component này chỉ render nút, logic xử lý nằm trong useLogin hook.
 */

import { GoogleLogin } from '@react-oauth/google'

interface GoogleLoginButtonProps {
  isLoading: boolean
  onGoogleLogin: (idToken: string) => Promise<void>
}

export function GoogleLoginButton({ isLoading, onGoogleLogin }: GoogleLoginButtonProps) {
  // Nếu chưa cấu hình VITE_GOOGLE_CLIENT_ID thì ẩn nút Google
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) return null

  return (
    <div className="mt-4 flex justify-center">
      <GoogleLogin
        onSuccess={(response) => {
          if (response.credential) {
            onGoogleLogin(response.credential)
          }
        }}
        onError={() => {
          console.error('[GoogleLoginButton] Google Sign-In thất bại')
        }}
        text="continue_with"
        shape="rectangular"
        width={360}
        locale="vi"
        disabled={isLoading}
      />
    </div>
  )
}
