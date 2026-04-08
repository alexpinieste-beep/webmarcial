'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createFighter } from '../actions'
import Link from 'next/link'

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

type ActionState = { error?: string; id?: string; slug?: string } | null

async function createFighterAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  return createFighter(formData)
}

export default function NuevoLuchadorPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(createFighterAction, null)
  const [bioLength, setBioLength] = useState(0)

  // Redirect to edit page after successful creation
  useEffect(() => {
    if (state?.id) {
      router.push(`/dashboard/luchadores/${state.id}/editar`)
    }
  }, [state, router])

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/luchadores"
          className="rounded-md p-1.5 text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white"
          aria-label="Volver"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Nuevo luchador</h1>
          <p className="text-sm text-[#a1a1aa]">Añade un luchador a tu gimnasio</p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6">
        <h2 className="mb-5 text-base font-semibold text-white">Datos básicos</h2>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="rounded-md border border-red-500/30 bg-red-900/30 px-4 py-3 text-sm text-red-400">
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
              defaultValue="ES"
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
              placeholder="Breve descripción del luchador, palmarés destacado…"
              onChange={(e) => setBioLength(e.target.value.length)}
              className="w-full resize-none rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2.5 text-sm text-white placeholder-[#71717a] outline-none transition-colors focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
            />
            <p className="mt-1 text-right text-xs text-[#71717a]">{bioLength}/500</p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Creando luchador…' : 'Crear luchador'}
          </button>
        </form>
      </div>

      {/* Sport profiles info */}
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] p-6">
        <h2 className="mb-2 text-base font-semibold text-white">Perfiles por deporte</h2>
        <p className="text-sm text-[#a1a1aa]">
          Podrás añadir sus récords por deporte (victorias, derrotas, empates, N/C) y categorías de peso
          después de crear el luchador.
        </p>
      </div>
    </div>
  )
}
