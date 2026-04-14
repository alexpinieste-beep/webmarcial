'use client'

import { useTransition } from 'react'
import { ShieldCheck, ShieldOff } from 'lucide-react'
import { verifyFighter, assignGym } from './actions'

type Gym = { id: string; name: string }

type Props = {
  fighterId: string
  isVerified: boolean
  currentGymId: string | null
  gyms: Gym[]
}

export function FighterActions({ fighterId, isVerified, currentGymId, gyms }: Props) {
  const [pending, startTransition] = useTransition()

  const btnBase =
    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Verify toggle */}
      <button
        disabled={pending}
        onClick={() => startTransition(() => verifyFighter(fighterId, !isVerified))}
        className={`${btnBase} ${
          isVerified
            ? 'border border-green-800/40 bg-green-950/30 text-green-400 hover:bg-green-950/60'
            : 'border border-[#27272a] bg-[#18181b] text-[#a1a1aa] hover:border-green-700 hover:text-green-400'
        }`}
      >
        {isVerified ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
        {isVerified ? 'Verificado' : 'Verificar'}
      </button>

      {/* Gym selector */}
      <select
        disabled={pending}
        value={currentGymId ?? ''}
        onChange={(e) =>
          startTransition(() => assignGym(fighterId, e.target.value || null))
        }
        className="rounded-md border border-[#27272a] bg-[#18181b] px-2 py-1.5 text-xs text-[#a1a1aa] outline-none transition-colors hover:border-[#3f3f46] focus:border-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50 max-w-[180px]"
      >
        <option value="">Sin gimnasio</option>
        {gyms.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  )
}
