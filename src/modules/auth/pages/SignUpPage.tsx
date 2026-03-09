import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Logo } from '@/components'
import { registerSchema } from '@/schemas/authSchemas'
import type { RegisterForm } from '@/types'
import loginBg from '@/img/z7599596821833_e087a83854f9880f09ab62a81217c222.jpg'

export function SignUpPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  const onSubmit = () => {
    navigate('/login')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-cover bg-center"
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${loginBg})` }}
    >
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-4 cursor-pointer hover:opacity-90 transition-opacity">
              <Logo size="lg" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h1>
            <p className="text-gray-600 mt-1">Tạo tài khoản để sử dụng SCUDN</p>
          </div>
          <Input
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="Nhập email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="Nhập lại mật khẩu"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" variant="primary" className="w-full">
            Đăng ký
          </Button>
          <p className="text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-[#FF6600] font-medium hover:underline">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
