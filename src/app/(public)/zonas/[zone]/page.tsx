import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, ArrowRight, CalendarDays, Building2, Users } from 'lucide-react'
import { getAllZones, getZoneBySlug } from '@/lib/queries/zones'
import { getGymsByZone } from '@/lib/queries/gyms'
import { getEventsByZone } from '@/lib/queries/events'
import { getTopFighters } from '@/lib/queries/fighters'
import { GymCard } from '@/components/cards/GymCard'
import { FighterCard } from '@/components/cards/FighterCard'
import { EventCard } from '@/components/cards/EventCard'
import { SectionHeader } from '@/components/ui/SectionHeader'

export async function generateStaticParams() {
  const zones = await getAllZones()
  return zones.map((z) => ({ zone: z.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ zone: string }>
}): Promise<Metadata> {
  const { zone: zoneSlug } = await params
  const zone = await getZoneBySlug(zoneSlug)

  if (!zone) {
    return { title: 'Zona no encontrada | WebMarcial' }
  }

  return {
    title: `Deportes de Contacto en ${zone.name} | WebMarcial`,
    description: `Gimnasios, luchadores y eventos de deportes de contacto en ${zone.name} (${zone.capital}). Muay Thai, Kickboxing, K1, MMA, Boxeo y Jiu-Jitsu.`,
  }
}

export const revalidate = 3600

export default async function ZonePage({
  params,
}: {
  params: Promise<{ zone: string }>
}) {
  const { zone: zoneSlug } = await params
  const zone = await getZoneBySlug(zoneSlug)

  if (!zone) {
    notFound()
  }

  const [events, gyms, fighters] = await Promise.all([
    getEventsByZone(zoneSlug, 4),
    getGymsByZone(zoneSlug, 6),
    getTopFighters({ limit: 6 }),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ── Hero ── */}
      <div className="mb-12 rounded-2xl border border-zinc-800 bg-[#18181b] px-8 py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {/* Code badge */}
            <span className="mb-3 inline-block text-7xl font-black text-[#dc2626]/20 select-none leading-none">
              {zone.code}
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {zone.name}
            </h1>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-zinc-400">
              <MapPin size={14} className="shrink-0 text-[#dc2626]" />
              Capital: {zone.capital}
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:w-56">
            <Link
              href={`/eventos?zona=${zone.slug}`}
              className="flex items-center justify-between rounded-lg border border-zinc-700 bg-[#111] px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-[#dc2626] hover:text-white"
            >
              <span>Todos los eventos</span>
              <ArrowRight size={14} className="shrink-0" />
            </Link>
            <Link
              href={`/gimnasios?zona=${zone.slug}`}
              className="flex items-center justify-between rounded-lg border border-zinc-700 bg-[#111] px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-[#dc2626] hover:text-white"
            >
              <span>Todos los gimnasios</span>
              <ArrowRight size={14} className="shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Events ── */}
      <section className="mb-12">
        <SectionHeader
          title="Próximos Eventos"
          href={`/eventos?zona=${zone.slug}`}
          hrefLabel="Ver todos los eventos"
        />

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 py-14 text-center">
            <CalendarDays size={40} className="mb-3 text-zinc-600" />
            <p className="text-sm text-zinc-500">
              No hay eventos próximos en {zone.name}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* ── Gyms ── */}
      <section className="mb-12">
        <SectionHeader
          title="Gimnasios"
          href={`/gimnasios?zona=${zone.slug}`}
          hrefLabel="Ver todos los gimnasios"
        />

        {gyms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 py-14 text-center">
            <Building2 size={40} className="mb-3 text-zinc-600" />
            <p className="text-sm text-zinc-500">
              No hay gimnasios registrados en {zone.name}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gyms.map((gym) => (
              <GymCard key={gym.id} gym={gym} />
            ))}
          </div>
        )}
      </section>

      {/* ── Top Fighters ── */}
      <section className="mb-8">
        <SectionHeader title="Top Luchadores" />

        {fighters.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 py-14 text-center">
            <Users size={40} className="mb-3 text-zinc-600" />
            <p className="text-sm text-zinc-500">
              No hay luchadores registrados en {zone.name}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {fighters.map((fighter) => (
              <FighterCard key={fighter.id} fighter={fighter} />
            ))}
          </div>
        )}
      </section>

      {/* See more links */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/eventos?zona=${zone.slug}`}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-[#dc2626] hover:text-white"
        >
          <CalendarDays size={16} />
          Ver eventos en {zone.name}
        </Link>
        <Link
          href={`/gimnasios?zona=${zone.slug}`}
          className="flex items-center gap-2 rounded-lg bg-[#dc2626] px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <Building2 size={16} />
          Ver gimnasios en {zone.name}
        </Link>
      </div>
    </div>
  )
}
