import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getUpcomingEvents, getPastEvents } from '@/lib/queries/events'
import { getAllSports } from '@/lib/queries/sports'
import { getAllZones } from '@/lib/queries/zones'
import EventCard from '@/components/cards/EventCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import EventsFilters from '@/components/events/EventsFilters'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Eventos de Deportes de Contacto en España | WebMarcial',
  description:
    'Encuentra todos los eventos de Muay Thai, Kickboxing, K1, MMA, Boxeo y Jiu-Jitsu en España. Próximos combates, veladas y torneos.',
}

type SearchParams = Promise<{
  deporte?: string
  zona?: string
  estado?: string
}>

export default async function EventosPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { deporte, zona, estado } = await searchParams

  const isPast = estado === 'pasados'

  const [sports, zones, upcoming, past] = await Promise.all([
    getAllSports(),
    getAllZones(),
    isPast ? Promise.resolve([]) : getUpcomingEvents({ sport: deporte }),
    isPast ? getPastEvents({ sport: deporte, zone: zona }) : Promise.resolve([]),
  ])

  // When showing upcoming, also pre-fetch a condensed list of past events for the bottom section
  // unless the user has switched to the "pasados" tab
  const pastForSidebar =
    !isPast && !deporte && !zona
      ? await getPastEvents({ limit: 6 })
      : !isPast
        ? []
        : past

  const upcomingEvents = isPast ? [] : upcoming
  const pastEvents = isPast ? past : pastForSidebar

  const hasUpcoming = upcomingEvents.length > 0
  const hasPast = pastEvents.length > 0
  const hasAny = hasUpcoming || hasPast

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Eventos
        </h1>
        <p className="mt-3 max-w-2xl text-base text-gray-400">
          Veladas, torneos y combates de deportes de contacto en toda España.
          Muay Thai, Kickboxing, K1, MMA, Boxeo y Jiu-Jitsu.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-10">
        <Suspense>
          <EventsFilters
            sports={sports}
            zones={zones}
            currentSport={deporte}
            currentZone={zona}
            currentEstado={estado}
          />
        </Suspense>
      </div>

      {/* Empty state */}
      {!hasAny && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#262626] bg-[#111111] py-24 text-center">
          <p className="text-2xl font-bold text-white">Sin eventos</p>
          <p className="mt-2 text-gray-500">
            No hay eventos que coincidan con los filtros seleccionados.
          </p>
        </div>
      )}

      {/* Upcoming events */}
      {!isPast && (
        <section>
          <SectionHeader
            title="Próximos Eventos"
            subtitle="Combates y veladas programados"
          />
          {hasUpcoming ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-[#262626] bg-[#111111] py-12 text-center text-gray-500">
              No hay próximos eventos
              {deporte ? ` de ${sports.find((s) => s.slug === deporte)?.name ?? deporte}` : ''}.
            </p>
          )}
        </section>
      )}

      {/* Past events */}
      {hasPast && (
        <section className={!isPast ? 'mt-16' : undefined}>
          <SectionHeader
            title={isPast ? 'Eventos Pasados' : 'Resultados Recientes'}
            subtitle={
              isPast
                ? 'Historial de combates y veladas'
                : 'Últimas veladas celebradas'
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Past empty state when on pasados tab */}
      {isPast && !hasPast && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#262626] bg-[#111111] py-24 text-center">
          <p className="text-xl font-bold text-white">Sin eventos pasados</p>
          <p className="mt-2 text-gray-500">
            No se encontraron eventos finalizados con estos filtros.
          </p>
        </div>
      )}
    </div>
  )
}
