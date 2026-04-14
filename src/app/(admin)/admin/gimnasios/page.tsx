import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GymActions } from './GymActions'

type Props = {
  searchParams: Promise<{ filter?: string; q?: string }>
}

const tierLabel: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
}
const tierStyle: Record<string, string> = {
  free: 'bg-[#27272a] text-[#a1a1aa]',
  basic: 'bg-blue-950/50 text-blue-400',
  pro: 'bg-[#3b1a1a] text-[#fca5a5]',
}

export default async function AdminGimnasiosPage({ searchParams }: Props) {
  const { filter, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('gyms')
    .select('id, name, slug, email, phone, subscription_tier, is_verified, is_featured, created_at, zones(name)')
    .order('created_at', { ascending: false })

  if (filter === 'unverified') {
    query = query.eq('is_verified', false)
  }
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data: gyms } = await query.limit(100)

  const list = gyms ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Gimnasios</h1>
          <p className="mt-1 text-sm text-[#71717a]">{list.length} gimnasios encontrados</p>
        </div>

        {/* Filters */}
        <form method="GET" className="flex flex-wrap gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre…"
            className="rounded-md border border-[#27272a] bg-[#18181b] px-3 py-2 text-sm text-white placeholder-[#52525b] outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626]"
          />
          <select
            name="filter"
            defaultValue={filter ?? ''}
            className="rounded-md border border-[#27272a] bg-[#18181b] px-3 py-2 text-sm text-[#a1a1aa] outline-none focus:border-[#dc2626]"
          >
            <option value="">Todos</option>
            <option value="unverified">Sin verificar</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Filtrar
          </button>
          {(filter || q) && (
            <Link
              href="/admin/gimnasios"
              className="rounded-md border border-[#27272a] px-4 py-2 text-sm text-[#71717a] hover:text-white"
            >
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#27272a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#27272a] bg-[#18181b] text-left text-xs font-semibold uppercase tracking-wider text-[#52525b]">
              <th className="px-5 py-3">Gimnasio</th>
              <th className="px-5 py-3">Zona</th>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Registrado</th>
              <th className="px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1c1c] bg-[#111111]">
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[#52525b]">
                  Sin resultados
                </td>
              </tr>
            )}
            {list.map((gym) => (
              <tr key={gym.id} className="hover:bg-[#161616]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-white">{gym.name}</span>
                        {gym.is_verified && (
                          <span className="text-xs text-green-500">✓</span>
                        )}
                        {gym.is_featured && (
                          <span className="text-xs text-amber-400">★</span>
                        )}
                      </div>
                      <p className="text-xs text-[#52525b]">{gym.email ?? '—'}</p>
                    </div>
                    <Link
                      href={`/gimnasios/${gym.slug}`}
                      target="_blank"
                      className="ml-1 text-[#52525b] hover:text-white"
                    >
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#a1a1aa]">
                  {(gym.zones as unknown as { name: string } | null)?.name ?? '—'}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                      tierStyle[gym.subscription_tier] ?? tierStyle.free
                    }`}
                  >
                    {tierLabel[gym.subscription_tier] ?? gym.subscription_tier}
                  </span>
                </td>
                <td className="px-5 py-4 text-[#52525b]">
                  {new Date(gym.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-5 py-4">
                  <GymActions
                    gymId={gym.id}
                    isVerified={gym.is_verified}
                    isFeatured={gym.is_featured}
                    tier={gym.subscription_tier as 'free' | 'basic' | 'pro'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
