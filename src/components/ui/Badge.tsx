import { cn } from '@/lib/utils'

type BadgeVariant =
  | 'default'
  | 'featured'
  | 'pro'
  | 'basic'
  | 'upcoming'
  | 'completed'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-zinc-700 text-zinc-200',
  featured: 'bg-red-600 text-white',
  pro: 'bg-amber-500 text-black font-semibold',
  basic: 'bg-zinc-600 text-zinc-200',
  upcoming: 'bg-green-600 text-white',
  completed: 'bg-zinc-600 text-zinc-300',
}

type BadgeProps = {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
