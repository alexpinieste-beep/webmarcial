import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Trophy, Award, BarChart2, CheckCircle } from 'lucide-react'
import { getFighterBySlug, getTopFighters } from '@/lib/queries/fighters'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'

const nationalityFlag: Record<string, string> = {
  ES: '🇪🇸',
  PT: '🇵🇹',
  FR: '🇫🇷',
  GB: '🇬🇧',
  US: '🇺🇸',
  BR: '🇧🇷',
  MX: '🇲🇽',
  AR: '🇦🇷',
  DE: '🇩🇪',
  IT: '🇮🇹',
  RU: '🇷🇺',
  TH: '🇹🇭',
  JP: '🇯🇵',
  KR: '🇰🇷',
  MA: '🇲🇦',
  DZ: '🇩🇿',
  SN: '🇸🇳',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export async function generateStaticParams() {
  const { createStaticClient } = await import('@/lib/supabase/static')
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('fighters')
    .select('slug')
    .eq('is_verified', true)
    .limit(100)
  return (data ?? []).map((f: { slug: string }) => ({ slug: f.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const fighter = await getFighterBySlug(slug)

  if (!fighter) {
    return { title: 'Luchador no encontrado | WebMarcial' }
  }

  const totalWins = fighter.sport_profiles.reduce((acc, p) => acc + p.wins, 0)
  const totalLosses = fighter.sport_profiles.reduce((acc, p) => acc + p.losses, 0)
  const totalDraws = fighter.sport_profiles.reduce((acc, p) => acc + p.draws, 0)
  const record =
    fighter.sport_profiles.length > 0
      ? ` — Récord: ${totalWins}-${totalLosses}-${totalDraws}`
      : ''

  return {
    title: `${fighter.name}${record} | WebMarcial`,
    description: fighter.bio ?? `Perfil del luchador ${fighter.name}. Récord, títulos y rankings en WebMarcial.`,
  }
}

export const revalidate = 3600

export default async function FighterPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const fighter = await getFighterBySlug(slug)

  if (!fighter || !fighter.is_verified) {
    notFound()
  }

  // Aggregate record across all sports
  const totalWins = fighter.sport_profiles.reduce((acc, p) => acc + p.wins, 0)
  const totalLosses = fighter.sport_profiles.reduce((acc, p) => acc + p.losses, 0)
  const totalDraws = fighter.sport_profiles.reduce((acc, p) => acc + p.draws, 0)
  const totalNC = fighter.sport_profiles.reduce((acc, p) => acc + p.no_contests, 0)

  const flag = nationalityFlag[fighter.nationality] ?? ''
  const initials = getInitials(fighter.name)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: fighter.name,
    description: fighter.bio ?? undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://webmarcial.com'}/luchadores/${fighter.slug}`,
    ...(fighter.avatar_url ? { image: fighter.avatar_url } : {}),
    ...(fighter.nationality ? { nationality: fighter.nationality } : {}),
    ...(fighter.gyms ? { affiliation: { '@type': 'SportsOrganization', name: fighter.gyms.name } } : {}),
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Hero ── */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-[#18181b] p-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative mx-auto h-36 w-36 shrink-0 overflow-hidden rounded-full border-4 border-zinc-700 sm:mx-0">
            {fighter.avatar_url ? (
              <Image
                src={fighter.avatar_url}
                alt={fighter.name}
                fill
                className="object-cover"
                sizes="144px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                <span className="text-4xl font-bold text-zinc-300">{initials}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {fighter.is_verified && (
                <Badge variant="default">
                  <CheckCircle size={11} className="mr-1" />
                  Verificado
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {fighter.name}
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              {flag} {fighter.nationality}
            </p>

            {/* Linked gym */}
            {fighter.gyms && (
              <p className="mt-2 text-sm text-zinc-500">
                Gimnasio:{' '}
                <Link
                  href={`/gimnasios/${fighter.gyms.slug}`}
                  className="font-medium text-zinc-300 hover:text-[#dc2626] transition-colors"
                >
                  {fighter.gyms.name}
                </Link>
              </p>
            )}

            {/* Bio */}
            {fighter.bio && (
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                {fighter.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Global Record ── */}
      {fighter.sport_profiles.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Récord Global" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Victorias', value: totalWins, color: 'text-green-400' },
              { label: 'Derrotas', value: totalLosses, color: 'text-red-400' },
              { label: 'Empates', value: totalDraws, color: 'text-yellow-400' },
              { label: 'Sin Resultado', value: totalNC, color: 'text-zinc-400' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-xl border border-zinc-800 bg-[#18181b] p-5 text-center"
              >
                <p className={`text-4xl font-black ${color}`}>{value}</p>
                <p className="mt-1 text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Sport Profiles ── */}
      {fighter.sport_profiles.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Perfiles por Deporte" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fighter.sport_profiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-xl border border-zinc-800 bg-[#18181b] p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-white">
                    {profile.sports?.name ?? 'Deporte'}
                  </h3>
                  {profile.weight_classes && (
                    <Badge variant="default">{profile.weight_classes.name}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-bold text-green-400">{profile.wins}V</span>
                  <span className="text-zinc-600">·</span>
                  <span className="font-bold text-red-400">{profile.losses}D</span>
                  <span className="text-zinc-600">·</span>
                  <span className="font-bold text-yellow-400">{profile.draws}E</span>
                  {profile.no_contests > 0 && (
                    <>
                      <span className="text-zinc-600">·</span>
                      <span className="font-bold text-zinc-400">{profile.no_contests} NC</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Titles ── */}
      {fighter.titles.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Títulos" />
          <div className="space-y-3">
            {fighter.titles.map((ft) => {
              const title = ft.titles
              return (
                <div
                  key={ft.id}
                  className="flex items-start gap-4 rounded-xl border border-zinc-800 bg-[#18181b] p-5"
                >
                  <Trophy size={22} className="mt-0.5 shrink-0 text-[#dc2626]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">
                      {title?.name ?? 'Título'}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {title?.organization}
                      {title?.sports ? ` · ${title.sports.name}` : ''}
                      {title?.weight_classes ? ` · ${title.weight_classes.name}` : ''}
                      {title?.zones ? ` · ${title.zones.name}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-zinc-500">
                    <p>Ganado: {new Date(ft.won_at).toLocaleDateString('es-ES')}</p>
                    {ft.lost_at && (
                      <p className="text-zinc-600">
                        Perdido: {new Date(ft.lost_at).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Rankings ── */}
      {fighter.rankings.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Rankings" />
          <div className="space-y-3">
            {fighter.rankings.map((ranking) => (
              <div
                key={ranking.id}
                className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-[#18181b] p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#dc2626]/10 border border-[#dc2626]/20">
                  <span className="text-lg font-black text-[#dc2626]">
                    #{ranking.position}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">
                    {ranking.weight_classes?.name ?? 'Categoría'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {ranking.zones?.name ?? 'Nacional'}
                    {ranking.sports ? ` · ${ranking.sports.name}` : ''}
                    {' · '}Temporada {ranking.season}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{ranking.points}</p>
                  <p className="text-xs text-zinc-600">puntos</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state when no profiles/titles/rankings */}
      {fighter.sport_profiles.length === 0 &&
        fighter.titles.length === 0 &&
        fighter.rankings.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 py-16 text-center">
            <BarChart2 size={40} className="mb-3 text-zinc-600" />
            <p className="text-sm text-zinc-500">
              Todavía no hay estadísticas registradas para este luchador.
            </p>
          </div>
        )}
    </div>
  )
}
