'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search } from 'lucide-react'
import type { Zone, Sport } from '@/types/database'

type Props = {
  zones: Zone[]
  sports: Sport[]
  currentZone?: string
  currentSport?: string
  currentSearch?: string
}

export default function GymsFilters({
  zones,
  sports,
  currentZone,
  currentSport,
  currentSearch,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      // Reset to page 1 whenever filters change
      params.delete('pagina')
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      return params.toString()
    },
    [searchParams]
  )

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem('buscar') as HTMLInputElement
    const qs = createQueryString({ buscar: input.value || undefined })
    router.push(`${pathname}?${qs}`)
  }

  function handleZone(e: React.ChangeEvent<HTMLSelectElement>) {
    const qs = createQueryString({ zona: e.target.value || undefined })
    router.push(`${pathname}?${qs}`)
  }

  function handleSport(e: React.ChangeEvent<HTMLSelectElement>) {
    const qs = createQueryString({ deporte: e.target.value || undefined })
    router.push(`${pathname}?${qs}`)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          name="buscar"
          defaultValue={currentSearch ?? ''}
          placeholder="Buscar gimnasio..."
          className="w-full rounded-lg border border-zinc-700 bg-[#18181b] py-2.5 pl-9 pr-4 text-sm text-[#ededed] placeholder-zinc-500 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600"
        />
        <button type="submit" className="sr-only">
          Buscar
        </button>
      </form>

      {/* Zone filter */}
      <select
        value={currentZone ?? ''}
        onChange={handleZone}
        className="rounded-lg border border-zinc-700 bg-[#18181b] py-2.5 px-3 text-sm text-[#ededed] outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 sm:w-52"
        aria-label="Filtrar por comunidad autónoma"
      >
        <option value="">Todas las zonas</option>
        {zones.map((z) => (
          <option key={z.id} value={z.slug}>
            {z.name}
          </option>
        ))}
      </select>

      {/* Sport filter */}
      <select
        value={currentSport ?? ''}
        onChange={handleSport}
        className="rounded-lg border border-zinc-700 bg-[#18181b] py-2.5 px-3 text-sm text-[#ededed] outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 sm:w-48"
        aria-label="Filtrar por deporte"
      >
        <option value="">Todos los deportes</option>
        {sports.map((s) => (
          <option key={s.id} value={s.slug}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  )
}
