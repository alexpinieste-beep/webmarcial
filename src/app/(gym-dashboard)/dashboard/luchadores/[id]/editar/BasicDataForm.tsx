'use client'

import { useState, useTransition } from 'react'
import { updateFighter } from '../../actions'
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

type Props = { fighter: Fighter }

export function BasicDataForm({ fighter }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [bioLength, setBioLength] = useState(fighter.bio?.length ?? 0)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    setSaved(false)

    startTransition(async () => {
      const result = await updateFighter(fighter.id, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSaved(true)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-md border border-green-500/30 bg-green-900/30 px-4 py-3 text-sm text-green-400">
          Cambios guardados correctamente.
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
          defaultValue={fighter.name}
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
          defaultValue={fighter.nationality}
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
          Biografía <span className="font-normal text-[#71717a]">(opcional)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={fighter.bio ?? ''}
          onChange={(e) => setBioLength(e.target.value.length)}
          className="w-full resize-none rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 text-sm text-white placeholder-[#71717a] outline-none transition-colors focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
        />
        <p className="mt-1 text-right text-xs text-[#71717a]">{bioLength}/500</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}
