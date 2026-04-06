import Link from 'next/link'
import { cn } from '@/lib/utils'

type SectionHeaderProps = {
  title: string
  subtitle?: string
  href?: string
  hrefLabel?: string
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  href,
  hrefLabel = 'Ver todo',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between mb-8', className)}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#ededed]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors shrink-0 ml-4"
        >
          {hrefLabel} &rarr;
        </Link>
      )}
    </div>
  )
}

export default SectionHeader
