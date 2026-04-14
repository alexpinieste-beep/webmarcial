import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  AtSign,
  ExternalLink,
  CheckCircle,
  Star,
  Users,
  Link2,
} from 'lucide-react'

// lucide-react v1 doesn't ship Instagram/Facebook icons — use generic substitutes
const Instagram = AtSign
const Facebook = Link2
import { getGymBySlug, getGyms } from '@/lib/queries/gyms'
import { getFightersByGym } from '@/lib/queries/fighters'
import { getAllSports } from '@/lib/queries/sports'
import LeadCaptureForm from '@/components/gyms/LeadCaptureForm'
import { Badge } from '@/components/ui/Badge'
import { FighterCard } from '@/components/cards/FighterCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { Sport } from '@/types/database'

// Placeholder for the lead capture form (Fase 3)
function LeadCaptureFormPlaceholder() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 bg-[#18181b] p-8 text-center">
      <p className="text-sm font-medium text-zinc-400">
        Formulario de contacto
      </p>
      <p className="mt-1 text-xs text-zinc-600">
        Disponible próximamente — Fase 3
      </p>
    </div>
  )
}

export async function generateStaticParams() {
  const { createStaticClient } = await import('@/lib/supabase/static')
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('gyms')
    .select('slug')
    .eq('is_verified', true)
    .limit(50)
  return (data ?? []).map((g: { slug: string }) => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const gym = await getGymBySlug(slug)

  if (!gym) {
    return { title: 'Gimnasio no encontrado | WebMarcial' }
  }

  const location = gym.zones ? ` en ${gym.zones.name}` : ''

  return {
    title: `${gym.name}${location} | WebMarcial`,
    description:
      gym.description ??
      `Perfil del gimnasio ${gym.name}${location}. Encuentra información de contacto, luchadores y más.`,
  }
}

export const revalidate = 3600

export default async function GymPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [gym, allSports] = await Promise.all([
    getGymBySlug(slug),
    getAllSports(),
  ])

  if (!gym || !gym.is_verified) {
    notFound()
  }

  const fighters = await getFightersByGym(gym.id)

  // Resolve sport names from IDs
  const sportMap = new Map<string, Sport>(allSports.map((s) => [s.id, s]))
  const gymSports = (gym.sport_ids ?? [])
    .map((id) => sportMap.get(id))
    .filter(Boolean) as Sport[]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: gym.name,
    description: gym.description ?? undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://webmarcial.com'}/gimnasios/${gym.slug}`,
    ...(gym.address ? { address: { '@type': 'PostalAddress', streetAddress: gym.address, addressCountry: 'ES' } } : {}),
    ...(gym.phone ? { telephone: gym.phone } : {}),
    ...(gym.email ? { email: gym.email } : {}),
    ...(gym.website ? { sameAs: gym.website } : {}),
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Hero ── */}
      <div className="rounded-2xl border border-zinc-800 bg-[#18181b] p-8 mb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {gym.is_verified && (
                <Badge variant="default">
                  <CheckCircle size={11} className="mr-1" />
                  Verificado
                </Badge>
              )}
              {gym.is_featured && (
                <Badge variant="featured">
                  <Star size={11} className="mr-1" />
                  Destacado
                </Badge>
              )}
              {gym.subscription_tier === 'pro' && (
                <Badge variant="pro">Pro</Badge>
              )}
              {gymSports.map((sport) => (
                <Badge key={sport.id} variant="default">
                  {sport.name}
                </Badge>
              ))}
            </div>

            {/* Name */}
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {gym.name}
            </h1>

            {/* Zone + Address */}
            <div className="mt-3 flex flex-col gap-1.5">
              {gym.zones && (
                <p className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <MapPin size={14} className="shrink-0 text-[#dc2626]" />
                  <Link
                    href={`/zonas/${gym.zones.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {gym.zones.name}
                  </Link>
                </p>
              )}
              {gym.address && (
                <p className="flex items-center gap-1.5 text-sm text-zinc-500">
                  <MapPin size={14} className="shrink-0" />
                  {gym.address}
                </p>
              )}
            </div>
          </div>

          {/* Contact info card */}
          <div className="shrink-0 lg:w-72">
            <div className="rounded-xl border border-zinc-800 bg-[#111] p-5 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
                Contacto
              </h2>

              {gym.phone && (
                <a
                  href={`tel:${gym.phone}`}
                  className="flex items-center gap-2.5 text-sm text-zinc-300 hover:text-white transition-colors group"
                >
                  <Phone size={14} className="shrink-0 text-[#dc2626]" />
                  <span>{gym.phone}</span>
                </a>
              )}

              {gym.email && (
                <a
                  href={`mailto:${gym.email}`}
                  className="flex items-center gap-2.5 text-sm text-zinc-300 hover:text-white transition-colors group"
                >
                  <Mail size={14} className="shrink-0 text-[#dc2626]" />
                  <span className="truncate">{gym.email}</span>
                </a>
              )}

              {gym.website && (
                <a
                  href={gym.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-zinc-300 hover:text-white transition-colors group"
                >
                  <Globe size={14} className="shrink-0 text-[#dc2626]" />
                  <span className="truncate">{gym.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {gym.instagram && (
                <a
                  href={`https://instagram.com/${gym.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-zinc-300 hover:text-white transition-colors group"
                >
                  <AtSign size={14} className="shrink-0 text-[#dc2626]" />
                  <span>{gym.instagram.startsWith('@') ? gym.instagram : `@${gym.instagram}`}</span>
                </a>
              )}

              {gym.facebook && (
                <a
                  href={gym.facebook.startsWith('http') ? gym.facebook : `https://facebook.com/${gym.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-zinc-300 hover:text-white transition-colors group"
                >
                  <ExternalLink size={14} className="shrink-0 text-[#dc2626]" />
                  <span className="truncate">{gym.facebook}</span>
                </a>
              )}

              {!gym.phone && !gym.email && !gym.website && !gym.instagram && !gym.facebook && (
                <p className="text-xs text-zinc-600">Sin información de contacto.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Description ── */}
      {gym.description && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-[#18181b] p-7">
          <h2 className="mb-3 text-lg font-semibold text-white">Sobre el gimnasio</h2>
          <p className="text-sm leading-relaxed text-zinc-400 whitespace-pre-line">
            {gym.description}
          </p>
        </div>
      )}

      {/* ── Fighters ── */}
      <section className="mb-8">
        <SectionHeader
          title="Nuestros Luchadores"
          subtitle={
            fighters.length > 0
              ? `${fighters.length} luchador${fighters.length !== 1 ? 'es' : ''} en este gimnasio`
              : undefined
          }
        />

        {fighters.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 py-14 text-center">
            <Users size={40} className="mb-3 text-zinc-600" />
            <p className="text-sm text-zinc-500">
              Este gimnasio todavía no tiene luchadores registrados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {fighters.map((fighter) => (
              <FighterCard key={fighter.id} fighter={fighter} />
            ))}
          </div>
        )}
      </section>

      {/* ── Lead Capture Form ── */}
      {gym.subscription_tier !== 'free' ? <LeadCaptureForm gymId={gym.id} gymName={gym.name} /> : null}
    </div>
  )
}
