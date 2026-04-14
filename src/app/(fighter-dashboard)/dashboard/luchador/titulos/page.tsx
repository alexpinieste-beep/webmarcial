import { redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function FighterTitulosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: fighter } = await supabase
    .from('fighters')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!fighter) redirect('/registro-luchador')

  const { data: fighterTitles } = await supabase
    .from('fighter_titles')
    .select('*, titles(name, organization, sports(name), weight_classes(name), zones(name))')
    .eq('fighter_id', fighter.id)
    .is('lost_at', null)
    .order('won_at', { ascending: false })

  const titles = fighterTitles ?? []

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Títulos</h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Cinturones y títulos que ostentas actualmente.
        </p>
      </div>

      {titles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#27272a] bg-[#111111] py-16 text-center">
          <Trophy className="mb-3 text-[#52525b]" size={32} />
          <p className="text-sm font-medium text-[#71717a]">
            Aún no tienes títulos registrados.
          </p>
          <p className="mt-1 text-xs text-[#52525b]">
            Los títulos los asigna el equipo de WebMarcial tras verificar los resultados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {titles.map((ft) => {
            const title = ft.titles
            const wonDate = new Date(ft.won_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })

            return (
              <div
                key={ft.id}
                className="flex items-start gap-4 rounded-xl border border-[#27272a] bg-[#111111] p-5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#1a0a0a]">
                  <Trophy size={20} className="text-[#dc2626]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{title?.name ?? 'Título'}</p>
                  <p className="mt-0.5 text-sm text-[#a1a1aa]">
                    {title?.organization}
                    {title?.sports?.name ? ` · ${title.sports.name}` : ''}
                    {title?.weight_classes?.name ? ` · ${title.weight_classes.name}` : ''}
                    {title?.zones?.name ? ` · ${title.zones.name}` : ''}
                  </p>
                  <p className="mt-1.5 text-xs text-[#52525b]">Campeón desde {wonDate}</p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-green-950/50 px-2.5 py-1 text-xs font-medium text-green-400">
                  Vigente
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
