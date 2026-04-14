import Link from 'next/link'
import {
  Building2,
  Users,
  CalendarDays,
  Trophy,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/dashboard/StatCard'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    gymsResult,
    unverifiedGymsResult,
    fightersResult,
    unverifiedFightersResult,
    eventsResult,
    pendingEventsResult,
    titlesResult,
  ] = await Promise.all([
    supabase.from('gyms').select('id', { count: 'exact', head: true }),
    supabase.from('gyms').select('id', { count: 'exact', head: true }).eq('is_verified', false),
    supabase.from('fighters').select('id', { count: 'exact', head: true }),
    supabase.from('fighters').select('id', { count: 'exact', head: true }).eq('is_verified', false),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('titles').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const totalGyms = gymsResult.count ?? 0
  const unverifiedGyms = unverifiedGymsResult.count ?? 0
  const totalFighters = fightersResult.count ?? 0
  const unverifiedFighters = unverifiedFightersResult.count ?? 0
  const totalEvents = eventsResult.count ?? 0
  const pendingEvents = pendingEventsResult.count ?? 0
  const totalTitles = titlesResult.count ?? 0

  const pendingActions = unverifiedGyms + unverifiedFighters + pendingEvents

  // Recent gyms pending verification
  const { data: pendingGyms } = await supabase
    .from('gyms')
    .select('id, name, slug, zones(name), created_at')
    .eq('is_verified', false)
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent fighters pending verification
  const { data: pendingFighters } = await supabase
    .from('fighters')
    .select('id, name, slug, level, created_at')
    .eq('is_verified', false)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Estado global de la plataforma WebMarcial.
        </p>
      </div>

      {/* Alert banner if pending actions */}
      {pendingActions > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-800/40 bg-amber-950/30 px-5 py-4">
          <ShieldAlert size={18} className="mt-0.5 flex-shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              {pendingActions} {pendingActions === 1 ? 'acción pendiente' : 'acciones pendientes'}
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              {unverifiedGyms > 0 && `${unverifiedGyms} gimnasio${unverifiedGyms > 1 ? 's' : ''} por verificar · `}
              {unverifiedFighters > 0 && `${unverifiedFighters} peleador${unverifiedFighters > 1 ? 'es' : ''} por verificar · `}
              {pendingEvents > 0 && `${pendingEvents} evento${pendingEvents > 1 ? 's' : ''} en borrador`}
            </p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Gimnasios"
          value={totalGyms}
          subtitle={unverifiedGyms > 0 ? `${unverifiedGyms} sin verificar` : 'Todos verificados'}
          icon={<Building2 size={18} />}
          accent={unverifiedGyms > 0}
        />
        <StatCard
          title="Peleadores"
          value={totalFighters}
          subtitle={unverifiedFighters > 0 ? `${unverifiedFighters} sin verificar` : 'Todos verificados'}
          icon={<Users size={18} />}
          accent={unverifiedFighters > 0}
        />
        <StatCard
          title="Eventos"
          value={totalEvents}
          subtitle={pendingEvents > 0 ? `${pendingEvents} en borrador` : 'Sin borradores'}
          icon={<CalendarDays size={18} />}
        />
        <StatCard
          title="Títulos activos"
          value={totalTitles}
          icon={<Trophy size={18} />}
        />
      </div>

      {/* Pending verifications */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Pending gyms */}
        <div className="rounded-xl border border-[#27272a] bg-[#111111]">
          <div className="flex items-center justify-between border-b border-[#27272a] px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Gimnasios pendientes</h2>
            <Link
              href="/admin/gimnasios?filter=unverified"
              className="flex items-center gap-1 text-xs text-[#71717a] hover:text-white transition-colors"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          {(pendingGyms ?? []).length === 0 ? (
            <div className="flex items-center gap-2 px-5 py-6 text-sm text-[#52525b]">
              <CheckCircle2 size={16} className="text-green-600" />
              Ningún gimnasio pendiente de verificación
            </div>
          ) : (
            <ul className="divide-y divide-[#1c1c1c]">
              {(pendingGyms ?? []).map((gym) => (
                <li key={gym.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{gym.name}</p>
                    <p className="text-xs text-[#52525b]">
                      {(gym.zones as unknown as { name: string } | null)?.name ?? 'Sin zona'} ·{' '}
                      {new Date(gym.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <Link
                    href={`/admin/gimnasios?id=${gym.id}`}
                    className="ml-4 flex-shrink-0 rounded-md border border-[#27272a] px-3 py-1 text-xs text-[#a1a1aa] hover:border-[#dc2626] hover:text-white transition-colors"
                  >
                    Gestionar
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pending fighters */}
        <div className="rounded-xl border border-[#27272a] bg-[#111111]">
          <div className="flex items-center justify-between border-b border-[#27272a] px-5 py-4">
            <h2 className="text-sm font-semibold text-white">Peleadores pendientes</h2>
            <Link
              href="/admin/peleadores?filter=unverified"
              className="flex items-center gap-1 text-xs text-[#71717a] hover:text-white transition-colors"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          {(pendingFighters ?? []).length === 0 ? (
            <div className="flex items-center gap-2 px-5 py-6 text-sm text-[#52525b]">
              <CheckCircle2 size={16} className="text-green-600" />
              Ningún peleador pendiente de verificación
            </div>
          ) : (
            <ul className="divide-y divide-[#1c1c1c]">
              {(pendingFighters ?? []).map((fighter) => (
                <li key={fighter.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{fighter.name}</p>
                    <p className="text-xs text-[#52525b]">
                      {fighter.level === 'professional' ? 'Profesional' : 'Amateur'} ·{' '}
                      {new Date(fighter.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <Link
                    href={`/admin/peleadores?id=${fighter.id}`}
                    className="ml-4 flex-shrink-0 rounded-md border border-[#27272a] px-3 py-1 text-xs text-[#a1a1aa] hover:border-[#dc2626] hover:text-white transition-colors"
                  >
                    Gestionar
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#52525b]">
          Acceso rápido
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { href: '/admin/gimnasios', label: 'Gimnasios', icon: <Building2 size={16} /> },
            { href: '/admin/peleadores', label: 'Peleadores', icon: <Users size={16} /> },
            { href: '/admin/rankings', label: 'Rankings', icon: <Building2 size={16} /> },
            { href: '/admin/eventos', label: 'Eventos', icon: <CalendarDays size={16} /> },
            { href: '/admin/titulos', label: 'Títulos', icon: <Trophy size={16} /> },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-3 text-sm font-medium text-[#a1a1aa] transition-colors hover:border-[#3f3f46] hover:text-white"
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
              <ArrowRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
