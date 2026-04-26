/**
 * InstallmentCalculatorWidget — Công cụ dự toán trả góp xe
 *
 * Hiển thị tại trang chi tiết xe cho khách vãng lai.
 * Tính toán 100% client-side, không cần API.
 */
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calculator, TrendingDown, Clock, Percent, ChevronDown, ChevronUp, CreditCard, ArrowRight } from 'lucide-react'
import { formatPriceNumber } from '@/utils/format'

interface Props {
  vehiclePrice: number
  vehicleId: number
}

const INTEREST_RATES = [6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0]
const TERM_OPTIONS = [12, 24, 36, 48, 60, 72, 84]
const PREPAYMENT_PERCENTS = [20, 30, 40, 50, 60, 70]

export function InstallmentCalculatorWidget({ vehiclePrice, vehicleId }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [prepaymentPercent, setPrepaymentPercent] = useState(30)
  const [termMonths, setTermMonths] = useState(60)
  const [interestRate, setInterestRate] = useState(7.5)

  const calculation = useMemo(() => {
    const prepayment = (vehiclePrice * prepaymentPercent) / 100
    const loanAmount = vehiclePrice - prepayment
    const monthlyRate = interestRate / 100 / 12

    // PMT formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    let monthlyPayment: number
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / termMonths
    } else {
      const factor = Math.pow(1 + monthlyRate, termMonths)
      monthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1)
    }

    const totalPayment = monthlyPayment * termMonths
    const totalInterest = totalPayment - loanAmount

    return {
      prepayment,
      loanAmount,
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
    }
  }, [vehiclePrice, prepaymentPercent, termMonths, interestRate])

  return (
    <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/[0.03] to-white overflow-hidden transition-all duration-300">
      {/* Header — luôn hiển thị */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-5 text-left cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Dự toán trả góp</h3>
            <p className="text-xs text-slate-500">
              Từ <span className="font-bold text-accent">{formatPriceNumber(calculation.monthlyPayment)}</span> VNĐ/tháng
            </p>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-slate-200">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-600" />
          )}
        </div>
      </button>

      {/* Body — mở rộng */}
      {isExpanded && (
        <div className="border-t border-primary/10 px-5 pb-5 pt-4 space-y-5 animate-in slide-in-from-top-2 duration-200">
          {/* Trả trước */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <TrendingDown className="h-4 w-4 text-primary" />
              Trả trước
            </label>
            <div className="flex flex-wrap gap-2">
              {PREPAYMENT_PERCENTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrepaymentPercent(p)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all cursor-pointer ${
                    prepaymentPercent === p
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              = {formatPriceNumber(calculation.prepayment)} VNĐ
            </p>
          </div>

          {/* Kỳ hạn */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Clock className="h-4 w-4 text-primary" />
              Kỳ hạn vay
            </label>
            <div className="flex flex-wrap gap-2">
              {TERM_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTermMonths(t)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all cursor-pointer ${
                    termMonths === t
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t} tháng
                </button>
              ))}
            </div>
          </div>

          {/* Lãi suất */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Percent className="h-4 w-4 text-primary" />
              Lãi suất / năm
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_RATES.map((r) => (
                <button
                  key={r}
                  onClick={() => setInterestRate(r)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all cursor-pointer ${
                    interestRate === r
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* Kết quả */}
          <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-5 text-white">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm font-semibold opacity-90">Ước tính hàng tháng</span>
            </div>
            <p className="text-3xl font-black tracking-tight">
              {formatPriceNumber(calculation.monthlyPayment)}
              <span className="ml-1 text-base font-medium opacity-80">VNĐ/tháng</span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide opacity-70">Số tiền vay</p>
                <p className="mt-0.5 text-sm font-bold">{formatPriceNumber(calculation.loanAmount)} đ</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide opacity-70">Tổng trả</p>
                <p className="mt-0.5 text-sm font-bold">{formatPriceNumber(calculation.totalPayment)} đ</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide opacity-70">Tổng lãi</p>
                <p className="mt-0.5 text-sm font-bold text-amber-300">{formatPriceNumber(calculation.totalInterest)} đ</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide opacity-70">Trả trước</p>
                <p className="mt-0.5 text-sm font-bold">{formatPriceNumber(calculation.prepayment)} đ</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-400">
            * Kết quả chỉ mang tính tham khảo. Lãi suất và điều kiện vay thực tế tùy thuộc vào ngân hàng và hồ sơ tín dụng của bạn.
          </p>

          <Link
            to={`/dashboard/installment/${vehicleId}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3.5 text-sm font-bold text-white shadow-sm shadow-accent/20 transition-colors hover:bg-accent/90 cursor-pointer"
          >
            Đăng ký trả góp
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
