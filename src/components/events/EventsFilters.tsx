'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { Sport, Zone } from '@/types/database'

type Props = {
  sports: Sport[]
  zones: Zone[]
  currentSport?: string
  currentZone?: string
  currentEstado?: string
}

export default function EventsFilters({
  sports,
  zones,
  currentSport,
  currentZone,
  currentEstado,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const estado = currentEstado ?? 'proximos'

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Tabs: Próximos / Pasados */}
      <div className="flex rounded-lg border border-[#262626] bg-[#111111] p-1">
        <button
          onClick={() => updateParam('estado', null)}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            estado === 'proximos'
              ? 'bg-[#dc2626] text-white'
              : 'text-gray-400 hover:text-white'
          )}
        >
          Próximos
        </button>
        <button
          onClick={() => updateParam('estado', 'pasados')}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            estado === 'pasados'
              ? 'bg-[#dc2626] text-white'
              : 'text-gray-400 hover:text-white'
          )}
        >
          Pasados
        </button>
      </div>

      {/* Deporte select */}
      <select
        value={currentSport ?? ''}
        onChange={(e) => updateParam('deporte', e.target.value || null)}
        className="rounded-lg border border-[#262626] bg-[#111111] px-3 py-2 text-sm text-gray-300 focus:border-[#dc2626] focus:outline-none"
      >
        <option value="">Todos los deportes</option>
        {sports.map((sport) => (
          <option key={sport.id} value={sport.slug}>
            {sport.name}
          </option>
        ))}
      </select>

      {/* Zona select */}
      <select
        value={currentZone ?? ''}
        onChange={(e) => updateParam('zona', e.target.value || null)}
        className="rounded-lg border border-[#262626] bg-[#111111] px-3 py-2 text-sm text-gray-300 focus:border-[#dc2626] focus:outline-none"
      >
        <option value="">Todas las zonas</option>
        {zones.map((zone) => (
          <option key={zone.id} value={zone.slug}>
            {zone.name}
          </option>
        ))}
      </select>

      {/* Clear filters */}
      {(currentSport || currentZone || currentEstado) && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-gray-500 underline-offset-2 hover:text-gray-300 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
