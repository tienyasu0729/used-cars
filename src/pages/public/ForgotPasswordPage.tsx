import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { CheckCircle } from 'lucide-react'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-xl font-bold">Kiểm tra email của bạn</h1>
        <p className="mt-2 text-gray-500">
          Chúng tôi đã gửi link đặt lại mật khẩu đến {email}
        </p>
        <Link to="/login" className="mt-6 inline-block">
          <Button variant="primary">Quay lại đăng nhập</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Quên Mật Khẩu</h1>
      <p className="mt-2 text-gray-500">Nhập email để nhận link đặt lại mật khẩu</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" className="w-full">
          Gửi Link Đặt Lại
        </Button>
      </form>
      <Link to="/login" className="mt-4 block text-center text-sm text-[#E8612A] hover:underline">
        Quay lại đăng nhập
      </Link>
    </div>
  )
}
