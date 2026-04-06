import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Fight } from '@/types/database'

type Props = {
  fight: Fight
  isMain?: boolean
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function Avatar({
  name,
  avatarUrl,
  size,
}: {
  name: string
  avatarUrl: string | null
  size: 'sm' | 'lg'
}) {
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm'

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={cn(
          'rounded-full object-cover ring-2 ring-[#262626]',
          sizeClass
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-[#27272a] font-bold text-gray-400 ring-2 ring-[#262626]',
        sizeClass
      )}
    >
      {getInitials(name)}
    </div>
  )
}

function ResultLabel({ fight }: { fight: Fight }) {
  if (fight.result === 'pending') return null

  const isDraw = fight.result === 'draw'
  const isNoContest = fight.result === 'no_contest'

  if (isDraw) {
    return (
      <span className="text-xs font-medium text-yellow-400">
        Empate
        {fight.method ? ` · ${fight.method}` : ''}
      </span>
    )
  }

  if (isNoContest) {
    return (
      <span className="text-xs font-medium text-gray-400">
        Sin resultado
      </span>
    )
  }

  const parts: string[] = []
  if (fight.method) parts.push(fight.method)
  if (fight.round) parts.push(`R${fight.round}`)
  if (fight.time) parts.push(fight.time)

  return (
    <span className="text-xs font-medium text-gray-400">
      {parts.join(' · ')}
    </span>
  )
}

export default function FightCard({ fight, isMain = false }: Props) {
  const fighterA = fight.fighter_a
  const fighterB = fight.fighter_b
  const weightClass = fight.weight_classes

  if (!fighterA || !fighterB) return null

  const isPending = fight.result === 'pending'
  const aWon = fight.result === 'fighter_a_win'
  const bWon = fight.result === 'fighter_b_win'

  const avatarSize = isMain ? 'lg' : 'sm'

  return (
    <div
      className={cn(
        'rounded-xl border bg-[#18181b] p-4',
        isMain
          ? 'border-[#dc2626]/30 bg-gradient-to-b from-[#1a0a0a] to-[#18181b] shadow-lg shadow-[#dc2626]/5'
          : 'border-[#262626]'
      )}
    >
      {isMain && (
        <div className="mb-3 flex items-center gap-2">
          <span className="h-px flex-1 bg-[#dc2626]/20" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#dc2626]">
            Combate estelar
          </span>
          <span className="h-px flex-1 bg-[#dc2626]/20" />
        </div>
      )}

      {/* Weight class */}
      {weightClass && (
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
          {weightClass.name}
          {weightClass.gender !== 'open' && (
            <span className="ml-1 text-gray-600">
              · {weightClass.gender === 'male' ? 'Masculino' : 'Femenino'}
            </span>
          )}
        </p>
      )}

      {/* Fighters row */}
      <div className="flex items-center justify-between gap-2">
        {/* Fighter A */}
        <Link
          href={`/luchadores/${fighterA.slug}`}
          className="group flex flex-1 flex-col items-center gap-2 text-center"
        >
          <Avatar
            name={fighterA.name}
            avatarUrl={fighterA.avatar_url}
            size={avatarSize}
          />
          <span
            className={cn(
              'text-sm font-semibold leading-tight transition-colors group-hover:text-[#dc2626]',
              isPending && 'text-white',
              aWon && 'text-emerald-400',
              bWon && 'text-gray-500',
              (fight.result === 'draw' || fight.result === 'no_contest') &&
                'text-gray-300'
            )}
          >
            {fighterA.name}
            {aWon && (
              <span className="ml-1 text-xs font-normal text-emerald-500">
                (W)
              </span>
            )}
          </span>
        </Link>

        {/* VS / Result center */}
        <div className="flex flex-col items-center gap-1">
          {isPending ? (
            <span
              className={cn(
                'font-black tracking-tight text-[#dc2626]',
                isMain ? 'text-2xl' : 'text-lg'
              )}
            >
              VS
            </span>
          ) : (
            <span
              className={cn(
                'font-black text-gray-500',
                isMain ? 'text-2xl' : 'text-lg'
              )}
            >
              VS
            </span>
          )}
          <ResultLabel fight={fight} />
        </div>

        {/* Fighter B */}
        <Link
          href={`/luchadores/${fighterB.slug}`}
          className="group flex flex-1 flex-col items-center gap-2 text-center"
        >
          <Avatar
            name={fighterB.name}
            avatarUrl={fighterB.avatar_url}
            size={avatarSize}
          />
          <span
            className={cn(
              'text-sm font-semibold leading-tight transition-colors group-hover:text-[#dc2626]',
              isPending && 'text-white',
              bWon && 'text-emerald-400',
              aWon && 'text-gray-500',
              (fight.result === 'draw' || fight.result === 'no_contest') &&
                'text-gray-300'
            )}
          >
            {fighterB.name}
            {bWon && (
              <span className="ml-1 text-xs font-normal text-emerald-500">
                (W)
              </span>
            )}
          </span>
        </Link>
      </div>
    </div>
  )
}
