'use client'

import { useTransition } from 'react'
import { ShieldCheck, ShieldOff, Star, StarOff } from 'lucide-react'
import { verifyGym, featureGym, setGymPlan } from './actions'

type Tier = 'free' | 'basic' | 'pro'

type Props = {
  gymId: string
  isVerified: boolean
  isFeatured: boolean
  tier: Tier
}

export function GymActions({ gymId, isVerified, isFeatured, tier }: Props) {
  const [pending, startTransition] = useTransition()

  const btnBase =
    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Verify toggle */}
      <button
        disabled={pending}
        onClick={() => startTransition(() => verifyGym(gymId, !isVerified))}
        className={`${btnBase} ${
          isVerified
            ? 'border border-green-800/40 bg-green-950/30 text-green-400 hover:bg-green-950/60'
            : 'border border-[#27272a] bg-[#18181b] text-[#a1a1aa] hover:border-green-700 hover:text-green-400'
        }`}
      >
        {isVerified ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
        {isVerified ? 'Verificado' : 'Verificar'}
      </button>

      {/* Featured toggle */}
      <button
        disabled={pending}
        onClick={() => startTransition(() => featureGym(gymId, !isFeatured))}
        className={`${btnBase} ${
          isFeatured
            ? 'border border-amber-800/40 bg-amber-950/30 text-amber-400 hover:bg-amber-950/60'
            : 'border border-[#27272a] bg-[#18181b] text-[#a1a1aa] hover:border-amber-700 hover:text-amber-400'
        }`}
      >
        {isFeatured ? <Star size={13} /> : <StarOff size={13} />}
        {isFeatured ? 'Destacado' : 'Destacar'}
      </button>

      {/* Plan selector */}
      <select
        disabled={pending}
        value={tier}
        onChange={(e) =>
          startTransition(() => setGymPlan(gymId, e.target.value as Tier))
        }
        className="rounded-md border border-[#27272a] bg-[#18181b] px-2 py-1.5 text-xs text-[#a1a1aa] outline-none transition-colors hover:border-[#3f3f46] focus:border-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="free">Free</option>
        <option value="basic">Basic</option>
        <option value="pro">Pro</option>
      </select>
    </div>
  )
}
