'use client'

import { useState, useTransition } from 'react'
import { deleteSportProfile, upsertSportProfile } from '../../actions'
import type { FighterSportProfile, Sport, WeightClass } from '@/types/database'
import { useRouter } from 'next/navigation'

type Props = {
  fighterId: string
  profiles: FighterSportProfile[]
  sports: Sport[]
  allWeightClasses: WeightClass[]
}

function ProfileRow({
  profile,
  onDeleted,
}: {
  profile: FighterSportProfile
  onDeleted: () => void
}) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    const sportName = profile.sports?.name ?? 'este perfil'
    const confirmed = window.confirm(`¿Eliminar el perfil de ${sportName}?`)
    if (!confirmed) return

    startTransition(async () => {
      const result = await deleteSportProfile(profile.id)
      if (result?.error) {
        alert(`Error: ${result.error}`)
      } else {
        onDeleted()
      }
    })
  }

  const record = `${profile.wins}V – ${profile.losses}D – ${profile.draws}E – ${profile.no_contests}N/C`

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#27272a] bg-[#1c1c1c] px-4 py-3">
      <div>
        <p className="text-sm font-medium text-white">
          {profile.sports?.name ?? '—'}
          {' · '}
          <span className="text-[#a1a1aa]">{profile.weight_classes?.name ?? '—'}</span>
        </p>
        <p className="mt-0.5 text-xs text-[#71717a]">{record}</p>
      </div>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="flex-shrink-0 rounded-md border border-[#dc2626] px-3 py-1.5 text-xs font-medium text-[#dc2626] transition-colors hover:bg-[#dc2626] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? '…' : 'Eliminar'}
      </button>
    </div>
  )
}

export function SportProfilesSection({ fighterId, profiles: initialProfiles, sports, allWeightClasses }: Props) {
  const router = useRouter()
  const [profiles, setProfiles] = useState(initialProfiles)
  const [selectedSportId, setSelectedSportId] = useState('')
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState(false)

  const filteredWeightClasses = selectedSportId
    ? allWeightClasses.filter((wc) => wc.sport_id === selectedSportId)
    : []

  function handleDeleted() {
    router.refresh()
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setFormError(null)
    setFormSuccess(false)

    startTransition(async () => {
      const result = await upsertSportProfile(fighterId, formData)
      if (result?.error) {
        setFormError(result.error)
      } else {
        setFormSuccess(true)
        setSelectedSportId('')
        ;(e.target as HTMLFormElement).reset()
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Existing profiles */}
      {profiles.length === 0 ? (
        <p className="text-sm text-[#71717a]">No hay perfiles deportivos todavía.</p>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile) => (
            <ProfileRow key={profile.id} profile={profile} onDeleted={handleDeleted} />
          ))}
        </div>
      )}

      {/* Add profile form */}
      <div className="rounded-lg border border-[#27272a] bg-[#1c1c1c] p-4">
        <h3 className="mb-4 text-sm font-semibold text-[#d4d4d8]">Añadir perfil deportivo</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-md border border-red-500/30 bg-red-900/30 px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="rounded-md border border-green-500/30 bg-green-900/30 px-4 py-3 text-sm text-green-400">
              Perfil añadido correctamente.
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

          {/* Record inputs */}
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
                <label htmlFor={`add_${name}`} className="mb-1.5 block text-sm font-medium text-[#d4d4d8]">
                  {label}
                </label>
                <input
                  id={`add_${name}`}
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
            disabled={isPending || !selectedSportId}
            className="rounded-md bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Guardando…' : 'Añadir perfil'}
          </button>
        </form>
      </div>
    </div>
  )
}
