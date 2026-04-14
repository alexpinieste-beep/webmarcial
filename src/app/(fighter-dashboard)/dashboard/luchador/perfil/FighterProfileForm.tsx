'use client'

import { useActionState } from 'react'
import { updateFighterProfile } from './actions'
import type { Fighter } from '@/types/database'

const nationalities = [
  { code: 'ES', label: '🇪🇸 España' },
  { code: 'PT', label: '🇵🇹 Portugal' },
  { code: 'FR', label: '🇫🇷 Francia' },
  { code: 'GB', label: '🇬🇧 Reino Unido' },
  { code: 'US', label: '🇺🇸 Estados Unidos' },
  { code: 'BR', label: '🇧🇷 Brasil' },
  { code: 'MX', label: '🇲🇽 México' },
  { code: 'AR', label: '🇦🇷 Argentina' },
  { code: 'DE', label: '🇩🇪 Alemania' },
  { code: 'IT', label: '🇮🇹 Italia' },
  { code: 'MA', label: '🇲🇦 Marruecos' },
  { code: 'DZ', label: '🇩🇿 Argelia' },
  { code: 'SN', label: '🇸🇳 Senegal' },
  { code: 'TH', label: '🇹🇭 Tailandia' },
  { code: 'JP', label: '🇯🇵 Japón' },
  { code: 'KR', label: '🇰🇷 Corea' },
]

export default function FighterProfileForm({ fighter }: { fighter: Fighter }) {
  const [state, formAction, isPending] = useActionState(updateFighterProfile, null)

  const inputClass =
    'w-full rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-2.5 text-sm text-white placeholder-[#52525b] outline-none transition focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]'
  const labelClass = 'mb-1.5 block text-sm font-medium text-[#a1a1aa]'

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#111111] p-7">
      {state?.error && (
        <div className="mb-5 rounded-lg border border-red-800/40 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="mb-5 rounded-lg border border-green-800/40 bg-green-950/40 px-4 py-3 text-sm text-green-400">
          {state.success}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {/* Nombre */}
        <div>
          <label htmlFor="name" className={labelClass}>
            Nombre completo *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={fighter.name}
            className={inputClass}
          />
        </div>

        {/* Nivel */}
        <div>
          <label className={labelClass}>Nivel de competición *</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-3 transition has-[:checked]:border-[#dc2626] has-[:checked]:bg-[#1a0a0a]">
              <input
                type="radio"
                name="level"
                value="amateur"
                defaultChecked={fighter.level === 'amateur'}
                className="accent-[#dc2626]"
              />
              <div>
                <p className="text-sm font-medium text-white">Amateur</p>
                <p className="text-xs text-[#71717a]">No profesional</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-3 transition has-[:checked]:border-[#dc2626] has-[:checked]:bg-[#1a0a0a]">
              <input
                type="radio"
                name="level"
                value="professional"
                defaultChecked={fighter.level === 'professional'}
                className="accent-[#dc2626]"
              />
              <div>
                <p className="text-sm font-medium text-white">Profesional</p>
                <p className="text-xs text-[#71717a]">Profesional</p>
              </div>
            </label>
          </div>
        </div>

        {/* Nacionalidad */}
        <div>
          <label htmlFor="nationality" className={labelClass}>
            Nacionalidad *
          </label>
          <select
            id="nationality"
            name="nationality"
            defaultValue={fighter.nationality}
            className={inputClass}
          >
            {nationalities.map((n) => (
              <option key={n.code} value={n.code}>
                {n.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className={labelClass}>
            Biografía <span className="text-[#52525b]">(opcional)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            defaultValue={fighter.bio ?? ''}
            placeholder="Cuéntanos tu historia..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Gym info (read-only) */}
        {fighter.gyms && (
          <div className="rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-3">
            <p className="text-xs text-[#71717a]">Gimnasio vinculado</p>
            <p className="mt-0.5 text-sm font-medium text-white">{fighter.gyms.name}</p>
            <p className="mt-1 text-xs text-[#52525b]">
              El cambio de gimnasio lo gestiona el administrador.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-[#dc2626] px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
