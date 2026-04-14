import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cn } from '@/lib/utils'
import { getAllSports, getSportBySlug } from '@/lib/queries/sports'
import { getAllZones } from '@/lib/queries/zones'
import { getRankings, getWeightClassesBySport } from '@/lib/queries/rankings'
import RankingsTable from '@/components/rankings/RankingsTable'
import RankingsFilters from '@/components/rankings/RankingsFilters'

export const revalidate = 1800

type Props = {
  params: Promise<{ sport: string }>
  searchParams: Promise<{ zona?: string; peso?: string; genero?: string; nivel?: string }>
}

export async function generateStaticParams() {
  const { createStaticClient } = await import('@/lib/supabase/static')
  const supabase = createStaticClient()
  const { data } = await supabase.from('sports').select('slug')
  return (data ?? []).map((s: { slug: string }) => ({ sport: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport: sportSlug } = await params
  const sport = await getSportBySlug(sportSlug)

  if (!sport) {
    return { title: 'Rankings | WebMarcial' }
  }

  return {
    title: `Rankings de ${sport.name} en España | WebMarcial`,
    description: `Consulta los rankings oficiales de ${sport.name} en España. Clasificaciones por zona, categoría de peso y género.`,
  }
}

export default async function RankingsSportPage({ params, searchParams }: Props) {
  const { sport: sportSlug } = await params
  const { zona, peso, genero, nivel } = await searchParams

  const [sport, allSports, zones, weightClasses] = await Promise.all([
    getSportBySlug(sportSlug),
    getAllSports(),
    getAllZones(),
    getWeightClassesBySport(sportSlug),
  ])

  if (!sport) {
    notFound()
  }

  const rankings = await getRankings({
    sport: sportSlug,
    zone: zona,
    weightClass: peso,
    gender: genero as 'male' | 'female' | 'open' | undefined,
    level: nivel as 'amateur' | 'professional' | undefined,
  })

  const showZone = !zona

  return (
    <div className="min-h-screen bg-[#09090b]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Cabecera */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Rankings de {sport.name}
          </h1>
          <p className="mt-2 text-gray-400">
            Clasificación oficial de {sport.name} en España. Temporada actual.
          </p>
        </div>

        {/* Tabs de deportes */}
        <div className="mb-8 flex flex-wrap gap-2">
          {allSports.map((s) => (
            <Link
              key={s.id}
              href={`/rankings/${s.slug}`}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                s.slug === sportSlug
                  ? 'bg-[#dc2626] text-white'
                  : 'border border-[#27272a] text-gray-400 hover:border-gray-500 hover:text-white'
              )}
            >
              {s.name}
            </Link>
          ))}
        </div>

        {/* Filtros */}
        <div className="mb-6 rounded-lg border border-[#27272a] bg-[#18181b] p-4">
          <RankingsFilters
            zones={zones}
            weightClasses={weightClasses}
            currentZone={zona}
            currentWeightClass={peso}
            currentGender={genero}
            currentLevel={nivel}
            sportSlug={sportSlug}
          />
        </div>

        {/* Tabla */}
        <RankingsTable rankings={rankings} showZone={showZone} />

        {/* Footer info */}
        <p className="mt-4 text-xs text-gray-600">
          Los rankings se actualizan cada 30 minutos. Última actualización basada en resultados oficiales.
        </p>
      </div>
    </div>
  )
}
