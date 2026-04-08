'use client'

import { useState, useActionState } from 'react'
import { upsertSportProfile } from '@/app/(gym-dashboard)/dashboard/luchadores/actions'
import type { Sport, WeightClass } from '@/types/database'

type State = { error?: string } | null

type Props = {
  fighterId: string
  sports: Sport[]
  allWeightClasses: WeightClass[]
}

export function SportProfileForm({ fighterId, sports, allWeightClasses }: Props) {
  const [selectedSportId, setSelectedSportId] = useState<string>('')

  const filteredWeightClasses = selectedSportId
    ? allWeightClasses.filter((wc) => wc.sport_id === selectedSportId)
    : []

  async function action(_prevState: State, formData: FormData): Promise<State> {
    return upsertSportProfile(fighterId, formData)
  }

  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md border border-red-500/30 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Deporte */}
        <div>
          <label htmlFor="sport_id" className="mb-1.5 block text-sm font-medium text-[#d4d4d8]">
            Deporte <span className="text-[#dc2626]">*</span>
          </label>
          <select
            id="sport_id"
            name="sport_id"
            required
            value={selectedSportId}
            onChange={(e) => setSelectedSportId(e.target.value)}
            className="w-full rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
          >
            <option value="">Selecciona un deporte</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.id}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría de peso */}
        <div>
          <label htmlFor="weight_class_id" className="mb-1.5 block text-sm font-medium text-[#d4d4d8]">
            Categoría de peso <span className="text-[#dc2626]">*</span>
          </label>
          <select
            id="weight_class_id"
            name="weight_class_id"
            required
            disabled={!selectedSportId}
            className="w-full rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {selectedSportId ? 'Selecciona categoría' : 'Elige deporte primero'}
            </option>
            {filteredWeightClasses.map((wc) => (
              <option key={wc.id} value={wc.id}>
                {wc.name}
                {wc.max_weight_kg != null ? ` (hasta ${wc.max_weight_kg} kg)` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Récord */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(
          [
            { name: 'wins', label: 'Victorias' },
            { name: 'losses', label: 'Derrotas' },
            { name: 'draws', label: 'Empates' },
            { name: 'no_contests', label: 'N/C' },
          ] as const
        ).map(({ name, label }) => (
          <div key={name}>
            <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-[#d4d4d8]">
              {label}
            </label>
            <input
              id={name}
              name={name}
              type="number"
              min={0}
              defaultValue={0}
              required
              className="w-full rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
            />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={pending || !selectedSportId}
        className="rounded-md bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Guardando…' : 'Añadir perfil'}
      </button>
    </form>
  )
}
