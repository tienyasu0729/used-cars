import { z } from 'zod'
import { isValidDdMmYyyyOrEmpty } from '@/utils/dateDdMmYyyy'

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  identityNumber: z.string().regex(/^\d{9,12}$/, 'CCCD/CMND phải có 9-12 chữ số'),
  phoneNumber: z.string().regex(/^(0|\+84)\d{9}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ'),
  dob: z.string().min(1, 'Ngày sinh là bắt buộc').refine(isValidDdMmYyyyOrEmpty, 'Ngày sinh phải theo định dạng dd/mm/yyyy'),
  identityIssuedDate: z.string().min(1, 'Ngày cấp CCCD là bắt buộc').refine(isValidDdMmYyyyOrEmpty, 'Ngày cấp phải theo định dạng dd/mm/yyyy'),
  identityIssuedPlace: z.string().min(1, 'Nơi cấp CCCD là bắt buộc').max(200),
  permanentAddress: z.string().min(1, 'Địa chỉ thường trú là bắt buộc').max(500),
  currentAddress: z.string().max(500).optional().default(''),
})

export const employmentSchema = z.object({
  employmentType: z.enum(['SALARIED', 'SELF_EMPLOYED', 'FREELANCE', 'RETIRED', 'OTHER']),
  employmentTypeOther: z.string().max(100).optional().default(''),
  companyName: z.string().min(1, 'Tên công ty / đơn vị là bắt buộc').max(200),
  jobTitle: z.string().max(100).optional().default(''),
  workDuration: z.string().max(50).optional().default(''),
  salaryMethod: z.string().max(50).optional().default(''),
  businessName: z.string().max(200).optional().default(''),
  businessType: z.string().max(100).optional().default(''),
  businessDuration: z.string().max(50).optional().default(''),
}).superRefine((data, ctx) => {
  if (data.employmentType === 'OTHER' && !data.employmentTypeOther.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vui lòng nhập loại hình công việc cụ thể.',
      path: ['employmentTypeOther'],
    })
  }
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
  loanAmount: z.coerce.number().min(0, 'Số tiền vay không hợp lệ'),
  loanTermMonths: z.coerce.number().min(6, 'Tối thiểu 6 tháng').max(84, 'Tối đa 84 tháng'),
  repaymentMethod: z.string().min(1, 'Chọn phương thức trả nợ'),
  bankCode: z.enum(['VCB', 'TCB', 'BIDV', 'VPB', 'ACB', 'MB', 'VIB', 'SACOMBANK'], {
    errorMap: () => ({ message: 'Chọn ngân hàng hỗ trợ' }),
  }),
}).superRefine((data, ctx) => {
  if (data.prepaymentAmount > data.vehiclePrice) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Số tiền trả trước không được lớn hơn giá xe.',
      path: ['prepaymentAmount'],
    })
  }
  if (data.loanAmount > data.vehiclePrice - data.prepaymentAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Số tiền vay không được lớn hơn phần còn lại của giá xe.',
      path: ['loanAmount'],
    })
  }
})

export const commitmentSchema = z.object({
  agreedTerms: z.boolean().refine((v) => v === true, { message: 'Bạn phải cam kết thông tin chính xác' }),
  agreedPrivacy: z.boolean().refine((v) => v === true, { message: 'Bạn phải đồng ý điều khoản bảo mật' }),
  signedDate: z.string().min(1, 'Ngày ký là bắt buộc').refine(isValidDdMmYyyyOrEmpty, 'Ngày ký phải theo định dạng dd/mm/yyyy'),
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
