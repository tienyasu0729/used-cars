import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface DashboardStatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  subLabel?: string
  subLabelGreen?: boolean
  link?: string
  linkText?: string
}

export function DashboardStatCard({
  icon: Icon,
  label,
  value,
  subLabel,
  subLabelGreen,
  link,
  linkText,
}: DashboardStatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[#1A3C6E]">{value}</p>
        </div>
        <div className="rounded-lg bg-[#1A3C6E]/10 p-3 text-[#1A3C6E]">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {subLabel && (
        <p className={`mt-4 flex items-center text-xs font-medium ${subLabelGreen ? 'text-green-600' : 'text-slate-500'}`}>
          {subLabelGreen && (
            <svg className="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
          {subLabel}
        </p>
      )}
      {link && linkText && (
        <Link to={link} className="mt-2 block text-xs font-medium text-[#1A3C6E] hover:underline">
          {linkText}
        </Link>
      )}
    </div>
  )
}
