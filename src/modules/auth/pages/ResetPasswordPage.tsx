import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Logo } from '@/components'
import { forgotPasswordSchema } from '@/schemas/authSchemas'
import type { ForgotPasswordForm } from '@/types'
import loginBg from '@/img/z7599596821833_e087a83854f9880f09ab62a81217c222.jpg'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  })

  const onSubmit = () => {
    navigate('/login')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${loginBg})` }}
    >
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-4 cursor-pointer hover:opacity-90 transition-opacity">
              <Logo size="lg" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h1>
            <p className="text-gray-600 mt-1">Nhập email để nhận link đặt lại mật khẩu</p>
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="Nhập email đăng ký"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" variant="primary" className="w-full">
            Gửi link đặt lại mật khẩu
          </Button>
          <p className="text-center">
            <Link to="/login" className="text-sm text-[#FF6600] hover:underline">
              Quay lại đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
