import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { FighterActions } from './FighterActions'

type Props = {
  searchParams: Promise<{ filter?: string; q?: string; nivel?: string }>
}

const levelLabel: Record<string, string> = {
  amateur: 'Amateur',
  professional: 'Profesional',
}
const levelStyle: Record<string, string> = {
  amateur: 'bg-[#1a2a1a] text-[#86efac]',
  professional: 'bg-[#3b1a1a] text-[#fca5a5]',
}

export default async function AdminPeleadoresPage({ searchParams }: Props) {
  const { filter, q, nivel } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('fighters')
    .select('id, name, slug, nationality, level, is_verified, gym_id, created_at, gyms(id, name)')
    .order('created_at', { ascending: false })

  if (filter === 'unverified') query = query.eq('is_verified', false)
  if (nivel === 'amateur' || nivel === 'professional') query = query.eq('level', nivel)
  if (q) query = query.ilike('name', `%${q}%`)

  const [{ data: fighters }, { data: allGyms }] = await Promise.all([
    query.limit(100),
    supabase.from('gyms').select('id, name').order('name'),
  ])

  const list = fighters ?? []
  const gyms = allGyms ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Peleadores</h1>
          <p className="mt-1 text-sm text-[#71717a]">{list.length} peleadores encontrados</p>
        </div>

        {/* Filters */}
        <form method="GET" className="flex flex-wrap gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre…"
            className="rounded-md border border-[#27272a] bg-[#18181b] px-3 py-2 text-sm text-white placeholder-[#52525b] outline-none focus:border-[#dc2626]"
          />
          <select
            name="nivel"
            defaultValue={nivel ?? ''}
            className="rounded-md border border-[#27272a] bg-[#18181b] px-3 py-2 text-sm text-[#a1a1aa] outline-none focus:border-[#dc2626]"
          >
            <option value="">Amateur y profesional</option>
            <option value="amateur">Amateur</option>
            <option value="professional">Profesional</option>
          </select>
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
          {(filter || q || nivel) && (
            <Link
              href="/admin/peleadores"
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
              <th className="px-5 py-3">Peleador</th>
              <th className="px-5 py-3">Nivel</th>
              <th className="px-5 py-3">Gimnasio actual</th>
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
            {list.map((fighter) => (
              <tr key={fighter.id} className="hover:bg-[#161616]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-white">{fighter.name}</span>
                        {fighter.is_verified && (
                          <span className="text-xs text-green-500">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-[#52525b]">{fighter.nationality}</p>
                    </div>
                    <Link
                      href={`/luchadores/${fighter.slug}`}
                      target="_blank"
                      className="ml-1 text-[#52525b] hover:text-white"
                    >
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                      levelStyle[fighter.level] ?? ''
                    }`}
                  >
                    {levelLabel[fighter.level] ?? fighter.level}
                  </span>
                </td>
                <td className="px-5 py-4 text-[#a1a1aa]">
                  {(fighter.gyms as unknown as { name: string } | null)?.name ?? '—'}
                </td>
                <td className="px-5 py-4 text-[#52525b]">
                  {new Date(fighter.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-5 py-4">
                  <FighterActions
                    fighterId={fighter.id}
                    isVerified={fighter.is_verified}
                    currentGymId={fighter.gym_id}
                    gyms={gyms}
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
