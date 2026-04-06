import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react'
import { getGyms, getGymCount } from '@/lib/queries/gyms'
import { getAllZones } from '@/lib/queries/zones'
import { getAllSports } from '@/lib/queries/sports'
import { GymCard } from '@/components/cards/GymCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import GymsFilters from '@/components/gyms/GymsFilters'

export const metadata: Metadata = {
  title: 'Gimnasios de Deportes de Contacto en España | WebMarcial',
  description:
    'Encuentra gimnasios de Muay Thai, Kickboxing, K1, MMA, Boxeo y Jiu-Jitsu en toda España. Directorio completo por comunidad autónoma.',
}

const PER_PAGE = 12

type SearchParams = {
  zona?: string
  deporte?: string
  buscar?: string
  pagina?: string
}

export default async function GimnasiosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.pagina ?? '1', 10))
  const offset = (page - 1) * PER_PAGE

  const [gyms, totalCount, zones, sports] = await Promise.all([
    getGyms({
      zone: params.zona,
      sport: params.deporte,
      search: params.buscar,
      limit: PER_PAGE,
      offset,
    }),
    getGymCount(),
    getAllZones(),
    getAllSports(),
  ])

  const totalPages = Math.ceil(totalCount / PER_PAGE)
  const hasFilters = !!(params.zona || params.deporte || params.buscar)

  function buildPageUrl(p: number) {
    const qs = new URLSearchParams()
    if (params.zona) qs.set('zona', params.zona)
    if (params.deporte) qs.set('deporte', params.deporte)
    if (params.buscar) qs.set('buscar', params.buscar)
    if (p > 1) qs.set('pagina', String(p))
    const str = qs.toString()
    return `/gimnasios${str ? `?${str}` : ''}`
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <SectionHeader
          title="Gimnasios de Deportes de Contacto"
          subtitle={`${totalCount} gimnasios registrados en toda España`}
        />
      </div>

      {/* Filters */}
      <div className="mb-8">
        <GymsFilters
          zones={zones}
          sports={sports}
          currentZone={params.zona}
          currentSport={params.deporte}
          currentSearch={params.buscar}
        />
      </div>

      {/* Results */}
      {gyms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 py-20 text-center">
          <Building2 size={48} className="mb-4 text-zinc-600" />
          <h2 className="mb-2 text-lg font-semibold text-zinc-300">
            No se encontraron gimnasios
          </h2>
          <p className="mb-6 text-sm text-zinc-500">
            {hasFilters
              ? 'Prueba a cambiar los filtros de búsqueda.'
              : 'Todavía no hay gimnasios registrados en la plataforma.'}
          </p>
          {hasFilters && (
            <Link
              href="/gimnasios"
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Limpiar filtros
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gyms.map((gym) => (
              <GymCard key={gym.id} gym={gym} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Paginación"
              className="mt-12 flex items-center justify-center gap-3"
            >
              {page > 1 ? (
                <Link
                  href={buildPageUrl(page - 1)}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#18181b] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-red-600 hover:text-white"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-600 cursor-not-allowed">
                  <ChevronLeft size={16} />
                  Anterior
                </span>
              )}

              <span className="text-sm text-zinc-400">
                Página <strong className="text-white">{page}</strong> de{' '}
                <strong className="text-white">{totalPages}</strong>
              </span>

              {page < totalPages ? (
                <Link
                  href={buildPageUrl(page + 1)}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-[#18181b] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-red-600 hover:text-white"
                >
                  Siguiente
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-600 cursor-not-allowed">
                  Siguiente
                  <ChevronRight size={16} />
                </span>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  )
}
