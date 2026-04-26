import { z } from 'zod'

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  identityNumber: z.string().regex(/^\d{9,12}$/, 'CCCD/CMND phải có 9-12 chữ số'),
  phoneNumber: z.string().regex(/^(0|\+84)\d{9}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  dob: z.string().min(1, 'Ngày sinh là bắt buộc'),
  identityIssuedDate: z.string().min(1, 'Ngày cấp CCCD là bắt buộc'),
  identityIssuedPlace: z.string().min(1, 'Nơi cấp CCCD là bắt buộc').max(200),
  permanentAddress: z.string().min(1, 'Địa chỉ thường trú là bắt buộc').max(500),
  currentAddress: z.string().max(500).optional().default(''),
})

export const employmentSchema = z.object({
  employmentType: z.enum(['SALARIED', 'SELF_EMPLOYED', 'FREELANCE', 'RETIRED', 'OTHER'], {
    required_error: 'Chọn loại hình công việc',
  }),
  companyName: z.string().min(1, 'Tên công ty / đơn vị là bắt buộc').max(200),
  jobTitle: z.string().max(100).optional().default(''),
  workDuration: z.string().max(50).optional().default(''),
  salaryMethod: z.string().max(50).optional().default(''),
  businessName: z.string().max(200).optional().default(''),
  businessType: z.string().max(100).optional().default(''),
  businessDuration: z.string().max(50).optional().default(''),
})

export const financialSchema = z.object({
  monthlyIncome: z.coerce.number().min(1_000_000, 'Thu nhập tối thiểu 1.000.000 VNĐ'),
  monthlyExpenses: z.coerce.number().min(0, 'Chi phí sinh hoạt phải >= 0'),
  existingLoans: z.coerce.number().min(0, 'Khoản vay hiện tại phải >= 0').optional().default(0),
  dependentsCount: z.coerce.number().min(0, 'Số người phụ thuộc phải >= 0').optional().default(0),
})

export const loanDetailsSchema = z.object({
  vehiclePrice: z.coerce.number().min(1, 'Giá xe là bắt buộc'),
  prepaymentAmount: z.coerce.number().min(0, 'Số tiền trả trước phải >= 0'),
  loanAmount: z.coerce.number().min(1, 'Số tiền vay là bắt buộc'),
  loanTermMonths: z.coerce.number().min(6, 'Tối thiểu 6 tháng').max(84, 'Tối đa 84 tháng'),
  repaymentMethod: z.string().min(1, 'Chọn phương thức trả nợ'),
})

export const commitmentSchema = z.object({
  agreedTerms: z.literal(true, { errorMap: () => ({ message: 'Bạn phải cam kết thông tin chính xác' }) }),
  agreedPrivacy: z.literal(true, { errorMap: () => ({ message: 'Bạn phải đồng ý điều khoản bảo mật' }) }),
  signedDate: z.string().min(1, 'Ngày ký là bắt buộc'),
})

export const fullInstallmentSchema = personalInfoSchema
  .merge(employmentSchema)
  .merge(financialSchema)
  .merge(loanDetailsSchema)
  .merge(commitmentSchema)
  .extend({ signatureUrl: z.string().optional().default('') })

export type PersonalInfoData = z.infer<typeof personalInfoSchema>
export type EmploymentData = z.infer<typeof employmentSchema>
export type FinancialData = z.infer<typeof financialSchema>
export type LoanDetailsData = z.infer<typeof loanDetailsSchema>
export type CommitmentData = z.infer<typeof commitmentSchema>
export type FullInstallmentData = z.infer<typeof fullInstallmentSchema>

export const WIZARD_STEPS = [
  { id: 1, title: 'Cá nhân', description: 'Họ tên, CCCD, địa chỉ' },
  { id: 2, title: 'Nghề nghiệp', description: 'Công việc, đơn vị' },
  { id: 3, title: 'Tài chính', description: 'Thu nhập, chi phí' },
  { id: 4, title: 'Khoản vay', description: 'Giá xe, kỳ hạn' },
  { id: 5, title: 'Tài liệu', description: 'Upload giấy tờ' },
  { id: 6, title: 'Cam kết', description: 'Ký tên & đồng ý' },
  { id: 7, title: 'Xác nhận', description: 'Kiểm tra & gửi' },
] as const

export const STEP_SCHEMAS = [
  personalInfoSchema,
  employmentSchema,
  financialSchema,
  loanDetailsSchema,
  null,
  commitmentSchema,
  null,
]
