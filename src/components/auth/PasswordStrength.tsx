type Level = 'weak' | 'medium' | 'strong'

function getStrength(password: string): Level {
  if (!password) return 'weak'
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  return 'strong'
}

const labels: Record<Level, string> = {
  weak: 'Yếu',
  medium: 'Trung bình',
  strong: 'Mạnh',
}

const colors: Record<Level, string> = {
  weak: 'bg-red-500',
  medium: 'bg-amber-500',
  strong: 'bg-green-500',
}

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const level = getStrength(password)
  const width = level === 'weak' ? '33%' : level === 'medium' ? '66%' : '100%'

  return (
    <div className="mt-1">
      <div className="flex h-1.5 gap-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all ${colors[level]}`}
          style={{ width }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">{labels[level]}</p>
    </div>
  )
}
