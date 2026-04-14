'use client'

import { useTransition } from 'react'
import { toggleTitleActive, assignChampion, vacateTitle } from './actions'

type Fighter = { id: string; name: string }

type Props = {
  titleId: string
  isActive: boolean
  currentChampionId: string | null
  fighters: Fighter[]
}

export function TitleActions({ titleId, isActive, currentChampionId, fighters }: Props) {
  const [pending, startTransition] = useTransition()

  const btnBase =
    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Active toggle */}
      <button
        disabled={pending}
        onClick={() => startTransition(() => toggleTitleActive(titleId, !isActive))}
        className={`${btnBase} border ${
          isActive
            ? 'border-green-800/40 bg-green-950/30 text-green-400 hover:bg-green-950/60'
            : 'border-[#27272a] bg-[#18181b] text-[#a1a1aa] hover:border-green-700 hover:text-green-400'
        }`}
      >
        {isActive ? 'Activo' : 'Inactivo'}
      </button>

      {/* Assign champion */}
      <select
        disabled={pending}
        value={currentChampionId ?? ''}
        onChange={(e) => {
          const val = e.target.value
          if (!val) {
            startTransition(() => vacateTitle(titleId))
          } else {
            startTransition(() => assignChampion(titleId, val))
          }
        }}
        className="rounded-md border border-[#27272a] bg-[#18181b] px-2 py-1.5 text-xs text-[#a1a1aa] outline-none transition-colors hover:border-[#3f3f46] focus:border-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50 max-w-[200px]"
      >
        <option value="">Sin campeón</option>
        {fighters.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </div>
  )
}
