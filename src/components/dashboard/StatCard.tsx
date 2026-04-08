import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type Props = {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  accent?: boolean
}

export function StatCard({ title, value, subtitle, icon, accent }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-5',
        accent
          ? 'border-[#dc2626]/40 bg-[#1c1212]'
          : 'border-[#27272a] bg-[#18181b]'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-[#a1a1aa]">{title}</p>
        {icon && (
          <span
            className={cn(
              'flex-shrink-0',
              accent ? 'text-[#dc2626]' : 'text-[#52525b]'
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className={cn(
          'text-2xl font-bold leading-none',
          accent ? 'text-[#dc2626]' : 'text-white'
        )}
      >
        {value}
      </p>
      {subtitle && <p className="text-xs text-[#71717a]">{subtitle}</p>}
    </div>
  )
}
