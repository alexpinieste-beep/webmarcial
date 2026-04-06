import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Ranking } from '@/types/database'

type Props = {
  rankings: Ranking[]
  showZone?: boolean
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black">
        1
      </span>
    )
  }
  if (position === 2) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-black">
        2
      </span>
    )
  }
  if (position === 3) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-white">
        3
      </span>
    )
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center text-sm font-medium text-gray-400">
      {position}
    </span>
  )
}

function FighterAvatar({
  name,
  avatarUrl,
}: {
  name: string
  avatarUrl: string | null
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover"
      />
    )
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#27272a] text-xs font-semibold text-gray-300">
      {initials}
    </span>
  )
}

export default function RankingsTable({ rankings, showZone = false }: Props) {
  if (rankings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-[#27272a] bg-[#18181b] px-6 py-16 text-center">
        <p className="text-lg font-medium text-gray-300">Sin rankings disponibles</p>
        <p className="mt-2 text-sm text-gray-500">
          No hay luchadores en este ranking para los filtros seleccionados.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#27272a]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#27272a] bg-[#18181b]">
            <th className="px-4 py-3 text-left font-medium text-gray-400">#</th>
            <th className="px-4 py-3 text-left font-medium text-gray-400">Luchador</th>
            <th className="hidden px-4 py-3 text-left font-medium text-gray-400 sm:table-cell">
              Categoría
            </th>
            {showZone && (
              <th className="hidden px-4 py-3 text-left font-medium text-gray-400 md:table-cell">
                Zona
              </th>
            )}
            <th className="px-4 py-3 text-right font-medium text-gray-400">Puntos</th>
          </tr>
        </thead>
        <tbody className="bg-[#18181b]">
          {rankings.map((ranking, index) => {
            const fighter = ranking.fighters
            const weightClass = ranking.weight_classes
            const zone = ranking.zones

            if (!fighter) return null

            return (
              <tr
                key={ranking.id}
                className={cn(
                  'border-b border-[#27272a] transition-colors hover:bg-[#27272a]',
                  index === rankings.length - 1 && 'border-b-0'
                )}
              >
                <td className="px-4 py-3">
                  <PositionBadge position={ranking.position} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FighterAvatar
                      name={fighter.name}
                      avatarUrl={fighter.avatar_url}
                    />
                    <div>
                      <Link
                        href={`/luchadores/${fighter.slug}`}
                        className="font-medium text-white hover:text-[#dc2626] transition-colors"
                      >
                        {fighter.name}
                      </Link>
                      <p className="text-xs text-gray-500">{fighter.nationality}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="text-gray-300">
                    {weightClass?.name ?? '—'}
                  </span>
                </td>
                {showZone && (
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-gray-300">
                      {zone?.name ?? 'Nacional'}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-white">
                    {ranking.points.toLocaleString('es-ES')}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
