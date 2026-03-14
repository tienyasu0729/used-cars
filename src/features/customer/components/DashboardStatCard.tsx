import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface DashboardStatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  subLabel?: string
  link?: string
  linkText?: string
}

export function DashboardStatCard({
  icon: Icon,
  label,
  value,
  subLabel,
  link,
  linkText,
}: DashboardStatCardProps) {
  const content = (
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-[#1A3C6E]">{value}</p>
        {subLabel && (
          <p className="mt-2 text-xs font-medium text-slate-500">{subLabel}</p>
        )}
      </div>
      <div className="rounded-lg bg-[#1A3C6E]/10 p-3 text-[#1A3C6E]">
        <Icon className="h-6 w-6" />
      </div>
    </div>
  )

  const card = (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {content}
      {link && linkText && (
        <Link
          to={link}
          className="mt-4 block text-xs font-medium text-[#1A3C6E] hover:underline"
        >
          {linkText}
        </Link>
      )}
    </div>
  )

  return card
}
