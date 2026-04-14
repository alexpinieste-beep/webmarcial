import { createClient } from '@/lib/supabase/server'
import { TitleActions } from './TitleActions'
import { CreateTitleForm } from './CreateTitleForm'

export default async function AdminTitulosPage() {
  const supabase = await createClient()

  const [
    { data: titles },
    { data: sports },
    { data: allWeightClasses },
    { data: zones },
    { data: fighters },
  ] = await Promise.all([
    supabase
      .from('titles')
      .select('id, name, organization, is_active, sports(name), weight_classes(name), zones(name)')
      .order('is_active', { ascending: false })
      .order('name'),
    supabase.from('sports').select('*').order('name'),
    supabase.from('weight_classes').select('*').order('min_weight_kg', { ascending: true }),
    supabase.from('zones').select('*').order('name'),
    supabase.from('fighters').select('id, name').order('name'),
  ])

  // Get current champions for each title
  const titleIds = (titles ?? []).map((t) => t.id)
  const { data: currentHolders } = await supabase
    .from('fighter_titles')
    .select('title_id, fighter_id, fighters(id, name)')
    .in('title_id', titleIds)
    .is('lost_at', null)

  const championByTitle: Record<string, { id: string; name: string } | null> = {}
  for (const holder of currentHolders ?? []) {
    const f = holder.fighters as unknown as { id: string; name: string } | null
    championByTitle[holder.title_id] = f ?? null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Títulos</h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Gestiona los cinturones y sus campeones actuales.
        </p>
      </div>

      {/* Create form */}
      <CreateTitleForm
        sports={sports ?? []}
        allWeightClasses={allWeightClasses ?? []}
        zones={zones ?? []}
      />

      {/* Titles table */}
      <div className="overflow-x-auto rounded-xl border border-[#27272a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#27272a] bg-[#18181b] text-left text-xs font-semibold uppercase tracking-wider text-[#52525b]">
              <th className="px-5 py-3">Título</th>
              <th className="px-5 py-3">Deporte · Categoría</th>
              <th className="px-5 py-3">Zona</th>
              <th className="px-5 py-3">Campeón actual</th>
              <th className="px-5 py-3">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c1c1c] bg-[#111111]">
            {(titles ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[#52525b]">
                  Sin títulos creados aún
                </td>
              </tr>
            )}
            {(titles ?? []).map((title) => {
              const champion = championByTitle[title.id] ?? null
              return (
                <tr key={title.id} className="hover:bg-[#161616]">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{title.name}</p>
                    <p className="text-xs text-[#52525b]">{title.organization}</p>
                  </td>
                  <td className="px-5 py-4 text-[#a1a1aa]">
                    {(title.sports as unknown as { name: string } | null)?.name ?? '—'}
                    {' · '}
                    {(title.weight_classes as unknown as { name: string } | null)?.name ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-[#a1a1aa]">
                    {(title.zones as unknown as { name: string } | null)?.name ?? 'Nacional'}
                  </td>
                  <td className="px-5 py-4">
                    {champion ? (
                      <span className="font-medium text-white">{champion.name}</span>
                    ) : (
                      <span className="text-[#52525b] italic">Vacante</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <TitleActions
                      titleId={title.id}
                      isActive={title.is_active}
                      currentChampionId={champion?.id ?? null}
                      fighters={fighters ?? []}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
