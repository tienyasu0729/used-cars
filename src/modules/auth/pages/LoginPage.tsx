import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Logo } from '@/components'
import { Loader2 } from 'lucide-react'
import { loginSchema } from '@/schemas/authSchemas'
import { useAuthStore } from '@/stores/authStore'
import type { LoginForm } from '@/types'
import loginBg from '@/img/z7599596821833_e087a83854f9880f09ab62a81217c222.jpg'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: LoginForm) => {
    setLoginError('')
    setIsSubmitting(true)
    try {
      const success = login(data.email, data.password)
      if (success) {
        const user = useAuthStore.getState().user
        if (user?.role === 'admin') navigate('/admin/dashboard')
        else if (user?.role === 'staff') navigate('/staff/dashboard')
        else if (user?.role === 'finance') navigate('/finance/dashboard')
        else if (user?.role === 'inspector') navigate('/inspector/tasks')
        else if (user?.role === 'showroom') navigate('/showroom/inventory')
        else navigate('/')
      } else {
        setLoginError('Email hoặc mật khẩu không đúng')
      }
    } finally {
      setIsSubmitting(false)
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
            <p className="text-gray-600 mt-1">Chào mừng bạn trở lại SCUDN</p>
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="Nhập email của bạn"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu"
            error={errors.password?.message}
            {...register('password')}
          />
          {loginError && (
            <p className="text-sm text-red-500">{loginError}</p>
          )}
          <div className="flex justify-end">
            <Link to="/reset-password" className="text-sm text-[#FF6600] hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : null}
            Đăng nhập
          </Button>
          <p className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/signup" className="text-[#FF6600] font-medium hover:underline">
              Đăng ký
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
