import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllSports } from '@/lib/queries/sports'
import { getFeaturedGyms } from '@/lib/queries/gyms'
import { getTopFighters } from '@/lib/queries/fighters'
import { getFeaturedEvents } from '@/lib/queries/events'
import { SportCard } from '@/components/cards/SportCard'
import { GymCard } from '@/components/cards/GymCard'
import { FighterCard } from '@/components/cards/FighterCard'
import { EventCard } from '@/components/cards/EventCard'
import { SectionHeader } from '@/components/ui/SectionHeader'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'WebMarcial — Deportes de Contacto en España',
  description:
    'La plataforma líder de deportes de contacto en España. Rankings, eventos, gimnasios y zonas para Muay Thai, Kickboxing, K1, MMA, Boxeo y Jiu-Jitsu.',
  openGraph: {
    title: 'WebMarcial — Deportes de Contacto en España',
    description:
      'Rankings, eventos, gimnasios y comunidad para los deportes de contacto en España.',
    url: 'https://webmarcial.com',
  },
}

export default async function HomePage() {
  const [sports, events, fighters, gyms] = await Promise.all([
    getAllSports(),
    getFeaturedEvents(6),
    getTopFighters({ sport: 'mma', limit: 5 }),
    getFeaturedGyms(4),
  ])

  return (
    <>
      {/* ─── HERO ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0a0a0a]">
        {/* Subtle background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 50%, #dc2626 0%, transparent 50%), radial-gradient(circle at 75% 20%, #7f1d1d 0%, transparent 50%)',
          }}
        />
        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-28 text-center sm:px-6 sm:py-36 lg:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#dc2626]">
            España · Deportes de Contacto
          </p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            La plataforma de{' '}
            <span className="text-[#dc2626]">deportes de contacto</span>
            <br />
            en España
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#a1a1aa] sm:text-xl">
            Rankings, eventos, gimnasios y comunidad para Muay Thai, Kickboxing,
            K1, MMA, Boxeo y Jiu-Jitsu. Todo en un solo lugar.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/rankings/mma"
              className="rounded-lg bg-[#dc2626] px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#b91c1c]"
            >
              Ver Rankings
            </Link>
            <Link
              href="/gimnasios"
              className="rounded-lg border border-[#3f3f46] bg-transparent px-8 py-3.5 text-sm font-bold text-[#ededed] transition-colors hover:border-[#71717a] hover:bg-[#18181b]"
            >
              Buscar Gimnasio
            </Link>
          </div>
        </div>
      </section>

      {/* ─── DEPORTES ────────────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Explora tu deporte"
            subtitle="Seis disciplinas, una plataforma."
          />
          {sports.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sports.slice(0, 6).map((sport) => (
                <SportCard key={sport.id} sport={sport} />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-[#52525b]">
              Los deportes se cargarán pronto.
            </p>
          )}
        </div>
      </section>

      {/* ─── PRÓXIMOS EVENTOS ─────────────────────────────────────────── */}
      <section className="bg-[#111111] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Próximos eventos"
            subtitle="No te pierdas las próximas veladas y torneos."
            href="/eventos"
            hrefLabel="Ver todos los eventos"
          />
          {events.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#27272a] bg-[#18181b] py-12 text-center">
              <p className="text-sm text-[#52525b]">
                No hay eventos próximos publicados todavía.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── RANKINGS DESTACADOS ──────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Rankings MMA"
            subtitle="Los mejores peleadores de MMA en España."
            href="/rankings/mma"
            hrefLabel="Ver rankings completos"
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
            <div className="rounded-xl border border-[#27272a] bg-[#111111] py-12 text-center">
              <p className="text-sm text-[#52525b]">
                Los rankings se actualizarán pronto.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── GIMNASIOS DESTACADOS ─────────────────────────────────────── */}
      <section className="bg-[#111111] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Gimnasios Destacados"
            subtitle="Los mejores centros de artes marciales en España."
            href="/gimnasios"
            hrefLabel="Ver directorio"
          />
          {gyms.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {gyms.map((gym) => (
                <GymCard key={gym.id} gym={gym} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#27272a] bg-[#18181b] py-12 text-center">
              <p className="text-sm text-[#52525b]">
                Próximamente gimnasios verificados.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA FINAL ────────────────────────────────────────────────── */}
      <section className="bg-[#0a0a0a] py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            ¿Tienes un gimnasio?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#a1a1aa]">
            Únete a la plataforma líder de deportes de contacto en España.
            Consigue visibilidad, gestiona tus eventos y conecta con nuevos
            alumnos.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/registro"
              className="rounded-lg bg-[#dc2626] px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#b91c1c]"
            >
              Registra tu gimnasio gratis
            </Link>
            <Link
              href="/gimnasios"
              className="text-sm font-medium text-[#a1a1aa] transition-colors hover:text-white"
            >
              Ver el directorio →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
