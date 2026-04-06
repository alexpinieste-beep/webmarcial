'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { Zone, WeightClass } from '@/types/database'

type Props = {
  zones: Zone[]
  weightClasses: WeightClass[]
  currentZone?: string
  currentWeightClass?: string
  currentGender?: string
  sportSlug: string
}

export default function RankingsFilters({
  zones,
  weightClasses,
  currentZone,
  currentWeightClass,
  currentGender,
  sportSlug,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams()

    if (key !== 'zona' && currentZone) params.set('zona', currentZone)
    if (key !== 'peso' && currentWeightClass) params.set('peso', currentWeightClass)
    if (key !== 'genero' && currentGender) params.set('genero', currentGender)

    if (value) params.set(key, value)

    const search = params.toString()
    router.replace(`${pathname}${search ? `?${search}` : ''}`)
  }

  function clearFilters() {
    router.replace(pathname)
  }

  const hasActiveFilters = !!(currentZone || currentWeightClass || currentGender)

  const selectClass =
    'w-full rounded-md border border-[#27272a] bg-[#18181b] px-3 py-2 text-sm text-gray-200 outline-none transition-colors focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]'

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
      {/* Zona */}
      <div className="flex-1">
        <label
          htmlFor="filter-zona"
          className="mb-1 block text-xs font-medium text-gray-400"
        >
          Zona
        </label>
        <select
          id="filter-zona"
          className={selectClass}
          value={currentZone ?? ''}
          onChange={(e) => updateFilter('zona', e.target.value)}
        >
          <option value="">Nacional (todas)</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.slug}>
              {zone.name}
            </option>
          ))}
        </select>
      </div>

      {/* Categoría de peso */}
      <div className="flex-1">
        <label
          htmlFor="filter-peso"
          className="mb-1 block text-xs font-medium text-gray-400"
        >
          Categoría de peso
        </label>
        <select
          id="filter-peso"
          className={selectClass}
          value={currentWeightClass ?? ''}
          onChange={(e) => updateFilter('peso', e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {weightClasses.map((wc) => (
            <option key={wc.id} value={wc.slug}>
              {wc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Género */}
      <div className="flex-1">
        <label
          htmlFor="filter-genero"
          className="mb-1 block text-xs font-medium text-gray-400"
        >
          Género
        </label>
        <select
          id="filter-genero"
          className={selectClass}
          value={currentGender ?? ''}
          onChange={(e) => updateFilter('genero', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
          <option value="open">Open</option>
        </select>
      </div>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <div className="sm:pb-0">
          <button
            type="button"
            onClick={clearFilters}
            className="w-full rounded-md border border-[#27272a] bg-transparent px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-gray-500 hover:text-white sm:w-auto"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
