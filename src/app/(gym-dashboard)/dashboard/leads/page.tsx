import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import LeadsTable from '@/components/dashboard/LeadsTable'
import LeadsFilters from '@/components/dashboard/LeadsFilters'
import { updateLeadStatus } from './actions'
import type { Lead } from '@/types/database'

export const metadata: Metadata = { title: 'Leads recibidos' }

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: gym } = await supabase
    .from('gyms')
    .select('id, name, subscription_tier')
    .eq('owner_id', user.id)
    .single()

  if (!gym) redirect('/registro-gimnasio')

  const { estado } = await searchParams

  let query = supabase
    .from('leads')
    .select('*')
    .eq('gym_id', gym.id)
    .order('created_at', { ascending: false })

  if (estado && ['new', 'contacted', 'converted', 'closed'].includes(estado)) {
    query = query.eq('status', estado)
  }

  const { data: leads } = await query
  const allLeads = (leads ?? []) as Lead[]

  // Counts para los filtros
  const { data: allLeadsForCount } = await supabase
    .from('leads')
    .select('status')
    .eq('gym_id', gym.id)

  const counts = {
    total: allLeadsForCount?.length ?? 0,
    new: allLeadsForCount?.filter((l) => l.status === 'new').length ?? 0,
    contacted: allLeadsForCount?.filter((l) => l.status === 'contacted').length ?? 0,
    converted: allLeadsForCount?.filter((l) => l.status === 'converted').length ?? 0,
    closed: allLeadsForCount?.filter((l) => l.status === 'closed').length ?? 0,
  }

  const isFree = gym.subscription_tier === 'free'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads recibidos</h1>
          <p className="mt-1 text-sm text-[#71717a]">
            Contactos recibidos a través de tu perfil público.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-2 text-center">
            <p className="text-2xl font-bold text-white">{counts.total}</p>
            <p className="text-xs text-[#71717a]">Total</p>
          </div>
          <div className="rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-2 text-center">
            <p className="text-2xl font-bold text-blue-400">{counts.new}</p>
            <p className="text-xs text-[#71717a]">Nuevos</p>
          </div>
          <div className="rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-2 text-center">
            <p className="text-2xl font-bold text-green-400">{counts.converted}</p>
            <p className="text-xs text-[#71717a]">Convertidos</p>
          </div>
        </div>
      </div>

      {/* Banner plan free */}
      {isFree && (
        <div className="rounded-lg border border-[#854d0e] bg-[#422006]/30 p-4">
          <p className="text-sm font-medium text-[#fbbf24]">
            Tu plan no incluye leads
          </p>
          <p className="mt-1 text-sm text-[#a16207]">
            Activa un plan Basic o Pro para recibir contactos desde tu perfil público.{' '}
            <a href="/dashboard/suscripcion" className="font-semibold text-[#fbbf24] underline">
              Ver planes
            </a>
          </p>
        </div>
      )}

      {/* Filtros */}
      <LeadsFilters currentEstado={estado} counts={counts} />

      {/* Tabla */}
      {allLeads.length === 0 ? (
        <div className="rounded-xl border border-[#27272a] bg-[#18181b] py-16 text-center">
          <p className="text-[#71717a]">
            {estado
              ? 'No hay leads con este estado.'
              : isFree
              ? 'Activa un plan de pago para empezar a recibir leads.'
              : 'Aún no has recibido leads. Cuando alguien contacte a través de tu perfil, aparecerá aquí.'}
          </p>
          {isFree && (
            <a
              href="/dashboard/suscripcion"
              className="mt-4 inline-block rounded-lg bg-[#dc2626] px-5 py-2 text-sm font-semibold text-white hover:bg-[#b91c1c]"
            >
              Ver planes
            </a>
          )}
        </div>
      ) : (
        <LeadsTable leads={allLeads} updateLeadStatus={updateLeadStatus} />
      )}
    </div>
  )
}
