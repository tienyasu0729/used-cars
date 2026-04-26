import { Check } from 'lucide-react'
import { WIZARD_STEPS } from './installmentSchema'

interface Props {
  currentStep: number
  onStepClick?: (step: number) => void
}

export function WizardProgressBar({ currentStep, onStepClick }: Props) {
  return (
    <nav className="mb-8 overflow-x-auto" aria-label="Tiến trình đăng ký trả góp">
      <ol className="flex items-center min-w-[540px]">
        {WIZARD_STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.id
          const isActive = currentStep === step.id
          const isClickable = onStepClick && isCompleted
          const isLast = idx === WIZARD_STEPS.length - 1

          return (
            <li key={step.id} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`group flex flex-col items-center gap-1 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isActive
                        ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30'
                        : 'border-slate-300 bg-white text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <div className="hidden text-center sm:block">
                  <p className={`text-[11px] font-bold leading-tight ${
                    isActive ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-[9px] text-slate-400 hidden lg:block">{step.description}</p>
                </div>
              </button>

              {!isLast && (
                <div className="mx-1.5 h-0.5 flex-1">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
