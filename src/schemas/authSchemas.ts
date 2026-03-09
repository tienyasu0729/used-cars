import { z } from 'zod'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
const fullNameRegex = /^[a-zA-ZÀ-ỹ\s]{2,50}$/
const phoneRegex = /^(0|\+84)[35789][0-9]{8}$/

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .trim()
    .regex(emailRegex, 'Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(passwordRegex, 'Mật khẩu phải chứa chữ và số'),
})

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Họ và tên không được để trống')
      .regex(fullNameRegex, 'Họ và tên không hợp lệ'),
    email: z
      .string()
      .min(1, 'Email không được để trống')
      .trim()
      .regex(emailRegex, 'Email không hợp lệ'),
    phone: z
      .string()
      .min(1, 'Số điện thoại không được để trống')
      .regex(phoneRegex, 'Số điện thoại không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu tối thiểu 8 ký tự')
      .regex(passwordRegex, 'Mật khẩu phải chứa chữ và số'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .trim()
    .regex(emailRegex, 'Email không hợp lệ'),
})
