'use client'

import { useActionState } from 'react'
import { createGym, type CreateGymState } from './actions'

// Zonas estáticas para el select — cargadas en el servidor sería mejor pero
// este es un paso de onboarding puntual y se puede completar en el perfil
const ZONAS = [
  { value: '', label: 'Selecciona tu comunidad autónoma' },
  { value: 'andalucia', label: 'Andalucía' },
  { value: 'aragon', label: 'Aragón' },
  { value: 'asturias', label: 'Asturias' },
  { value: 'baleares', label: 'Baleares' },
  { value: 'canarias', label: 'Canarias' },
  { value: 'cantabria', label: 'Cantabria' },
  { value: 'castilla-la-mancha', label: 'Castilla-La Mancha' },
  { value: 'castilla-y-leon', label: 'Castilla y León' },
  { value: 'cataluna', label: 'Cataluña' },
  { value: 'extremadura', label: 'Extremadura' },
  { value: 'galicia', label: 'Galicia' },
  { value: 'la-rioja', label: 'La Rioja' },
  { value: 'madrid', label: 'Madrid' },
  { value: 'murcia', label: 'Murcia' },
  { value: 'navarra', label: 'Navarra' },
  { value: 'pais-vasco', label: 'País Vasco' },
  { value: 'valencia', label: 'Valencia' },
  { value: 'ceuta', label: 'Ceuta' },
  { value: 'melilla', label: 'Melilla' },
]

const inputClass =
  'w-full rounded-md border border-[#3f3f46] bg-[#27272a] px-3 py-2 text-sm text-[#ededed] placeholder-[#71717a] focus:border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]'

export default function RegistroGimnasioPage() {
  const [state, formAction, pending] = useActionState<CreateGymState, FormData>(
    createGym,
    null
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-1 text-2xl font-bold tracking-tight">
            <span className="text-[#dc2626]">Web</span>
            <span className="text-white">Marcial</span>
          </a>
        </div>

        <div className="rounded-xl border border-[#27272a] bg-[#111111] p-8">
          <h1 className="text-xl font-bold text-white">Registra tu gimnasio</h1>
          <p className="mt-1 text-sm text-[#71717a]">
            Crea el perfil de tu gimnasio. Incluye el plan{' '}
            <span className="font-semibold text-[#93c5fd]">Basic gratis</span> con leads ilimitados.
          </p>

          {/* Included features */}
          <div className="mt-4 rounded-lg border border-[#1d4ed8]/30 bg-[#1e3a8a]/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#93c5fd]">
              Incluido en tu plan Basic gratuito
            </p>
            <ul className="mt-2 space-y-1 text-xs text-[#a1a1aa]">
              <li>✓ Perfil público en el directorio</li>
              <li>✓ Luchadores ilimitados</li>
              <li>✓ Formulario de contacto (leads)</li>
              <li>✓ Galería de 10 imágenes</li>
              <li>✓ Analytics básico</li>
            </ul>
          </div>

          <form action={formAction} className="mt-6 space-y-4">
            {/* Nombre */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium text-[#ededed]">
                Nombre del gimnasio <span className="text-[#dc2626]">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Ej: Fight Club Madrid"
                className={inputClass}
              />
            </div>

            {/* Zona */}
            <div className="space-y-1">
              <label htmlFor="zone_id" className="text-sm font-medium text-[#ededed]">
                Comunidad autónoma
              </label>
              <select id="zone_id" name="zone_id" className={inputClass}>
                {ZONAS.map((z) => (
                  <option key={z.value} value={z.value} className="bg-[#27272a]">
                    {z.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#52525b]">Podrás cambiarlo después en tu perfil.</p>
            </div>

            {/* Dirección */}
            <div className="space-y-1">
              <label htmlFor="address" className="text-sm font-medium text-[#ededed]">
                Dirección
              </label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="Calle, número, ciudad"
                className={inputClass}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-1">
              <label htmlFor="phone" className="text-sm font-medium text-[#ededed]">
                Teléfono de contacto
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+34 600 000 000"
                className={inputClass}
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-400" role="alert">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b91c1c] disabled:opacity-50 transition-colors"
            >
              {pending ? 'Creando gimnasio...' : 'Crear mi gimnasio gratis'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
