'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type NavItem = {
  href: string
  label: string
  icon: ReactNode
}

type Props = {
  items: NavItem[]
}

export function DashboardNav({ items }: Props) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-l-2 border-[#dc2626] bg-[#1c1c1c] pl-[10px] text-white'
                : 'text-[#a1a1aa] hover:bg-[#1c1c1c] hover:text-white'
            )}
          >
            <span className="flex-shrink-0 opacity-80">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
