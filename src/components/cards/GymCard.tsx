import Link from 'next/link'
import type { Gym } from '@/types/database'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

type GymCardProps = {
  gym: Gym
  className?: string
}

const tierLabel: Record<Gym['subscription_tier'], string> = {
  free: 'Básico',
  basic: 'Estándar',
  pro: 'Pro',
}

export function GymCard({ gym, className }: GymCardProps) {
  return (
    <Link
      href={`/gimnasios/${gym.slug}`}
      className={cn(
        'group flex flex-col rounded-xl bg-[#18181b] border border-zinc-800',
        'hover:border-red-600 transition-colors duration-200 overflow-hidden',
        className
      )}
    >
      <div className="flex flex-col flex-1 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-base font-semibold text-[#ededed] group-hover:text-red-400 transition-colors line-clamp-2 flex-1">
            {gym.name}
          </h3>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {gym.is_featured && (
              <Badge variant="featured">Destacado</Badge>
            )}
            {gym.subscription_tier === 'pro' && (
              <Badge variant="pro">{tierLabel[gym.subscription_tier]}</Badge>
            )}
            {gym.subscription_tier === 'basic' && (
              <Badge variant="basic">{tierLabel[gym.subscription_tier]}</Badge>
            )}
          </div>
        </div>

        {/* Zone */}
        {gym.zones && (
          <p className="text-xs text-zinc-400 mb-2">
            <span className="text-zinc-500">Zona:</span>{' '}
            <span className="text-zinc-300">{gym.zones.name}</span>
          </p>
        )}

        {/* Address */}
        {gym.address && (
          <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
            {gym.address}
          </p>
        )}

        {/* Description */}
        {gym.description && (
          <p className="text-sm text-zinc-400 line-clamp-3 flex-1">
            {gym.description}
          </p>
        )}
      </div>

      {/* Bottom accent */}
      <div className="h-0.5 w-0 bg-red-600 group-hover:w-full transition-all duration-300" />
    </Link>
  )
}
