'use client'

import { useActionState, useState } from 'react'
import type { Fighter } from '@/types/database'

const NATIONALITIES = [
  { code: 'ES', label: 'España' },
  { code: 'PT', label: 'Portugal' },
  { code: 'FR', label: 'Francia' },
  { code: 'GB', label: 'Reino Unido' },
  { code: 'MX', label: 'México' },
  { code: 'AR', label: 'Argentina' },
  { code: 'BR', label: 'Brasil' },
  { code: 'US', label: 'Estados Unidos' },
  { code: 'MA', label: 'Marruecos' },
  { code: 'TH', label: 'Tailandia' },
]

type State = { error?: string } | null

type Props = {
  action: (prevState: State, formData: FormData) => Promise<State>
  defaultValues?: Partial<Fighter>
  submitLabel?: string
}

export function FighterForm({ action, defaultValues, submitLabel = 'Guardar' }: Props) {
  const [state, formAction, pending] = useActionState(action, null)
  const [bioLength, setBioLength] = useState(defaultValues?.bio?.length ?? 0)

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-md bg-red-900/30 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      {/* Nombre */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#d4d4d8]">
          Nombre completo <span className="text-[#dc2626]">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={100}
          defaultValue={defaultValues?.name ?? ''}
          placeholder="Ej. Carlos Rodríguez"
          className="w-full rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 text-sm text-white placeholder-[#71717a] outline-none transition-colors focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
        />
      </div>

      {/* Nacionalidad */}
      <div>
        <label htmlFor="nationality" className="mb-1.5 block text-sm font-medium text-[#d4d4d8]">
          Nacionalidad
        </label>
        <select
          id="nationality"
          name="nationality"
          defaultValue={defaultValues?.nationality ?? 'ES'}
          className="w-full rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
        >
          {NATIONALITIES.map(({ code, label }) => (
            <option key={code} value={code}>
              {code} — {label}
            </option>
          ))}
        </select>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-[#d4d4d8]">
          Biografía{' '}
          <span className="font-normal text-[#71717a]">(opcional)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={defaultValues?.bio ?? ''}
          placeholder="Breve descripción del luchador, palmarés destacado…"
          onChange={(e) => setBioLength(e.target.value.length)}
          className="w-full resize-none rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 text-sm text-white placeholder-[#71717a] outline-none transition-colors focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
        />
        <p className="mt-1 text-right text-xs text-[#71717a]">
          {bioLength}/500
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Guardando…' : submitLabel}
      </button>
    </form>
  )
}
