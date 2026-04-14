'use client'

import { useActionState, useState } from 'react'
import { createTitle } from './actions'
import type { Sport, WeightClass, Zone } from '@/types/database'

type Props = {
  sports: Sport[]
  allWeightClasses: WeightClass[]
  zones: Zone[]
}

export function CreateTitleForm({ sports, allWeightClasses, zones }: Props) {
  const [state, formAction, pending] = useActionState(createTitle, null)
  const [selectedSportId, setSelectedSportId] = useState('')

  const filteredWCs = selectedSportId
    ? allWeightClasses.filter((wc) => wc.sport_id === selectedSportId)
    : []

  const inputClass =
    'w-full rounded-md border border-[#27272a] bg-[#18181b] px-3 py-2 text-sm text-white placeholder-[#52525b] outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]'

  return (
    <div className="rounded-xl border border-[#27272a] bg-[#111111] p-5">
      <h2 className="mb-4 text-sm font-semibold text-white">Crear nuevo título</h2>

      {state?.error && (
        <div className="mb-4 rounded-md border border-red-800/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="mb-4 rounded-md border border-green-800/40 bg-green-950/30 px-4 py-3 text-sm text-green-400">
          {state.success}
        </div>
      )}

      <form action={formAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#a1a1aa]">Nombre *</label>
          <input name="name" required placeholder="Ej: Campeonato Nacional" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#a1a1aa]">Organización *</label>
          <input name="organization" required placeholder="Ej: FEDAM" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#a1a1aa]">Deporte *</label>
          <select
            name="sport_id"
            required
            value={selectedSportId}
            onChange={(e) => setSelectedSportId(e.target.value)}
            className={inputClass}
          >
            <option value="">Selecciona deporte</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#a1a1aa]">Categoría de peso *</label>
          <select
            name="weight_class_id"
            required
            disabled={!selectedSportId}
            className={`${inputClass} disabled:opacity-50`}
          >
            <option value="">
              {selectedSportId ? 'Selecciona categoría' : 'Elige deporte primero'}
            </option>
            {filteredWCs.map((wc) => (
              <option key={wc.id} value={wc.id}>{wc.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#a1a1aa]">Zona</label>
          <select name="zone_id" className={inputClass}>
            <option value="">Nacional</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Creando…' : 'Crear título'}
          </button>
        </div>
      </form>
    </div>
  )
}
