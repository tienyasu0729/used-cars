export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordForm {
  email: string
}
