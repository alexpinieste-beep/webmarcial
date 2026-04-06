import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { getAllZones } from '@/lib/queries/zones'

export const metadata: Metadata = {
  title: 'Comunidades Autónomas | WebMarcial',
  description:
    'Explora los deportes de contacto por comunidad autónoma en España. Encontra gimnasios, luchadores y eventos en tu zona.',
}

export const revalidate = 86400

export default async function ZonasPage() {
  const zones = await getAllZones()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Deportes de Contacto por{' '}
          <span className="text-[#dc2626]">Comunidades Autónomas</span>
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          Encuentra gimnasios, eventos y luchadores cerca de ti. España tiene 19 comunidades y ciudades autónomas.
        </p>
      </div>

      {/* Zones grid */}
      {zones.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 py-20 text-center">
          <MapPin size={48} className="mb-4 text-zinc-600" />
          <p className="text-zinc-500">No hay zonas disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {zones.map((zone) => (
            <Link
              key={zone.id}
              href={`/zonas/${zone.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#18181b] p-6 transition-all hover:border-[#dc2626]/50 hover:bg-[#1c1c1f]"
            >
              {/* Code as visual element */}
              <span className="mb-4 block text-5xl font-black tracking-tighter text-zinc-800 group-hover:text-[#dc2626]/20 transition-colors select-none">
                {zone.code}
              </span>

              {/* Zone name */}
              <h2 className="text-lg font-bold text-white group-hover:text-[#dc2626] transition-colors">
                {zone.name}
              </h2>

              {/* Capital */}
              <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
                <MapPin size={12} className="shrink-0" />
                {zone.capital}
              </p>

              {/* Arrow */}
              <span className="mt-4 text-xs font-medium text-zinc-600 group-hover:text-[#dc2626] transition-colors">
                Ver zona &rarr;
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Coming soon note */}
      <div className="mt-16 rounded-xl border border-zinc-800 bg-[#18181b] p-6 text-center">
        <p className="text-sm text-zinc-500">
          <span className="font-medium text-zinc-400">Mapa interactivo</span> — Próximamente podrás explorar las zonas visualmente en un mapa de España.
        </p>
      </div>
    </div>
  )
}
