import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EventStatusSelect } from './EventStatusSelect'

type Props = {
  searchParams: Promise<{ status?: string; q?: string }>
}

const statusLabel: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
}
const statusStyle: Record<string, string> = {
  draft: 'bg-[#27272a] text-[#a1a1aa]',
  published: 'bg-blue-950/50 text-blue-400',
  completed: 'bg-[#14532d]/40 text-green-400',
  cancelled: 'bg-red-950/40 text-red-400',
}

export default async function AdminEventosPage({ searchParams }: Props) {
  const { status, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select('id, title, slug, event_date, status, created_at, sports(name), zones(name)')
    .order('event_date', { ascending: false })

  if (status) query = query.eq('status', status)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: events } = await query.limit(100)
  const list = events ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Eventos</h1>
          <p className="mt-1 text-sm text-[#71717a]">{list.length} eventos encontrados</p>
        </div>

        <form method="GET" className="flex flex-wrap gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por título…"
            className="rounded-md border border-[#27272a] bg-[#18181b] px-3 py-2 text-sm text-white placeholder-[#52525b] outline-none focus:border-[#dc2626]"
          />
          <select
            name="status"
            defaultValue={status ?? ''}
            className="rounded-md border border-[#27272a] bg-[#18181b] px-3 py-2 text-sm text-[#a1a1aa] outline-none focus:border-[#dc2626]"
          >
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="completed">Finalizado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-[#dc2626] px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Filtrar
          </button>
          {(status || q) && (
            <Link
              href="/admin/eventos"
              className="rounded-md border border-[#27272a] px-4 py-2 text-sm text-[#71717a] hover:text-white"
            >
              Limpiar
            </Link>
          )}
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#27272a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#27272a] bg-[#18181b] text-left text-xs font-semibold uppercase tracking-wider text-[#52525b]">
              <th className="px-5 py-3">Evento</th>
              <th className="px-5 py-3">Deporte</th>
              <th className="px-5 py-3">Zona</th>
              <th className="px-5 py-3">Fecha</th>
              <th className="px-5 py-3">Estado</th>
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
            {list.map((event) => (
              <tr key={event.id} className="hover:bg-[#161616]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{event.title}</span>
                    <Link
                      href={`/eventos/${event.slug}`}
                      target="_blank"
                      className="text-[#52525b] hover:text-white"
                    >
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#a1a1aa]">
                  {(event.sports as unknown as { name: string } | null)?.name ?? '—'}
                </td>
                <td className="px-5 py-4 text-[#a1a1aa]">
                  {(event.zones as unknown as { name: string } | null)?.name ?? 'Nacional'}
                </td>
                <td className="px-5 py-4 text-[#52525b]">
                  {new Date(event.event_date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-5 py-4">
                  <EventStatusSelect
                    eventId={event.id}
                    current={event.status as 'draft' | 'published' | 'completed' | 'cancelled'}
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
