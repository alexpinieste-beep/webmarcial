import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { RankingsDndEditor } from './RankingsDndEditor'

type Props = {
  searchParams: Promise<{ deporte?: string; peso?: string; zona?: string }>
}

export default async function AdminRankingsPage({ searchParams }: Props) {
  const { deporte, peso, zona } = await searchParams
  const supabase = await createClient()

  const [{ data: sports }, { data: zones }] = await Promise.all([
    supabase.from('sports').select('id, name, slug').order('name'),
    supabase.from('zones').select('id, name, slug').order('name'),
  ])

  // Weight classes for selected sport
  let weightClasses: { id: string; name: string; slug: string }[] = []
  if (deporte) {
    const { data: sport } = await supabase
      .from('sports')
      .select('id')
      .eq('slug', deporte)
      .single()
    if (sport) {
      const { data: wcs } = await supabase
        .from('weight_classes')
        .select('id, name, slug')
        .eq('sport_id', sport.id)
        .order('min_weight_kg', { ascending: true })
      weightClasses = wcs ?? []
    }
  }

  // Fetch rankings for current selection
  let rankings: {
    id: string
    position: number
    fighters: { id: string; name: string; nationality: string } | null
    weight_classes: { name: string } | null
  }[] = []

  if (deporte) {
    const { data: sport } = await supabase
      .from('sports')
      .select('id')
      .eq('slug', deporte)
      .single()

    if (sport) {
      let q = supabase
        .from('rankings')
        .select('id, position, fighters(id, name, nationality), weight_classes(name)')
        .eq('sport_id', sport.id)
        .order('position', { ascending: true })

      if (zona) {
        const { data: zoneRow } = await supabase
          .from('zones')
          .select('id')
          .eq('slug', zona)
          .single()
        if (zoneRow) q = q.eq('zone_id', zoneRow.id)
        else q = q.is('zone_id', null)
      } else {
        q = q.is('zone_id', null)
      }

      if (peso) {
        const wc = weightClasses.find((w) => w.slug === peso)
        if (wc) q = q.eq('weight_class_id', wc.id)
      }

      const { data } = await q
      rankings = (data ?? []) as unknown as typeof rankings
    }
  }

  const selectClass =
    'rounded-md border border-[#27272a] bg-[#18181b] px-3 py-2 text-sm text-[#a1a1aa] outline-none focus:border-[#dc2626]'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Editor de Rankings</h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Arrastra para reordenar. Guarda cuando hayas terminado.
        </p>
      </div>

      {/* Selector filters */}
      <form method="GET" className="flex flex-wrap gap-3 rounded-xl border border-[#27272a] bg-[#111111] p-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#52525b]">Deporte *</label>
          <select name="deporte" defaultValue={deporte ?? ''} className={selectClass}>
            <option value="">Selecciona deporte</option>
            {(sports ?? []).map((s) => (
              <option key={s.id} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#52525b]">Categoría de peso</label>
          <select name="peso" defaultValue={peso ?? ''} className={selectClass} disabled={!deporte}>
            <option value="">Todas</option>
            {weightClasses.map((wc) => (
              <option key={wc.id} value={wc.slug}>{wc.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#52525b]">Zona</label>
          <select name="zona" defaultValue={zona ?? ''} className={selectClass}>
            <option value="">Nacional</option>
            {(zones ?? []).map((z) => (
              <option key={z.id} value={z.slug}>{z.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="rounded-md bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Cargar
          </button>
        </div>

        {(deporte || zona) && (
          <div className="flex items-end">
            <Link
              href="/admin/rankings"
              className="rounded-md border border-[#27272a] px-4 py-2 text-sm text-[#71717a] hover:text-white"
            >
              Limpiar
            </Link>
          </div>
        )}
      </form>

      {/* Editor */}
      {!deporte ? (
        <div className="rounded-xl border border-dashed border-[#27272a] py-16 text-center text-sm text-[#52525b]">
          Selecciona un deporte para editar su ranking.
        </div>
      ) : (
        <RankingsDndEditor initialRows={rankings} />
      )}
    </div>
  )
}
