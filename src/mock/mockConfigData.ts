export interface NotificationTrigger {
  id: string
  title: string
  description: string
  subject: string
  content: string
  variables: string[]
  active: boolean
}

export const notificationTriggers: NotificationTrigger[] = [
  {
    id: 'new_user_registration',
    title: 'Đăng ký người dùng mới',
    description: 'Gửi khi người dùng tạo tài khoản',
    subject: 'Chào mừng đến BanXeOTo Đà Nẵng, {{customer_name}}!',
    content: `Hi {{customer_name}},

Cảm ơn bạn đã đăng ký BanXeOTo Đà Nẵng! Chúng tôi rất vui được chào đón bạn.

Tài khoản của bạn đã được tạo thành công với thông tin:
- Email: {{email}}
- Ngày đăng ký: {{registration_date}}

Hãy khám phá kho xe chất lượng cao của chúng tôi. Nếu có bất kỳ câu hỏi nào, đội hỗ trợ luôn sẵn sàng.

Trân trọng,
Đội ngũ BanXeOTo Đà Nẵng`,
    variables: ['{{customer_name}}', '{{email}}', '{{registration_date}}', '{{verify_link}}', '{{support_phone}}'],
    active: true,
  },
  {
    id: 'booking_confirmation',
    title: 'Xác nhận đặt lịch',
    description: 'Gửi sau khi thanh toán tiền đặt cọc',
    subject: 'Xác nhận đặt cọc - {{vehicle_name}}',
    content: 'Xác nhận đặt cọc thành công.',
    variables: ['{{customer_name}}', '{{vehicle_name}}', '{{deposit_amount}}', '{{booking_date}}'],
    active: true,
  },
  {
    id: 'test_drive_reminder',
    title: 'Nhắc nhở lái thử',
    description: '24h trước lịch hẹn',
    subject: 'Nhắc nhở: Lái thử xe {{vehicle_name}}',
    content: 'Nhắc nhở lịch lái thử.',
    variables: ['{{customer_name}}', '{{vehicle_name}}', '{{appointment_time}}'],
    active: true,
  },
  {
    id: 'payment_overdue',
    title: 'Quá hạn thanh toán',
    description: 'Cảnh báo tự động cho thanh toán trễ',
    subject: 'Nhắc nhở thanh toán quá hạn',
    content: 'Bạn có khoản thanh toán quá hạn.',
    variables: ['{{customer_name}}', '{{amount}}', '{{due_date}}'],
    active: true,
  },
  {
    id: 'order_completed',
    title: 'Đơn hàng hoàn tất',
    description: 'Giao xe thành công',
    subject: 'Chúc mừng! Giao xe thành công',
    content: 'Đơn hàng của bạn đã hoàn tất.',
    variables: ['{{customer_name}}', '{{vehicle_name}}', '{{delivery_date}}'],
    active: true,
  },
]
