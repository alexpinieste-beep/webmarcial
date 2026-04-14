import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Trophy } from 'lucide-react'
import {
  getEventBySlug,
  getEventFights,
  getUpcomingEventSlugs,
} from '@/lib/queries/events'
import { Badge } from '@/components/ui/Badge'
import FightCard from '@/components/events/FightCard'

export const revalidate = 3600

type Params = Promise<{ slug: string }>

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const { createStaticClient } = await import('@/lib/supabase/static')
  const supabase = createStaticClient()
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('events')
    .select('slug')
    .eq('status', 'published')
    .gte('event_date', now)
    .order('event_date', { ascending: true })
    .limit(20)
  return (data ?? []).map((e: { slug: string }) => ({ slug: e.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    return { title: 'Evento no encontrado | WebMarcial' }
  }

  const date = new Date(event.event_date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return {
    title: `${event.title} — ${date} | WebMarcial`,
    description:
      event.description ??
      `${event.title}. Evento de ${event.sports?.name ?? 'deportes de contacto'} el ${date}${event.zones ? ` en ${event.zones.name}` : ''}.`,
    openGraph: event.poster_url
      ? { images: [{ url: event.poster_url }] }
      : undefined,
  }
}

const statusBadge: Record<
  'draft' | 'published' | 'completed' | 'cancelled',
  {
    label: string
    variant: 'default' | 'featured' | 'pro' | 'basic' | 'upcoming' | 'completed'
  }
> = {
  draft: { label: 'Borrador', variant: 'default' },
  published: { label: 'Próximo', variant: 'upcoming' },
  completed: { label: 'Finalizado', variant: 'completed' },
  cancelled: { label: 'Cancelado', variant: 'featured' },
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function EventoDetailPage({ params }: { params: Params }) {
  const { slug } = await params

  const event = await getEventBySlug(slug)

  if (!event || event.status === 'draft') {
    notFound()
  }

  const eventFights = await getEventFights(event.id)

  const mainFight = eventFights[0] ?? null
  const undercard = eventFights.slice(1)

  const status = statusBadge[event.status]
  const dateStr = formatFullDate(event.event_date)
  const timeStr = formatTime(event.event_date)

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://webmarcial.com'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: event.title,
    description: event.description ?? undefined,
    url: `${BASE_URL}/eventos/${event.slug}`,
    startDate: event.event_date,
    eventStatus:
      event.status === 'published'
        ? 'https://schema.org/EventScheduled'
        : event.status === 'completed'
        ? 'https://schema.org/EventCompleted'
        : 'https://schema.org/EventCancelled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(event.venue || event.zones
      ? {
          location: {
            '@type': 'Place',
            name: event.venue ?? event.zones?.name,
            address: { '@type': 'PostalAddress', addressCountry: 'ES', addressRegion: event.zones?.name },
          },
        }
      : {}),
    ...(event.poster_url ? { image: event.poster_url } : {}),
    ...(event.sports ? { sport: event.sports.name } : {}),
    organizer: { '@type': 'Organization', name: 'WebMarcial', url: BASE_URL },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a0a0a]">
        {/* Background poster with dark overlay */}
        {event.poster_url && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.poster_url}
              alt=""
              aria-hidden
              className="h-full w-full object-cover opacity-10 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/80 to-[#0a0a0a]" />
          </div>
        )}

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            {/* Poster thumbnail */}
            {event.poster_url && (
              <div className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.poster_url}
                  alt={`Cartel de ${event.title}`}
                  className="h-64 w-44 rounded-xl object-cover shadow-2xl shadow-black/60 ring-1 ring-[#262626] lg:h-80 lg:w-56"
                />
              </div>
            )}

            {/* Event info */}
            <div className="flex flex-col gap-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant={status.variant}>{status.label}</Badge>
                {event.sports && (
                  <Badge variant="default">{event.sports.name}</Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="shrink-0 text-[#dc2626]" />
                  <span className="capitalize">
                    {dateStr} · {timeStr}
                  </span>
                </div>

                {(event.venue || event.zones) && (
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="shrink-0 text-[#dc2626]" />
                    <span>
                      {[event.venue, event.zones?.name]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main column: fights */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
              <Trophy size={18} className="text-[#dc2626]" />
              Cartelera
            </h2>

            {eventFights.length === 0 ? (
              <div className="rounded-xl border border-[#262626] bg-[#111111] py-16 text-center">
                <p className="font-semibold text-white">
                  Cartelera no disponible
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Los combates de este evento aún no han sido anunciados.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Main event */}
                {mainFight && <FightCard fight={mainFight} isMain />}

                {/* Undercard divider */}
                {undercard.length > 0 && mainFight && (
                  <div className="flex items-center gap-3 py-1">
                    <span className="h-px flex-1 bg-[#262626]" />
                    <span className="text-xs uppercase tracking-widest text-gray-600">
                      Undercard
                    </span>
                    <span className="h-px flex-1 bg-[#262626]" />
                  </div>
                )}

                {/* Undercard fights */}
                {undercard.map((fight) => (
                  <FightCard key={fight.id} fight={fight} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: info */}
          <aside className="flex flex-col gap-6">
            {/* Description */}
            {event.description && (
              <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Información
                </h3>
                <p className="text-sm leading-relaxed text-gray-300">
                  {event.description}
                </p>
              </div>
            )}

            {/* Address */}
            {event.address && (
              <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Dirección
                </h3>
                <div className="flex gap-2 text-sm text-gray-300">
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0 text-[#dc2626]"
                  />
                  <span>{event.address}</span>
                </div>
              </div>
            )}

            {/* Fight count */}
            {eventFights.length > 0 && (
              <div className="rounded-xl border border-[#262626] bg-[#111111] p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Combates
                </h3>
                <p className="text-3xl font-black text-white">
                  {eventFights.length}
                </p>
                <p className="text-xs text-gray-500">
                  {eventFights.length === 1 ? 'combate' : 'combates'} en la
                  cartelera
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
