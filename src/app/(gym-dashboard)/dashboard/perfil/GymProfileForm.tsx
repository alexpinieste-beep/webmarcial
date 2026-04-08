'use client'

import { useActionState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateGymProfile, type UpdateGymProfileResult } from './actions'
import type { Zone, Sport, Gym } from '@/types/database'

type Props = {
  gym: Gym
  zones: Zone[]
  sports: Sport[]
}

const initialState: UpdateGymProfileResult = {}

export function GymProfileForm({ gym, zones, sports }: Props) {
  const [state, formAction, pending] = useActionState(
    updateGymProfile,
    initialState
  )

  const inputClass =
    'w-full rounded-md border border-[#3f3f46] bg-[#09090b] px-3 py-2 text-sm text-white placeholder-[#52525b] transition-colors focus:border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]/20 disabled:opacity-50'

  const labelClass = 'block text-sm font-medium text-[#d4d4d8]'

  const sectionClass =
    'rounded-lg border border-[#27272a] bg-[#18181b] p-6 space-y-5'

  return (
    <form action={formAction} className="space-y-6">
      {/* Success message */}
      {state.success && (
        <div className="flex items-center gap-2 rounded-lg border border-[#14532d] bg-[#14532d]/20 px-4 py-3 text-sm text-[#4ade80]">
          <Check size={16} />
          Cambios guardados correctamente.
        </div>
      )}

      {/* Error message */}
      {state.error && (
        <div className="rounded-lg border border-[#7f1d1d] bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
          {state.error}
        </div>
      )}

      {/* Sección 1: Información básica */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-white">
          Información básica
        </h2>

        <div className="space-y-1.5">
          <label htmlFor="name" className={labelClass}>
            Nombre del gimnasio <span className="text-[#dc2626]">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={gym.name}
            placeholder="Ej: Dragon Muay Thai"
            className={inputClass}
            disabled={pending}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className={labelClass}>
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={gym.description ?? ''}
            placeholder="Describe tu gimnasio, especialidades, historia..."
            className={cn(inputClass, 'resize-none')}
            disabled={pending}
            maxLength={500}
          />
          <p className="text-xs text-[#71717a]">Máximo 500 caracteres.</p>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>URL pública</label>
          <div className="flex items-center gap-2 rounded-md border border-[#27272a] bg-[#09090b] px-3 py-2">
            <span className="text-sm text-[#52525b]">webmarcial.com/gimnasios/</span>
            <span className="text-sm font-medium text-[#a1a1aa]">{gym.slug}</span>
          </div>
          <p className="text-xs text-[#71717a]">
            El slug no puede cambiarse. Contacta con soporte si necesitas modificarlo.
          </p>
        </div>
      </div>

      {/* Sección 2: Ubicación */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-white">Ubicación</h2>

        <div className="space-y-1.5">
          <label htmlFor="zone_id" className={labelClass}>
            Comunidad autónoma / Zona
          </label>
          <select
            id="zone_id"
            name="zone_id"
            defaultValue={gym.zone_id ?? ''}
            className={cn(inputClass, 'cursor-pointer')}
            disabled={pending}
          >
            <option value="">Selecciona una zona...</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="address" className={labelClass}>
            Dirección
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={gym.address ?? ''}
            placeholder="Calle, número, ciudad..."
            className={inputClass}
            disabled={pending}
          />
        </div>
      </div>

      {/* Sección 3: Contacto */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-white">Contacto</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="phone" className={labelClass}>
              Teléfono
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={gym.phone ?? ''}
              placeholder="+34 600 000 000"
              className={inputClass}
              disabled={pending}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className={labelClass}>
              Email de contacto
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={gym.email ?? ''}
              placeholder="info@tugimnasio.es"
              className={inputClass}
              disabled={pending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="website" className={labelClass}>
            Página web
          </label>
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={gym.website ?? ''}
            placeholder="https://tugimnasio.es"
            className={inputClass}
            disabled={pending}
          />
        </div>
      </div>

      {/* Sección 4: Redes sociales */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-white">Redes sociales</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="instagram" className={labelClass}>
              Instagram
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-[#52525b]">
                @
              </span>
              <input
                id="instagram"
                name="instagram"
                type="text"
                defaultValue={gym.instagram ?? ''}
                placeholder="nombregimnasio"
                className={cn(inputClass, 'pl-7')}
                disabled={pending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="facebook" className={labelClass}>
              Facebook
            </label>
            <input
              id="facebook"
              name="facebook"
              type="text"
              defaultValue={gym.facebook ?? ''}
              placeholder="URL o nombre de página"
              className={inputClass}
              disabled={pending}
            />
          </div>
        </div>
      </div>

      {/* Sección 5: Deportes */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-white">
          Deportes que impartes
        </h2>
        <p className="text-sm text-[#71717a]">
          Selecciona los deportes de contacto disponibles en tu gimnasio.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sports.map((sport) => {
            const checked = gym.sport_ids?.includes(sport.id) ?? false
            return (
              <label
                key={sport.id}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm transition-colors',
                  'border-[#3f3f46] hover:border-[#52525b]',
                  'has-[:checked]:border-[#dc2626]/50 has-[:checked]:bg-[#1c1212]'
                )}
              >
                <input
                  type="checkbox"
                  name="sport_ids"
                  value={sport.id}
                  defaultChecked={checked}
                  disabled={pending}
                  className="h-4 w-4 rounded border-[#3f3f46] bg-[#09090b] accent-[#dc2626]"
                />
                <span className="text-[#d4d4d8]">{sport.name}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
