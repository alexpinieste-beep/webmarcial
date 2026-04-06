import Link from 'next/link'
import Image from 'next/image'
import type { Fighter } from '@/types/database'
import { cn } from '@/lib/utils'

type FighterCardProps = {
  fighter: Fighter
  record?: { wins: number; losses: number; draws: number }
  position?: number
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const nationalityFlag: Record<string, string> = {
  ES: '🇪🇸',
  PT: '🇵🇹',
  FR: '🇫🇷',
  GB: '🇬🇧',
  US: '🇺🇸',
  BR: '🇧🇷',
  MX: '🇲🇽',
  // add more as needed
}

export function FighterCard({ fighter, record, position, className }: FighterCardProps) {
  const initials = getInitials(fighter.name)
  const flag = nationalityFlag[fighter.nationality] ?? ''

  return (
    <Link
      href={`/luchadores/${fighter.slug}`}
      className={cn(
        'group flex flex-col items-center rounded-xl bg-[#18181b] border border-zinc-800 p-5',
        'hover:border-red-600 transition-colors duration-200 text-center overflow-hidden',
        className
      )}
    >
      {/* Position number */}
      {position !== undefined && (
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-300 group-hover:bg-red-600 group-hover:text-white transition-colors">
          {position}
        </div>
      )}

      {/* Avatar */}
      <div className="relative mb-4 h-20 w-20 shrink-0 rounded-full overflow-hidden border-2 border-zinc-700 group-hover:border-red-600 transition-colors">
        {fighter.avatar_url ? (
          <Image
            src={fighter.avatar_url}
            alt={fighter.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800">
            <span className="text-xl font-bold text-zinc-300">{initials}</span>
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-[#ededed] group-hover:text-red-400 transition-colors line-clamp-2 mb-1">
        {fighter.name}
      </h3>

      {/* Nationality */}
      <p className="text-xs text-zinc-500 mb-3">
        {flag} {fighter.nationality}
      </p>

      {/* Record */}
      {record && (
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-green-400">{record.wins}V</span>
          <span className="text-zinc-600">·</span>
          <span className="text-red-400">{record.losses}D</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400">{record.draws}E</span>
        </div>
      )}
    </Link>
  )
}

export default FighterCard
