import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getAllSports, getSportBySlug } from '@/lib/queries/sports'
import { getTopFighters } from '@/lib/queries/fighters'
import { getEventsBySport } from '@/lib/queries/events'
import { getGyms } from '@/lib/queries/gyms'
import { FighterCard } from '@/components/cards/FighterCard'
import { EventCard } from '@/components/cards/EventCard'
import { GymCard } from '@/components/cards/GymCard'
import { SectionHeader } from '@/components/ui/SectionHeader'

export const revalidate = 3600

type Props = {
  params: Promise<{ sport: string }>
}

export async function generateStaticParams() {
  const { createStaticClient } = await import('@/lib/supabase/static')
  const supabase = createStaticClient()
  const { data } = await supabase.from('sports').select('slug')
  return (data ?? []).map((s) => ({ sport: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport: slug } = await params
  const sport = await getSportBySlug(slug)

  if (!sport) {
    return { title: 'Deporte no encontrado' }
  }

  return {
    title: `${sport.name} en España — Rankings, Eventos y Gimnasios | WebMarcial`,
    description:
      sport.description ??
      `Encuentra rankings, próximos eventos y gimnasios de ${sport.name} en España. La plataforma líder de deportes de contacto.`,
    openGraph: {
      title: `${sport.name} en España`,
      description:
        sport.description ??
        `Rankings, eventos y gimnasios de ${sport.name} en España.`,
      ...(sport.image_url ? { images: [{ url: sport.image_url }] } : {}),
    },
  }
}

export default async function SportPage({ params }: Props) {
  const { sport: slug } = await params
  const sport = await getSportBySlug(slug)

  if (!sport) {
    notFound()
  }

  const [fighters, events, gyms] = await Promise.all([
    getTopFighters({ sport: slug, limit: 5 }),
    getEventsBySport(sport.id, 4),
    getGyms({ sport: slug, limit: 6 }),
  ])

  return (
    <>
      {/* ─── HERO ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0a0a0a]">
        {/* Background image */}
        {sport.image_url && (
          <div className="absolute inset-0">
            <Image
              src={sport.image_url}
              alt={sport.name}
              fill
              className="object-cover opacity-10"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/80 to-[#0a0a0a]" />
          </div>
        )}

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-[#52525b]">
            <Link href="/" className="hover:text-[#a1a1aa] transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link
              href="/deportes"
              className="hover:text-[#a1a1aa] transition-colors"
            >
              Deportes
            </Link>
            <span>/</span>
            <span className="text-[#a1a1aa]">{sport.name}</span>
          </nav>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            {sport.name}
          </h1>
          {sport.description && (
            <p className="mt-4 max-w-2xl text-lg text-[#a1a1aa]">
              {sport.description}
            </p>
          )}

          {/* Quick links */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/rankings/${sport.slug}`}
              className="rounded-lg bg-[#dc2626] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#b91c1c]"
            >
              Ver Rankings
            </Link>
            <Link
              href={`/eventos?sport=${sport.slug}`}
              className="rounded-lg border border-[#3f3f46] px-5 py-2.5 text-sm font-bold text-[#ededed] transition-colors hover:border-[#71717a] hover:bg-[#18181b]"
            >
              Todos los eventos
            </Link>
            <Link
              href={`/gimnasios?sport=${sport.slug}`}
              className="rounded-lg border border-[#3f3f46] px-5 py-2.5 text-sm font-bold text-[#ededed] transition-colors hover:border-[#71717a] hover:bg-[#18181b]"
            >
              Gimnasios
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TOP FIGHTERS ─────────────────────────────────────────────── */}
      <section className="bg-[#111111] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={`Top Peleadores · ${sport.name}`}
            subtitle="Los mejores competidores de España."
            href={`/rankings/${sport.slug}`}
            hrefLabel="Ver ranking completo"
          />
          {fighters.length > 0 ? (
            <div className="flex flex-col gap-3">
              {fighters.map((fighter, index) => (
                <FighterCard
                  key={fighter.id}
                  fighter={fighter}
                  position={index + 1}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#27272a] bg-[#18181b] py-12 text-center">
              <p className="text-sm text-[#52525b]">
                No hay peleadores registrados para este deporte todavía.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── PRÓXIMOS EVENTOS ─────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Próximos eventos"
            subtitle={`Las próximas veladas y torneos de ${sport.name}.`}
            href={`/eventos?sport=${sport.slug}`}
            hrefLabel="Ver todos los eventos"
          />
          {events.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#27272a] bg-[#111111] py-12 text-center">
              <p className="text-sm text-[#52525b]">
                No hay eventos próximos para este deporte.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── GIMNASIOS ────────────────────────────────────────────────── */}
      <section className="bg-[#111111] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={`Gimnasios de ${sport.name}`}
            subtitle="Entrena con los mejores."
            href={`/gimnasios?sport=${sport.slug}`}
            hrefLabel="Ver directorio completo"
          />
          {gyms.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gyms.map((gym) => (
                <GymCard key={gym.id} gym={gym} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#27272a] bg-[#18181b] py-12 text-center">
              <p className="text-sm text-[#52525b]">
                No hay gimnasios registrados para este deporte todavía.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── VER MÁS ──────────────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-xl font-bold text-white">
            Explora más en {sport.name}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href={`/rankings/${sport.slug}`}
              className="group flex flex-col rounded-xl border border-[#27272a] bg-[#111111] p-6 transition-all hover:border-[#dc2626]/40"
            >
              <span className="text-2xl">🏆</span>
              <h3 className="mt-3 font-semibold text-white group-hover:text-[#dc2626]">
                Rankings
              </h3>
              <p className="mt-1 text-sm text-[#71717a]">
                Clasificaciones actualizadas de {sport.name} en España.
              </p>
            </Link>
            <Link
              href={`/eventos?sport=${sport.slug}`}
              className="group flex flex-col rounded-xl border border-[#27272a] bg-[#111111] p-6 transition-all hover:border-[#dc2626]/40"
            >
              <span className="text-2xl">📅</span>
              <h3 className="mt-3 font-semibold text-white group-hover:text-[#dc2626]">
                Eventos
              </h3>
              <p className="mt-1 text-sm text-[#71717a]">
                Veladas y torneos de {sport.name} por toda España.
              </p>
            </Link>
            <Link
              href={`/gimnasios?sport=${sport.slug}`}
              className="group flex flex-col rounded-xl border border-[#27272a] bg-[#111111] p-6 transition-all hover:border-[#dc2626]/40"
            >
              <span className="text-2xl">🏋️</span>
              <h3 className="mt-3 font-semibold text-white group-hover:text-[#dc2626]">
                Gimnasios
              </h3>
              <p className="mt-1 text-sm text-[#71717a]">
                Encuentra dónde entrenar {sport.name} cerca de ti.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
